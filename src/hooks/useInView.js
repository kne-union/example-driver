import {useState, useEffect, useRef} from 'react';

let sharedObserver = null;
let sharedObserverCtor = null;
const elementCallbacks = new Map();

const OBSERVER_OPTIONS = {
    threshold: [0],
    // preload a bit outside viewport to reduce frequent mount/unmount near boundary
    rootMargin: '200px 0px'
};

// Delay before unmounting to avoid rapid mount/unmount cycles during scrolling.
// If the element re-enters the viewport before the delay expires, the unmount is cancelled.
const UNMOUNT_DELAY = 300;

const getSharedObserver = () => {
    if (!sharedObserver || sharedObserverCtor !== window.IntersectionObserver) {
        sharedObserverCtor = window.IntersectionObserver;
        elementCallbacks.clear();
        sharedObserver = new window.IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const callbacks = elementCallbacks.get(entry.target);
                if (!callbacks) return;
                callbacks.forEach(cb => cb(entry));
            });
        }, OBSERVER_OPTIONS);
    }
    return sharedObserver;
};

const useInView = (ref, options) => {
    const disabled = !!(options && options.disabled);
    const [shouldRender, setShouldRender] = useState(false);
    const heightRef = useRef(0);
    const unmountTimerRef = useRef(null);

    useEffect(() => {
        if (disabled) return;
        const container = ref.current;
        if (!container) return;
        if (typeof window === 'undefined' || typeof window.IntersectionObserver !== 'function') {
            setShouldRender(true);
            return;
        }

        const observer = getSharedObserver();
        const cb = (entry) => {
            if (entry.isIntersecting) {
                // Cancel pending unmount if element re-enters viewport
                if (unmountTimerRef.current) {
                    clearTimeout(unmountTimerRef.current);
                    unmountTimerRef.current = null;
                }
                setShouldRender(true);
                return;
            }
            if (!entry.isIntersecting && entry.intersectionRatio === 0) {
                // Delay unmount to avoid rapid mount/unmount cycles during scrolling
                if (unmountTimerRef.current) {
                    clearTimeout(unmountTimerRef.current);
                }
                unmountTimerRef.current = setTimeout(() => {
                    unmountTimerRef.current = null;
                    setShouldRender(false);
                }, UNMOUNT_DELAY);
            }
        };

        let callbacks = elementCallbacks.get(container);
        if (!callbacks) {
            callbacks = new Set();
            elementCallbacks.set(container, callbacks);
            observer.observe(container);
        }
        callbacks.add(cb);

        return () => {
            const setRef = elementCallbacks.get(container);
            if (!setRef) return;
            setRef.delete(cb);
            if (setRef.size === 0) {
                elementCallbacks.delete(container);
                if (typeof observer.unobserve === 'function') {
                    observer.unobserve(container);
                }
            }
            if (unmountTimerRef.current) {
                clearTimeout(unmountTimerRef.current);
                unmountTimerRef.current = null;
            }
        };
    }, [ref, disabled]);

    return {shouldRender, heightRef};
};

export default useInView;
