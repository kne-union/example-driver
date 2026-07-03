import {partitionList, assignWaterfallColumns, columnsEqual, getItemKey} from '../waterfallLayout';

describe('waterfallLayout', () => {
    describe('getItemKey', () => {
        it('should use title and index', () => {
            expect(getItemKey({title: 'Foo'}, 2)).toBe('Foo_2');
            expect(getItemKey({}, 0)).toBe('example_0');
        });
    });

    describe('partitionList', () => {
        it('should split full and normal items preserving order', () => {
            const list = [
                {title: 'a'},
                {title: 'b', isFull: true},
                {title: 'c'},
                {title: 'd', isFull: true},
            ];
            const {fullItems, normalItems} = partitionList(list);
            expect(fullItems.map((i) => i.title)).toEqual(['b', 'd']);
            expect(normalItems.map((i) => i.title)).toEqual(['a', 'c']);
        });

        it('should handle empty list', () => {
            const {fullItems, normalItems} = partitionList([]);
            expect(fullItems).toEqual([]);
            expect(normalItems).toEqual([]);
        });

        it('should treat non-true isFull as normal', () => {
            const {fullItems, normalItems} = partitionList([
                {title: 'a', isFull: false},
                {title: 'b'},
            ]);
            expect(fullItems).toEqual([]);
            expect(normalItems).toHaveLength(2);
        });
    });

    describe('assignWaterfallColumns', () => {
        it('should alternate when heights are unknown', () => {
            const items = [{title: 'a'}, {title: 'b'}, {title: 'c'}, {title: 'd'}];
            const [left, right] = assignWaterfallColumns(items, {});
            expect(left.map((e) => e.item.title)).toEqual(['a', 'c']);
            expect(right.map((e) => e.item.title)).toEqual(['b', 'd']);
        });

        it('should assign to shorter column by height', () => {
            const items = [{title: 'a'}, {title: 'b'}, {title: 'c'}];
            const heights = {0: 300, 1: 100, 2: 150};
            const [left, right] = assignWaterfallColumns(items, heights);
            expect(left.map((e) => e.item.title)).toEqual(['a']);
            expect(right.map((e) => e.item.title)).toEqual(['b', 'c']);
        });

        it('should handle empty items', () => {
            const [left, right] = assignWaterfallColumns([], {});
            expect(left).toEqual([]);
            expect(right).toEqual([]);
        });
    });

    describe('columnsEqual', () => {
        it('should compare column assignments by index', () => {
            const a = [[{item: {}, index: 0}], [{item: {}, index: 1}]];
            const b = [[{item: {}, index: 0}], [{item: {}, index: 1}]];
            const c = [[{item: {}, index: 1}], [{item: {}, index: 0}]];
            expect(columnsEqual(a, b)).toBe(true);
            expect(columnsEqual(a, c)).toBe(false);
        });
    });
});
