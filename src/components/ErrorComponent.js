import React, {memo} from 'react';

const ErrorComponent = memo(({error}) => {
    return (<div className="example-driver-error">
        {error && <pre>{typeof error === 'string' ? error : error?.message}</pre>}
    </div>);
});

export default ErrorComponent;
