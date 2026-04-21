import React, {useEffect, useRef, useState, useMemo} from 'react';
import ErrorBoundary from '@kne/react-error-boundary';
import withLocale from '../withLocale';
import {useInView, useLazyCompile, useReactRoot} from '../hooks';
import DescriptionBar from './DescriptionBar';
import CodePanel from './CodePanel';
import ErrorComponent from './ErrorComponent';

const LiveCodeInner = ({code = '', scope = [], title, description, contextComponent, mounted, useInView: enableInView = true}) => {
    const [_code, setCode] = useState(code);
    const [codeOpen, setCodeOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        setCode(code || '');
    }, [code]);

    const useViewport = enableInView !== false && typeof mounted !== 'boolean';
    const {shouldRender: inViewShouldRender, heightRef} = useInView(containerRef, {disabled: !useViewport});
    // mounted has highest priority; otherwise use viewport if enabled, else always render
    const shouldRender = typeof mounted === 'boolean' ? mounted : (useViewport ? inViewShouldRender : true);
    const {compiledCode, error} = useLazyCompile(_code, shouldRender);

    const safeScope = useMemo(() => Array.isArray(scope) ? scope : [], [scope]);
    const currentScope = useMemo(() => safeScope.filter(({
                                                             component, name
                                                         }) => !!component && typeof name === 'string' && name), [safeScope]);

    const [renderJsx, setRenderJsx] = useState(null);

    useEffect(() => {
        if (!compiledCode || !shouldRender) return;
        try {
            // eslint-disable-next-line no-new-func
            const runnerFunction = new Function('React', 'render', ...currentScope.map(({name}) => String(name)), String(compiledCode));
            const Component = contextComponent || (({children}) => children);
            runnerFunction(React, jsx => setRenderJsx(<ErrorBoundary errorComponent={ErrorComponent}>
                <Component>{jsx}</Component>
            </ErrorBoundary>), ...currentScope.map(({component}) => component));
        } catch (e) {
            setRenderJsx(null);
        }
    }, [compiledCode, currentScope, contextComponent, shouldRender]);

    useReactRoot(containerRef, shouldRender, renderJsx, heightRef);

    return <>
        <div className="example-driver-preview" ref={containerRef}/>
        <DescriptionBar title={title} description={description} codeOpen={codeOpen}
                        onToggle={() => setCodeOpen(!codeOpen)}/>
        {codeOpen && <CodePanel code={_code} scope={scope} error={error} editable onChange={setCode}/>}
    </>;
};

const LiveCode = withLocale(LiveCodeInner);

export default LiveCode;
