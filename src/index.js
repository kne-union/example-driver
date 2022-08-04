import React, {useState, useRef, useEffect} from 'react';
import ReactDOM from "react-dom/client";
import classnames from 'classnames';
import {LiveProvider, LiveEditor} from 'react-live';
import theme from './theme';
import Highlight, {Prism} from "prism-react-renderer";
import get from "lodash/get";
import {transform as _transform} from 'babel-standalone';
import {useDebouncedCallback} from 'use-debounce';
import './style.scss'

const renderCallback = (el, callback) => {
    const ProxyComponent = () => {
        useEffect(() => {
            callback();
        }, []);
        return el;
    };
    return <ProxyComponent/>;
};

const LiveCode = ({code, scope, title, description, contextComponent}) => {
    const [_code, setCode] = useState(code),
        [error, setError] = useState(null),
        [codeOpen, setCodeOpen] = useState(false),
        [minHeight, setMinHeight] = useState(0),
        runnerRef = useRef(null);
    const currentScope = scope.filter(({component, name}) => !!component && !!name);
    const debounced = useDebouncedCallback((_code) => {
            const runner = runnerRef.current,
                root = ReactDOM.createRoot(runner),
                beforeHeight = get(runner, 'clientHeight', 0);
            const promise = Promise.resolve()
                .then(() => {
                    return _transform(_code, {presets: ['es2015', 'react']}).code;
                })
                .then(runCode => {
                    return new Function(
                        'React',
                        'render',
                        ...currentScope.map(({name}) => name),
                        runCode
                    );
                })
                .then(runnerFunction => {
                    runnerFunction(
                        React,
                        (customComponent) => {
                            const Component = contextComponent || (({children}) => {
                                return children;
                            });
                            root.render(<Component>{renderCallback(customComponent, () => {
                                //只允许预览区域的高度增加，防止在编辑代码的时候预览区域高度反复跳动
                                setMinHeight(
                                    Math.max(get(runner, 'clientHeight', 0), beforeHeight)
                                );
                            })}</Component>);
                        },
                        ...currentScope.map(({component}) => component)
                    );
                    setError(null);
                })
                .catch(error => {
                    setError(error);
                });
            return () => {
                promise.then(() => {
                    root.unmount();
                });
            };
        },
        1000
    );

    useEffect(() => {
        setCode(code);
        setCodeOpen(false);
    }, [code]);

    useEffect(() => {
        return debounced(_code);
    }, [_code]);
    return <LiveProvider code={_code} theme={theme}>
        <div className="example-driver-preview">
            <div
                className="example-driver-runner"
                ref={runnerRef}
                style={{minHeight}}
            />
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
        {codeOpen ? (
            <>
                <div className="example-driver-code">
                    <div className="example-driver-code-import">
                        <Highlight
                            Prism={Prism}
                            code={`
import React from 'react';
${scope.map(({name, packageName, importStatement}) =>
                                importStatement ? importStatement : (name ? `import * as ${name} from '${packageName}';` : `import '${packageName}';`)
                            )
                                .join('\n')}
`}
                            theme={theme}
                            language="jsx">
                            {({tokens, getLineProps, getTokenProps}) => (
                                <>
                                    {tokens.map((line, i) => (
                                        <div {...getLineProps({line, key: i})}>
                                            {line.map((token, key) => (
                                                <span {...getTokenProps({token, key})} />
                                            ))}
                                        </div>
                                    ))}
                                </>
                            )}
                        </Highlight>
                    </div>
                    <LiveEditor ignoreTabKey={true} onChange={setCode}/>
                </div>
                <div className="example-driver-error">
                    {error && <pre>{error.message}</pre>}
                </div>
            </>
        ) : null}
    </LiveProvider>;
};

const DriverItem = ({isFull, contextComponent, list}) => {
    return <div className={classnames('example-driver-item', {
        'is-full': isFull
    })}>
        {list.map((props, index) => {
            return <div key={props.title + '_' + index} className="example-driver-inner">
                <LiveCode {...props} contextComponent={contextComponent}/>
            </div>
        })}
    </div>
};

const ExampleDriver = ({list, isFull, contextComponent, className, ...props}) => {
    const groupList = isFull === true ? [list] : [list.filter((item, index) => index % 2 === 0), list.filter((item, index) => index % 2 !== 0)];
    return (
        <div {...props} className={classnames("example-driver", className)}>
            {groupList.map((item, index) => <DriverItem key={index} contextComponent={contextComponent}
                                                        isFull={list.length < 2 || isFull} list={item}/>)}
        </div>
    );
};

export default ExampleDriver;
