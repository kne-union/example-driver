import React from 'react';

export const injectPreviewScope = (iframeWindow, scope) => {
    if (!iframeWindow) {
        return;
    }
    iframeWindow.React = React;
    (scope || []).forEach(({name, component}) => {
        if (name && component) {
            iframeWindow[name] = component;
        }
    });
};

const runPreviewCode = ({
    iframeWindow,
    compiledCode,
    scope,
    onRender
}) => {
    if (!iframeWindow || !compiledCode || typeof onRender !== 'function') {
        return false;
    }

    injectPreviewScope(iframeWindow, scope);

    const scopeNames = (scope || []).map(({name}) => String(name));
    const scopeValues = (scope || []).map(({component}) => component);

    // eslint-disable-next-line no-new-func
    const runnerFunction = new iframeWindow.Function(
        'React',
        'render',
        ...scopeNames,
        String(compiledCode)
    );

    runnerFunction(
        iframeWindow.React,
        onRender,
        ...scopeValues
    );
    return true;
};

export default runPreviewCode;
