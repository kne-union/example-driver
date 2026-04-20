import React from 'react';
import classnames from 'classnames';
import uniqueId from 'lodash/uniqueId';
import LiveCode from './LiveCode';
import MiniCode from './MiniCode';

const DriverItem = ({isFull, contextComponent, list}) => {
    return <div className={classnames('example-driver-item', {'is-full': isFull})}>
        {list.map((props) => (
            <div key={props.title + '_' + uniqueId()} className="example-driver-inner">
                {props.hasOwnProperty('qrcodeUrl') ? <MiniCode {...props}/> :
                    <LiveCode {...props} contextComponent={contextComponent}/>}
            </div>
        ))}
    </div>;
};

export default DriverItem;
