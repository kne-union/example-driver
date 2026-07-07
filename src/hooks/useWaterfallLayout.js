import {useCallback, useEffect, useRef, useState} from 'react';
import {useDebouncedCallback} from 'use-debounce';
import {assignWaterfallColumns, columnsEqual} from '../utils/waterfallLayout';

const useWaterfallLayout = (items) => {
    const itemsRef = useRef(items);
    itemsRef.current = items;

    const [columns, setColumns] = useState(() => assignWaterfallColumns(items, {}));
    const heightsRef = useRef({});
    const elementMapRef = useRef(new Map());
    const mutationObserverMapRef = useRef(new Map());
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

    const scheduleMeasure = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            measureAll();
        });
    }, [measureAll]);

    const disconnectElementObserver = useCallback((index) => {
        const observer = mutationObserverMapRef.current.get(index);
        if (observer) {
            observer.disconnect();
            mutationObserverMapRef.current.delete(index);
        }
    }, []);

    const connectElementObserver = useCallback((index, el) => {
        disconnectElementObserver(index);
        if (!el || typeof MutationObserver === 'undefined') {
            return;
        }

        const observer = new MutationObserver(() => {
            scheduleMeasure();
        });
        observer.observe(el, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        });
        mutationObserverMapRef.current.set(index, observer);
    }, [disconnectElementObserver, scheduleMeasure]);

    const registerElement = useCallback((index, el) => {
        const prev = elementMapRef.current.get(index);
        if (prev === el) return;

        disconnectElementObserver(index);

        if (el) {
            elementMapRef.current.set(index, el);
            connectElementObserver(index, el);
        } else {
            elementMapRef.current.delete(index);
            delete heightsRef.current[index];
        }

        if (el) {
            requestAnimationFrame(() => {
                const h = el.getBoundingClientRect().height;
                if (h > 0 && heightsRef.current[index] !== h) {
                    heightsRef.current[index] = h;
                    scheduleRecalculate();
                }
            });
        }
    }, [connectElementObserver, disconnectElementObserver, scheduleRecalculate]);

    useEffect(() => {
        const onResize = () => scheduleMeasure();
        window.addEventListener('resize', onResize, {passive: true});
        return () => window.removeEventListener('resize', onResize);
    }, [scheduleMeasure]);

    useEffect(() => {
        mutationObserverMapRef.current.forEach((observer) => observer.disconnect());
        mutationObserverMapRef.current.clear();
        heightsRef.current = {};
        elementMapRef.current = new Map();
        setColumns(assignWaterfallColumns(items, {}));
    }, [items]);

    useEffect(() => {
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            mutationObserverMapRef.current.forEach((observer) => observer.disconnect());
            mutationObserverMapRef.current.clear();
            scheduleRecalculate.cancel();
        };
    }, [scheduleRecalculate]);

    return {columns, registerElement};
};

export default useWaterfallLayout;
