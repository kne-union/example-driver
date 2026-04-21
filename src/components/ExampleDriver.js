import React, {useMemo} from 'react';
import classnames from 'classnames';
import DriverItem from './DriverItem';

const ExampleDriver = ({list, isFull, contextComponent, className, ...props}) => {
    const isFullItem = list.length < 2 || isFull;

    const groupList = useMemo(() => {
        if (isFull === true) return [list];
        return [
            list.filter((_, index) => index % 2 === 0),
            list.filter((_, index) => index % 2 !== 0)
        ];
    }, [list, isFull]);

    return (<div {...props} className={classnames("example-driver", className)}>
        {groupList.map((item, index) => <DriverItem key={index} contextComponent={contextComponent}
                                                    isFull={isFullItem} list={item}/>)}
    </div>);
};

export default React.memo(ExampleDriver);
