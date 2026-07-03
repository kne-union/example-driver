import React from 'react';
import classnames from 'classnames';
import LiveCode from './LiveCode';
import MiniCode from './MiniCode';
import useWaterfallLayout from '../hooks/useWaterfallLayout';
import {getItemKey} from '../utils/waterfallLayout';

const MeasuredExample = ({item, index, contextComponent, registerElement}) => {
    const setRef = (el) => registerElement(index, el);

    return (
        <div ref={setRef} className="example-driver-inner">
            {item.qrcodeUrl ? <MiniCode {...item}/> :
                <LiveCode {...item} contextComponent={contextComponent}/>}
        </div>
    );
};

const WaterfallColumns = ({items, contextComponent}) => {
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
                            registerElement={registerElement}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default React.memo(WaterfallColumns);
