import React from 'react';
import classnames from 'classnames';
import LiveCode from './LiveCode';
import MiniCode from './MiniCode';
import useWaterfallLayout from '../hooks/useWaterfallLayout';
import {getItemKey} from '../utils/waterfallLayout';
import {resolveDevicePreview} from '../utils/devicePreview';

const MeasuredExample = ({item, index, contextComponent, devicePreview, registerElement}) => {
    const setRef = (el) => registerElement(index, el);

    return (
        <div ref={setRef} className="example-driver-inner">
            {item.qrcodeUrl ? <MiniCode {...item}/> :
                <LiveCode {...item}
                          devicePreview={resolveDevicePreview(item.devicePreview, devicePreview)}
                          contextComponent={contextComponent}/>}
        </div>
    );
};

const WaterfallColumns = ({items, contextComponent, devicePreview}) => {
    const {columns, registerElement} = useWaterfallLayout(items);

    return (
        <div className="example-driver-columns">
            {columns.map((columnEntries, colIndex) => (
                <div key={colIndex} className={classnames('example-driver-item')}>
                    {columnEntries.map(({item, index}) => (
                        <MeasuredExample
                            key={getItemKey(item, index)}
                            item={item}
                            index={index}
                            contextComponent={contextComponent}
                            devicePreview={devicePreview}
                            registerElement={registerElement}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default React.memo(WaterfallColumns);
