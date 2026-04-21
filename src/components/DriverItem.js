import React from 'react';
import classnames from 'classnames';
import LiveCode from './LiveCode';
import MiniCode from './MiniCode';

const DriverItem = ({isFull, contextComponent, list}) => {
    return <div className={classnames('example-driver-item', {'is-full': isFull})}>
        {list.map((props, index) => (
            <div key={(props.title || 'example') + '_' + index} className="example-driver-inner">
                {props.qrcodeUrl ? <MiniCode {...props}/> :
                    <LiveCode {...props} contextComponent={contextComponent}/>}
            </div>
        ))}
    </div>;
};

export default React.memo(DriverItem);
