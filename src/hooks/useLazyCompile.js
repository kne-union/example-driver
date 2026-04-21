import {useState, useEffect, useRef, useCallback} from 'react';
import {transform as _transform} from '@babel/standalone';
import {useDebouncedCallback} from 'use-debounce';

const COMPILE_PRESETS = ['es2015', 'react'];
const COMPILE_CACHE_LIMIT = 200;
const compileCache = new Map();

// Limit compile "concurrency" (actually scheduling) to avoid a long main-thread block
// when lots of cards enter the viewport at once.
const COMPILE_MAX_INFLIGHT = 1;
let inflight = 0;
let pumpScheduled = false;
const jobsByKey = new Map();
const queue = [];

const hashString = (str) => {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
        h = ((h << 5) + h) ^ str.charCodeAt(i);
    }
    return (h >>> 0).toString(16);
};

const getCacheKey = (code) => {
    const meta = 'presets=' + COMPILE_PRESETS.join(',') + '|babel=standalone';
    return hashString(meta + '\u0000' + code) + ':' + code.length;
};

const cacheGet = (key) => {
    if (!compileCache.has(key)) return null;
    const v = compileCache.get(key);
    compileCache.delete(key);
    compileCache.set(key, v);
    return v;
};

const cacheSet = (key, value) => {
    if (compileCache.has(key)) compileCache.delete(key);
    compileCache.set(key, value);
    if (compileCache.size > COMPILE_CACHE_LIMIT) {
        const firstKey = compileCache.keys().next().value;
        compileCache.delete(firstKey);
    }
};

const compileSync = (codeToCompile) => {
    const key = getCacheKey(codeToCompile);
    const cached = cacheGet(key);
    if (cached) return cached;
    const transformCode = _transform(codeToCompile, {presets: COMPILE_PRESETS}).code;
    cacheSet(key, transformCode);
    return transformCode;
};

const schedulePump = () => {
    if (pumpScheduled) return;
    pumpScheduled = true;
    setTimeout(() => {
        pumpScheduled = false;
        pump();
    }, 0);
};

const pump = () => {
    if (inflight >= COMPILE_MAX_INFLIGHT) return;
    const job = queue.shift();
    if (!job) return;

    jobsByKey.delete(job.key);
    inflight += 1;

    const run = () => {
        let compiled = null;
        let err = null;
        try {
            compiled = compileSync(job.code);
        } catch (e) {
            err = e;
        }

        inflight -= 1;
        job.listeners.forEach(fn => fn(compiled, err));
        schedulePump();
    };

    // priority jobs run ASAP; non-priority jobs yield to idle time when possible
    if (!job.priority && typeof requestIdleCallback === 'function') {
        requestIdleCallback(() => run(), {timeout: 1000});
    } else {
        setTimeout(run, 0);
    }
};

const enqueueCompile = (key, code, priority, listener) => {
    const existing = jobsByKey.get(key);
    if (existing) {
        existing.listeners.push(listener);
        if (priority && !existing.priority) {
            existing.priority = true;
            const idx = queue.indexOf(existing);
            if (idx > 0) {
                queue.splice(idx, 1);
                queue.unshift(existing);
            }
        }
        return;
    }

    const job = {key, code, priority: !!priority, listeners: [listener]};
    jobsByKey.set(key, job);
    if (job.priority) {
        queue.unshift(job);
    } else {
        queue.push(job);
    }
    schedulePump();
};

const useLazyCompile = (code, shouldCompile) => {
    const [compiledCode, setCompiledCode] = useState(null);
    const [error, setError] = useState(null);

    const prevShouldCompileRef = useRef(false);
    const requestTokenRef = useRef(0);

    const compileImpl = useCallback((codeToCompile, priority) => {
        if (!codeToCompile) {
            setError(null);
            setCompiledCode(null);
            return;
        }

        const token = ++requestTokenRef.current;
        const key = getCacheKey(codeToCompile);

        const cached = cacheGet(key);
        if (cached) {
            setError(null);
            setCompiledCode(cached);
            return;
        }

        enqueueCompile(key, codeToCompile, priority, (compiled, err) => {
            if (requestTokenRef.current !== token) return;
            if (err) {
                setError(err);
                setCompiledCode(null);
                return;
            }
            setError(null);
            setCompiledCode(compiled);
        });
    }, []);

    const compileDebounced = useDebouncedCallback((codeToCompile) => {
        compileImpl(codeToCompile, false);
    }, 500);

    useEffect(() => {
        if (!shouldCompile) {
            prevShouldCompileRef.current = false;
            if (typeof compileDebounced.cancel === 'function') {
                compileDebounced.cancel();
            }
            return;
        }

        const entering = prevShouldCompileRef.current === false;
        prevShouldCompileRef.current = true;

        // first visible: enqueue as priority (ASAP), but still go through scheduler to avoid massive burst
        if (entering) {
            if (typeof compileDebounced.cancel === 'function') {
                compileDebounced.cancel();
            }
            compileImpl(code, true);
            return;
        }

        compileDebounced(code);
    }, [code, shouldCompile, compileDebounced, compileImpl]);

    return {compiledCode, error};
};

export default useLazyCompile;
