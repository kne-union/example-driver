import React, {useEffect, useRef, useState, useMemo} from 'react';
import ErrorBoundary from '@kne/react-error-boundary';
import withLocale from '../withLocale';
import {useInView, useLazyCompile, useReactRoot} from '../hooks';
import DescriptionBar from './DescriptionBar';
import CodePanel from './CodePanel';
import ErrorComponent from './ErrorComponent';

const LiveCodeInner = ({code, scope, title, description, contextComponent}) => {
    const [_code, setCode] = useState(code);
    const [codeOpen, setCodeOpen] = useState(false);
    const containerRef = useRef(null);

    const {shouldRender, heightRef} = useInView(containerRef);
    const {compiledCode, error} = useLazyCompile(_code, shouldRender);

    const currentScope = useMemo(() => scope.filter(({component, name}) => !!component && !!name), [scope]);

    const [renderJsx, setRenderJsx] = useState(null);

    useEffect(() => {
        if (!compiledCode || !shouldRender) return;
        try {
            // eslint-disable-next-line no-new-func
            const runnerFunction = new Function('React', 'render', ...currentScope.map(({name}) => name), compiledCode);
            const Component = contextComponent || (({children}) => children);
            runnerFunction(React, jsx => setRenderJsx(
                <ErrorBoundary errorComponent={ErrorComponent}>
                    <Component>{jsx}</Component>
                </ErrorBoundary>
            ), ...currentScope.map(({component}) => component));
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
