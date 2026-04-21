import {useEffect, useRef, useCallback} from 'react';
import {createRoot} from 'react-dom/client';

const useReactRoot = (containerRef, shouldRender, renderJsx, heightRef) => {
    const reactRootRef = useRef(null);
    const runnerRef = useRef(null);
    const mountedRef = useRef(false);
    const resizeObserverRef = useRef(null);

    const getRunner = useCallback(() => {
        const container = containerRef.current;
        if (!container) return null;
        const existing = runnerRef.current;
        if (existing && container.contains(existing)) return existing;
        const found = container.querySelector('.example-driver-runner, .example-driver-placeholder');
        if (found) {
            runnerRef.current = found;
            return found;
        }
        return null;
    }, [containerRef]);

    const createRunner = useCallback((className) => {
        const container = containerRef.current;
        if (!container) return null;
        container.innerHTML = '';
        const runner = document.createElement('div');
        runner.className = className;
        container.appendChild(runner);
        runnerRef.current = runner;
        return runner;
    }, [containerRef]);

    const ensureRoot = useCallback((runner) => {
        if (!runner) return null;
        if (reactRootRef.current) return reactRootRef.current;
        const root = createRoot(runner);
        reactRootRef.current = root;
        return root;
    }, []);

    const recordHeight = useCallback((runner) => {
        if (!runner) return 0;
        const h = runner.getBoundingClientRect().height;
        if (h > 0) {
            heightRef.current = h;
        }
        return h;
    }, [heightRef]);

    const ensureResizeObserver = useCallback((runner) => {
        if (!runner) return;
        if (resizeObserverRef.current) return;
        if (typeof window === 'undefined' || typeof window.ResizeObserver !== 'function') return;

        const ro = new window.ResizeObserver(() => {
            const h = runner.getBoundingClientRect().height;
            if (h > 0) {
                heightRef.current = h;
            }
        });
        ro.observe(runner);
        resizeObserverRef.current = ro;
    }, [heightRef]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let runner = getRunner();

        // shouldRender=true but JSX not ready yet: keep current DOM (typically placeholder with last height)
        if (shouldRender && !renderJsx) {
            return;
        }

        if (!shouldRender) {
            mountedRef.current = false;

            // If we never rendered and there's no recorded height, do nothing (avoid creating empty placeholder nodes)
            if (!runner && !(heightRef.current > 0)) {
                return;
            }

            if (!runner) {
                runner = createRunner('example-driver-placeholder');
            }

            // record last rendered height, then keep it by setting runner height
            recordHeight(runner);
            const savedHeight = heightRef.current;

            runner.className = 'example-driver-placeholder';
            if (savedHeight > 0) {
                runner.style.height = savedHeight + 'px';
            }

            if (reactRootRef.current) {
                reactRootRef.current.render(null);
            }
            return;
        }

        // Mount / update
        if (!runner) {
            runner = createRunner('example-driver-runner');
        }

        runner.className = 'example-driver-runner';
        runner.style.height = '';

        const root = ensureRoot(runner);
        ensureResizeObserver(runner);

        mountedRef.current = true;
        root.render(renderJsx);

        // Fallback: without ResizeObserver, record height after paint
        if (typeof window === 'undefined' || typeof window.ResizeObserver !== 'function') {
            requestAnimationFrame(() => {
                if (mountedRef.current) {
                    recordHeight(runner);
                }
            });
        }

        return () => {
            mountedRef.current = false;
        };
    }, [containerRef, shouldRender, renderJsx, heightRef, getRunner, createRunner, ensureRoot, ensureResizeObserver, recordHeight]);

    useEffect(() => {
        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
                resizeObserverRef.current = null;
            }
            if (reactRootRef.current) {
                const root = reactRootRef.current;
                reactRootRef.current = null;
                // Defer unmount to avoid "unmount while React is rendering" warnings during React Testing Library cleanup.
                setTimeout(() => {
                    try {
                        root.unmount();
                    } catch (e) {
                        // ignore
                    }
                }, 0);
            }
            runnerRef.current = null;
        };
    }, []);
};

export default useReactRoot;
