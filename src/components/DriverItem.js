import React from 'react';
import classnames from 'classnames';
import LiveCode from './LiveCode';
import MiniCode from './MiniCode';
import {resolveDevicePreview} from '../utils/devicePreview';

const DriverItem = ({isFull, devicePreview, contextComponent, list}) => {
    return <div className={classnames('example-driver-item', {'is-full': isFull})}>
        {list.map((props, index) => (
            <div key={(props.title || 'example') + '_' + index} className="example-driver-inner">
                {props.qrcodeUrl ? <MiniCode {...props}/> :
                    <LiveCode {...props}
                              devicePreview={resolveDevicePreview(props.devicePreview, devicePreview)}
                              contextComponent={contextComponent}/>}
            </div>
        ))}
    </div>;
};

export default React.memo(DriverItem);
