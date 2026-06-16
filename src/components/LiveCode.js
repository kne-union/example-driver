import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import ErrorBoundary from '@kne/react-error-boundary';
import withLocale from '../withLocale';
import {useInView, useLazyCompile, useReactRoot} from '../hooks';
import DescriptionBar from './DescriptionBar';
import CodePanel from './CodePanel';
import ErrorComponent from './ErrorComponent';

// vertical padding of .example-driver-preview (42px top + 30px bottom)
const PREVIEW_VERTICAL_PADDING = 72;

const LiveCodeInner = ({code = '', scope = [], title, description, contextComponent, mounted, useInView: enableInView = true}) => {
    const [_code, setCode] = useState(code);
    const [codeOpen, setCodeOpen] = useState(false);
    const containerRef = useRef(null);
    const [previewMinHeight, setPreviewMinHeight] = useState(0);

    useEffect(() => {
        setCode(code || '');
    }, [code]);

    const useViewport = enableInView !== false && typeof mounted !== 'boolean';
    const {shouldRender: inViewShouldRender, heightRef} = useInView(containerRef, {disabled: !useViewport});
    const shouldRender = typeof mounted === 'boolean' ? mounted : (useViewport ? inViewShouldRender : true);
    const {compiledCode, error} = useLazyCompile(_code, shouldRender);

    const safeScope = useMemo(() => Array.isArray(scope) ? scope : [], [scope]);
    const currentScope = useMemo(() => safeScope.filter(({
                                                             component, name
                                                         }) => !!component && typeof name === 'string' && name), [safeScope]);

    const [renderJsx, setRenderJsx] = useState(null);

    useEffect(() => {
        if (!shouldRender) {
            setRenderJsx(null);
        }
    }, [shouldRender]);

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

    const handleHeightRecord = useCallback((h) => {
        setPreviewMinHeight(prev => Math.max(prev, h));
    }, []);

    useReactRoot(containerRef, shouldRender, renderJsx, heightRef, {onHeightRecord: handleHeightRecord});

    const previewStyle = previewMinHeight > 0
        ? {minHeight: previewMinHeight + PREVIEW_VERTICAL_PADDING + 'px'}
        : undefined;

    return <>
        <div className="example-driver-preview" ref={containerRef} style={previewStyle}/>
        <DescriptionBar title={title} description={description} codeOpen={codeOpen}
                        onToggle={() => setCodeOpen(!codeOpen)}/>
        {codeOpen && <CodePanel code={_code} scope={scope} error={error} editable onChange={setCode}/>}
    </>;
};

const LiveCode = withLocale(LiveCodeInner);

export default LiveCode;
