import {useEffect, useRef, useCallback} from 'react';
import {createRoot} from 'react-dom/client';

const DEFAULT_PLACEHOLDER_HEIGHT = 120;

const useReactRoot = (containerRef, shouldRender, renderJsx, heightRef, options) => {
    const onHeightRecord = options && options.onHeightRecord;
    const containerMount = options && options.containerMount;
    const reactRootRef = useRef(null);
    const runnerRef = useRef(null);
    const mountedRef = useRef(false);
    const heightLockReleasedRef = useRef(false);

    const notifyHeight = useCallback((h) => {
        if (h > 0) {
            heightRef.current = h;
            if (typeof onHeightRecord === 'function') {
                onHeightRecord(h);
            }
        }
    }, [heightRef, onHeightRecord]);

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
        const doc = container.ownerDocument;
        container.innerHTML = '';
        const runner = doc.createElement('div');
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

    const measureRunnerHeight = useCallback((runner) => {
        if (!runner) return 0;
        const scrollHeight = runner.scrollHeight;
        if (scrollHeight > 0) {
            return scrollHeight;
        }
        return runner.getBoundingClientRect().height;
    }, []);

    const recordHeight = useCallback((runner) => {
        const h = measureRunnerHeight(runner);
        notifyHeight(h);
        return h;
    }, [measureRunnerHeight, notifyHeight]);

    const applyPlaceholderHeight = useCallback((runner) => {
        const savedHeight = heightRef.current > 0 ? heightRef.current : DEFAULT_PLACEHOLDER_HEIGHT;
        runner.className = 'example-driver-placeholder';
        runner.style.height = savedHeight + 'px';
        runner.style.minHeight = savedHeight + 'px';
    }, [heightRef]);

    const releaseHeightLock = useCallback((runner) => {
        if (!runner || heightLockReleasedRef.current) return;
        heightLockReleasedRef.current = true;
        runner.style.height = '';
        runner.style.minHeight = '';
    }, []);

    const resetReactRoot = useCallback(() => {
        runnerRef.current = null;
        if (reactRootRef.current) {
            try {
                reactRootRef.current.unmount();
            } catch (e) {
                // ignore
            }
            reactRootRef.current = null;
        }
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        if (runnerRef.current && !container.contains(runnerRef.current)) {
            resetReactRoot();
        }

        let runner = getRunner();

        if (shouldRender && !renderJsx) {
            if (!runner) {
                runner = createRunner('example-driver-placeholder');
            }
            applyPlaceholderHeight(runner);
            return;
        }

        if (!shouldRender) {
            mountedRef.current = false;
            heightLockReleasedRef.current = false;

            if (!runner && !(heightRef.current > 0)) {
                return;
            }

            if (!runner) {
                runner = createRunner('example-driver-placeholder');
            }

            recordHeight(runner);
            applyPlaceholderHeight(runner);

            if (reactRootRef.current) {
                reactRootRef.current.render(null);
            }
            return;
        }

        heightLockReleasedRef.current = false;

        if (!runner) {
            runner = createRunner('example-driver-runner');
        }

        runner.className = 'example-driver-runner';
        const lockedHeight = heightRef.current > 0 ? heightRef.current : 0;
        if (lockedHeight > 0) {
            runner.style.minHeight = lockedHeight + 'px';
        }

        const root = ensureRoot(runner);

        mountedRef.current = true;
        root.render(renderJsx);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (mountedRef.current && runner) {
                    recordHeight(runner);
                    releaseHeightLock(runner);
                }
            });
        });

        return () => {
            mountedRef.current = false;
        };
    }, [containerRef, containerMount, shouldRender, renderJsx, heightRef, getRunner, createRunner, ensureRoot, recordHeight, applyPlaceholderHeight, releaseHeightLock, resetReactRoot]);

    useEffect(() => {
        return () => {
            if (reactRootRef.current) {
                const root = reactRootRef.current;
                reactRootRef.current = null;
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
