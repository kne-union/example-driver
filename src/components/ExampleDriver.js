import React from 'react';
import classnames from 'classnames';
import DriverItem from './DriverItem';

const ExampleDriver = ({list, isFull, contextComponent, className, ...props}) => {
    const groupList = isFull === true ? [list] : [list.filter((_, index) => index % 2 === 0), list.filter((_, index) => index % 2 !== 0)];
    return (<div {...props} className={classnames("example-driver", className)}>
        {groupList.map((item, index) => <DriverItem key={index} contextComponent={contextComponent}
                                                    isFull={list.length < 2 || isFull} list={item}/>)}
    </div>);
};

export default ExampleDriver;
