import {useCallback, useEffect, useRef, useState} from 'react';

export const HEIGHT_STABILITY_MS = 1000;

const useStableHeight = (stabilityMs = HEIGHT_STABILITY_MS) => {
    const stableRef = useRef(0);
    const lastMeasuredRef = useRef(0);
    const timerRef = useRef(null);
    const [stableHeight, setStableHeight] = useState(0);

    const commitStableHeight = useCallback((next) => {
        if (next <= 0 || next === stableRef.current) {
            return;
        }
        stableRef.current = next;
        setStableHeight(next);
    }, []);

    const reportHeight = useCallback((h) => {
        if (h <= 0) {
            return stableRef.current;
        }

        lastMeasuredRef.current = h;

        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (h >= stableRef.current) {
            commitStableHeight(h);
            return h;
        }

        timerRef.current = setTimeout(() => {
            timerRef.current = null;
            const latest = lastMeasuredRef.current;
            if (latest > 0 && latest <= stableRef.current) {
                commitStableHeight(latest);
            }
        }, stabilityMs);

        return stableRef.current;
    }, [stabilityMs, commitStableHeight]);

    const reset = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        stableRef.current = 0;
        lastMeasuredRef.current = 0;
        setStableHeight(0);
    }, []);

    useEffect(() => () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    }, []);

    return {stableHeight, stableRef, reportHeight, reset};
};

export default useStableHeight;
