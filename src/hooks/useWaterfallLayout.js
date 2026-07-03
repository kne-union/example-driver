import {useCallback, useEffect, useRef, useState} from 'react';
import {useDebouncedCallback} from 'use-debounce';
import {assignWaterfallColumns, columnsEqual} from '../utils/waterfallLayout';

const useWaterfallLayout = (items) => {
    const itemsRef = useRef(items);
    itemsRef.current = items;

    const [columns, setColumns] = useState(() => assignWaterfallColumns(items, {}));
    const heightsRef = useRef({});
    const observerRef = useRef(null);
    const elementMapRef = useRef(new Map());
    const rafRef = useRef(null);

    const recalculate = useCallback(() => {
        const next = assignWaterfallColumns(itemsRef.current, heightsRef.current);
        setColumns((prev) => (columnsEqual(prev, next) ? prev : next));
    }, []);

    const scheduleRecalculate = useDebouncedCallback(() => {
        recalculate();
    }, 100);

    const measureAll = useCallback(() => {
        let changed = false;
        elementMapRef.current.forEach((el, index) => {
            if (!el) return;
            const h = el.getBoundingClientRect().height;
            if (h > 0 && heightsRef.current[index] !== h) {
                heightsRef.current[index] = h;
                changed = true;
            }
        });
        if (changed) {
            scheduleRecalculate();
        }
    }, [scheduleRecalculate]);

    const ensureObserver = useCallback(() => {
        if (observerRef.current) return;
        if (typeof window === 'undefined' || typeof window.ResizeObserver !== 'function') return;

        const ro = new window.ResizeObserver(() => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = null;
                measureAll();
            });
        });
        elementMapRef.current.forEach((el) => {
            if (el) ro.observe(el);
        });
        observerRef.current = ro;
    }, [measureAll]);

    const registerElement = useCallback((index, el) => {
        const prev = elementMapRef.current.get(index);
        if (prev === el) return;

        if (observerRef.current && prev) {
            observerRef.current.unobserve(prev);
        }

        if (el) {
            elementMapRef.current.set(index, el);
            if (observerRef.current) {
                observerRef.current.observe(el);
            }
        } else {
            elementMapRef.current.delete(index);
            delete heightsRef.current[index];
        }

        ensureObserver();

        if (el) {
            requestAnimationFrame(() => {
                const h = el.getBoundingClientRect().height;
                if (h > 0 && heightsRef.current[index] !== h) {
                    heightsRef.current[index] = h;
                    scheduleRecalculate();
                }
            });
        }
    }, [ensureObserver, scheduleRecalculate]);

    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }
        heightsRef.current = {};
        elementMapRef.current = new Map();
        setColumns(assignWaterfallColumns(items, {}));
    }, [items]);

    useEffect(() => {
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
            scheduleRecalculate.cancel();
        };
    }, [scheduleRecalculate]);

    return {columns, registerElement};
};

export default useWaterfallLayout;
