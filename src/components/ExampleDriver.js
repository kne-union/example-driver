import React, {useMemo} from 'react';
import classnames from 'classnames';
import DriverItem from './DriverItem';
import WaterfallColumns from './WaterfallColumns';
import {partitionList, getItemKey} from '../utils/waterfallLayout';

const ExampleDriver = ({list, isFull, devicePreview, contextComponent, className, ...props}) => {
    const isFullLayout = isFull === true || list.length < 2;

    const {fullItems, normalItems} = useMemo(() => {
        if (isFullLayout) {
            return {fullItems: [], normalItems: list};
        }
        return partitionList(list);
    }, [list, isFullLayout]);

    if (isFullLayout) {
        return (
            <div {...props} className={classnames('example-driver', className)}>
                <DriverItem isFull devicePreview={devicePreview} contextComponent={contextComponent} list={list}/>
            </div>
        );
    }

    return (
        <div {...props} className={classnames('example-driver', className)}>
            {fullItems.map((item, index) => (
                <DriverItem
                    key={getItemKey(item, index)}
                    isFull
                    contextComponent={contextComponent}
                    devicePreview={devicePreview}
                    list={[item]}
                />
            ))}
            {normalItems.length > 0 && (
                <WaterfallColumns items={normalItems} devicePreview={devicePreview} contextComponent={contextComponent}/>
            )}
        </div>
    );
};

export default React.memo(ExampleDriver);
