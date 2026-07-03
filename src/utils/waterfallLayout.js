export const getItemKey = (item, index) => (item.title || 'example') + '_' + index;

export const partitionList = (list) => {
    const fullItems = [];
    const normalItems = [];
    (list || []).forEach((item) => {
        if (item.isFull === true) {
            fullItems.push(item);
        } else {
            normalItems.push(item);
        }
    });
    return {fullItems, normalItems};
};

export const assignWaterfallColumns = (items, heights) => {
    const left = [];
    const right = [];
    let leftH = 0;
    let rightH = 0;

    (items || []).forEach((item, index) => {
        const h = heights[index] ?? 0;
        const placeLeft = leftH < rightH || (leftH === rightH && left.length <= right.length);
        if (placeLeft) {
            left.push({item, index});
            leftH += h;
        } else {
            right.push({item, index});
            rightH += h;
        }
    });

    return [left, right];
};

export const columnsEqual = (a, b) => {
    if (!a || !b || a.length !== b.length) return false;
    for (let col = 0; col < a.length; col++) {
        const colA = a[col];
        const colB = b[col];
        if (colA.length !== colB.length) return false;
        for (let i = 0; i < colA.length; i++) {
            if (colA[i].index !== colB[i].index) return false;
        }
    }
    return true;
};
