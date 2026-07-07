import React from 'react';

const runPreviewCode = ({
    compiledCode,
    scope,
    onRender
}) => {
    if (!compiledCode || typeof onRender !== 'function') {
        return false;
    }

    const scopeNames = (scope || []).map(({name}) => String(name));
    const scopeValues = (scope || []).map(({component}) => component);

    // eslint-disable-next-line no-new-func
    const runnerFunction = new Function(
        'React',
        'render',
        ...scopeNames,
        String(compiledCode)
    );

    runnerFunction(React, onRender, ...scopeValues);
    return true;
};

export default runPreviewCode;
