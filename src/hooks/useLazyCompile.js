import {useState, useEffect} from 'react';
import {transform as _transform} from '@babel/standalone';
import {useDebouncedCallback} from 'use-debounce';

const useLazyCompile = (code, shouldCompile) => {
    const [compiledCode, setCompiledCode] = useState(null);
    const [error, setError] = useState(null);

    const compileCode = useDebouncedCallback((codeToCompile) => {
        if (!codeToCompile) {
            setCompiledCode(null);
            return;
        }
        try {
            setError(null);
            const transformCode = _transform(codeToCompile, {presets: ['es2015', 'react']}).code;
            setCompiledCode(transformCode);
        } catch (e) {
            setError(e);
            setCompiledCode(null);
        }
    }, 500);

    useEffect(() => {
        if (shouldCompile) {
            compileCode(code);
        }
    }, [code, shouldCompile, compileCode]);

    return {compiledCode, error};
};

export default useLazyCompile;
