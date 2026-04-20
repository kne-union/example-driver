import React, {useEffect, useRef, useState, useMemo, memo} from 'react';
import {createRoot} from 'react-dom/client';
import classnames from 'classnames';
import theme from './theme';
import Highlight, {Prism} from "prism-react-renderer";
import ErrorBoundary from '@kne/react-error-boundary';
import uniqueId from 'lodash/uniqueId';
import {transform as _transform} from '@babel/standalone';
import CodeEditor from '@monaco-editor/react';
import monacoLoader from '@monaco-editor/loader';
import {useDebouncedCallback} from 'use-debounce';
import './style.scss'

const HighlightCode = ({code}) => {
    return <Highlight
        Prism={Prism}
        code={code}
        theme={theme}
        language="jsx">
        {({tokens, getLineProps, getTokenProps}) => (<>
            {tokens.map((line, i) => (<div {...getLineProps({line, key: i})}>
                {line.map((token, key) => (<span {...getTokenProps({token, key})} />))}
            </div>))}
        </>)}
    </Highlight>
};

const ErrorComponent = memo(({error}) => {
    return (<div className="example-driver-error">
        {error && <pre>{typeof error === 'string' ? error : error?.message}</pre>}
    </div>);
});

const LiveCode = ({code, scope, title, description, contextComponent}) => {
    const [_code, setCode] = useState(code), [error, setError] = useState(null), [codeOpen, setCodeOpen] = useState(false), [minHeight, setMinHeight] = useState(0),
        containerRef = useRef(null);
    const reactRootRef = useRef(null);
    const [renderJsx, setRenderJsx] = useState(null);
    const [compiledCode, setCompiledCode] = useState(null);
    const [shouldRender, setShouldRender] = useState(false);
    const currentScope = useMemo(() => scope.filter(({component, name}) => !!component && !!name), [scope]);

    // 防抖编译函数，避免频繁编译
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
        compileCode(_code);
    }, [_code, compileCode]);

    // 视口检测
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                // 部分进入视口时开始渲染
                if (entry.isIntersecting) {
                    setShouldRender(true);
                }
                // 完全离开视口时先清空 renderJsx 让 React unmount
                if (!entry.isIntersecting && entry.intersectionRatio === 0) {
                    setRenderJsx(null);
                    setShouldRender(false);
                }
            });
        }, {threshold: [0, 1]});

        observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!compiledCode || !shouldRender) return;

        try {
            setError(null);
            // eslint-disable-next-line no-new-func
            const runnerFunction = new Function('React', 'render', ...currentScope.map(({name}) => name), compiledCode)
            const Component = contextComponent || (({children}) => {
                return children;
            });
            runnerFunction(React, jsx => setRenderJsx(<ErrorBoundary
                errorComponent={ErrorComponent}><Component>{jsx}</Component></ErrorBoundary>), ...currentScope.map(({component}) => component));
        } catch (e) {
            setError(e);
        }
    }, [compiledCode, currentScope, contextComponent, shouldRender]);

    // 渲染逻辑 - 统一处理渲染和卸载
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // 需要卸载时（shouldRender 为 false 或 renderJsx 为 null）
        if (!shouldRender || !renderJsx) {
            if (reactRootRef.current) {
                const root = reactRootRef.current;
                reactRootRef.current = null;
                // 使用微任务延迟卸载，等待 React 完成当前渲染周期
                queueMicrotask(() => {
                    root.unmount();
                    if (container) {
                        container.innerHTML = '';
                    }
                });
            }
            return;
        }

        // 渲染新内容
        if (reactRootRef.current) {
            reactRootRef.current.unmount();
        }
        container.innerHTML = '';

        const root = document.createElement('div');
        root.className = 'example-driver-runner';
        container.appendChild(root);
        const reactRoot = createRoot(root);
        reactRootRef.current = reactRoot;
        reactRoot.render(renderJsx);
        setMinHeight((height) => {
            return Math.max(height, root.getBoundingClientRect().height);
        });
    }, [shouldRender, renderJsx]);

    return <>
        <div className="example-driver-preview" ref={containerRef} style={{minHeight: minHeight + 'px'}}>
            {/* React 组件通过 createRoot 动态渲染到这里 */}
        </div>
        <div className="example-driver-des">
            <span className="example-driver-title">{title}</span>
            <div dangerouslySetInnerHTML={{__html: description}}/>
            <span
                className="example-driver-switch"
                onClick={() => setCodeOpen(!codeOpen)}>
          {codeOpen ? '</>' : '< >'}
        </span>
        </div>
        {codeOpen ? (<>
            <div className="example-driver-code">
                <div className="example-driver-code-import">
                    <HighlightCode code={`
import React from 'react';
${scope.map(({
                                                           name, packageName, importStatement
                                                       }) => importStatement ? importStatement : (name ? `import * as ${name} from '${packageName}';` : `import '${packageName}';`))
                        .join('\n')}
`}/>
                </div>
                <CodeEditor height="800px" defaultLanguage="javascript" defaultValue={_code} onChange={setCode}
                            loading="正在加载代码编辑器..."/>
            </div>
            {error && <ErrorComponent error={error.message}/>}
        </>) : null}
    </>;
};

const MiniCode = ({code, qrcodeUrl, scope, title, description}) => {
    const [codeOpen, setCodeOpen] = useState(false);
    return <>
        <div className="example-driver-preview">
            <div className="example-driver-runner">
                <div className="example-driver-mini-code"><img src={qrcodeUrl} alt="示例"/></div>
                <div className="example-driver-mini-title">请扫描二维码查看示例程序</div>
            </div>
        </div>
        <div className="example-driver-des">
            <span className="example-driver-title">{title}</span>
            <div dangerouslySetInnerHTML={{__html: description}}/>
            <span
                className="example-driver-switch"
                onClick={() => setCodeOpen(!codeOpen)}>
          {codeOpen ? '</>' : '< >'}
        </span>
        </div>
        {codeOpen ? (<>
            <div className="example-driver-code">
                <div className="example-driver-code-import">
                    <HighlightCode code={`
import React from 'react';
${scope.map(({
                                                           name, packageName, importStatement
                                                       }) => importStatement ? importStatement : (name ? `import * as ${name} from '${packageName}';` : `import '${packageName}';`))
                        .join('\n')}
`}/>
                </div>
                <CodeEditor height="800px" defaultLanguage="javascript" defaultValue={code}
                            loading="正在加载代码编辑器..." options={{readOnly: true}}/>
            </div>
        </>) : null}
    </>
};

const DriverItem = ({isFull, contextComponent, list}) => {
    return <div className={classnames('example-driver-item', {
        'is-full': isFull
    })}>
        {list.map((props) => {
            return <div key={props.title + '_' + uniqueId()} className="example-driver-inner">
                {props.hasOwnProperty('qrcodeUrl') ? <MiniCode {...props}/> :
                    <LiveCode {...props} contextComponent={contextComponent}/>}
            </div>
        })}
    </div>
};

const ExampleDriver = ({list, isFull, contextComponent, className, ...props}) => {
    const groupList = isFull === true ? [list] : [list.filter((item, index) => index % 2 === 0), list.filter((item, index) => index % 2 !== 0)];
    return (<div {...props} className={classnames("example-driver", className)}>
        {groupList.map((item, index) => <DriverItem key={index} contextComponent={contextComponent}
                                                    isFull={list.length < 2 || isFull} list={item}/>)}
    </div>);
};

export default ExampleDriver;
export const config = monacoLoader.config;
