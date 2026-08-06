import {useState, useEffect, useRef, useCallback} from 'react';

let sharedObserver = null;
let sharedObserverCtor = null;
const elementCallbacks = new Map();

const PRELOAD_MARGIN = 200;

const OBSERVER_OPTIONS = {
    threshold: [0],
    rootMargin: '0px'
};

// Delay before unmounting to avoid rapid mount/unmount cycles during scrolling.
const UNMOUNT_DELAY = 300;

const isInPreloadZone = (rect) => {
    if (!rect || typeof rect.top !== 'number' || typeof rect.bottom !== 'number') {
        return false;
    }
    if (typeof window === 'undefined') return true;
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    return rect.bottom > -PRELOAD_MARGIN && rect.top < vh + PRELOAD_MARGIN;
};

// Fully above the preload zone (scrolled past).
const isAboveViewport = (rect) => {
    if (!rect || typeof rect.bottom !== 'number') {
        return false;
    }
    return rect.bottom <= -PRELOAD_MARGIN;
};

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

// Observe the preview container element for viewport-based lazy rendering.
const useInView = (ref, options) => {
    const disabled = !!(options && options.disabled);
    const containerMount = options && options.containerMount;
    const [shouldRender, setShouldRender] = useState(false);
    const heightRef = useRef(0);
    const measuredRef = useRef(false);
    const unmountTimerRef = useRef(null);

    const clearUnmountTimer = useCallback(() => {
        if (unmountTimerRef.current) {
            clearTimeout(unmountTimerRef.current);
            unmountTimerRef.current = null;
        }
    }, []);

    const scheduleUnmount = useCallback(() => {
        clearUnmountTimer();
        unmountTimerRef.current = setTimeout(() => {
            unmountTimerRef.current = null;
            setShouldRender(false);
        }, UNMOUNT_DELAY);
    }, [clearUnmountTimer]);

    const shouldKeepMounted = useCallback((rect) => {
        if (isInPreloadZone(rect)) {
            return true;
        }
        // Above scroll position and never measured — force mount once for real height.
        return isAboveViewport(rect) && !measuredRef.current;
    }, []);

    const applyVisibility = useCallback((rect) => {
        if (shouldKeepMounted(rect)) {
            clearUnmountTimer();
            setShouldRender(true);
            return;
        }
        scheduleUnmount();
    }, [shouldKeepMounted, clearUnmountTimer, scheduleUnmount]);

    const markMeasured = useCallback(() => {
        measuredRef.current = true;
        const container = ref.current;
        if (!container || typeof container.getBoundingClientRect !== 'function') {
            return;
        }
        const rect = container.getBoundingClientRect();
        if (!isInPreloadZone(rect)) {
            scheduleUnmount();
        }
    }, [ref, scheduleUnmount]);

    const resetMeasured = useCallback(() => {
        measuredRef.current = false;
        const container = ref.current;
        if (!container || typeof container.getBoundingClientRect !== 'function') {
            return;
        }
        applyVisibility(container.getBoundingClientRect());
    }, [ref, applyVisibility]);

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
            applyVisibility(entry.boundingClientRect);
        };

        let callbacks = elementCallbacks.get(container);
        if (!callbacks) {
            callbacks = new Set();
            elementCallbacks.set(container, callbacks);
            observer.observe(container);
            if (containerMount !== undefined) {
                applyVisibility(container.getBoundingClientRect());
            }
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
            clearUnmountTimer();
        };
    }, [ref, disabled, containerMount, applyVisibility, clearUnmountTimer]);

    return {shouldRender, heightRef, markMeasured, resetMeasured};
};

export default useInView;

export const __resetSharedObserverForTests = () => {
    sharedObserver = null;
    sharedObserverCtor = null;
    elementCallbacks.clear();
};
