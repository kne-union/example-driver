import {useRef, useState, useEffect, useCallback} from 'react';
import {syncDocumentStyles, watchDocumentStyles} from '../utils/syncDocumentStyles';
import {syncIframeRootTheme} from '../utils/syncIframeRootTheme';
import {syncIframeViewport} from '../utils/syncIframeViewport';

export const PREVIEW_IFRAME_SRCDOC = '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=1280, initial-scale=1"><style>html,body{margin:0;padding:0;}</style></head><body></body></html>';

const IFRAME_FRAMED_CLASS = 'example-driver-iframe-framed';
const IFRAME_ROOT_CLASS = 'example-driver-iframe-root';

const measureContentHeight = (container) => {
    if (!container) {
        return 0;
    }
    const runner = container.querySelector('.example-driver-runner, .example-driver-placeholder');
    if (runner) {
        const scrollHeight = runner.scrollHeight;
        if (scrollHeight > 0) {
            return scrollHeight;
        }
        const rectHeight = runner.getBoundingClientRect().height;
        if (rectHeight > 0) {
            return rectHeight;
        }
    }
    return container.scrollHeight;
};

const usePreviewIframe = () => {
    const iframeRef = useRef(null);
    const containerRef = useRef(null);
    const styleObserverRef = useRef(null);
    const resizeObserverRef = useRef(null);
    const resizeRafRef = useRef(null);
    const lastHeightRef = useRef(0);
    const isUpdatingHeightRef = useRef(false);
    const [containerMount, setContainerMount] = useState(null);
    const [iframeReady, setIframeReady] = useState(false);

    const disconnectResizeObserver = useCallback(() => {
        if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect();
            resizeObserverRef.current = null;
        }
    }, []);

    const applyIframeHeight = useCallback(() => {
        const iframe = iframeRef.current;
        const container = containerRef.current;
        if (!iframe || !container) {
            return;
        }
        const height = measureContentHeight(container);
        if (height <= 0 || Math.abs(height - lastHeightRef.current) < 1) {
            return;
        }
        lastHeightRef.current = height;
        isUpdatingHeightRef.current = true;
        iframe.style.height = height + 'px';
        requestAnimationFrame(() => {
            isUpdatingHeightRef.current = false;
        });
    }, []);

    const connectResizeObserver = useCallback(() => {
        const container = containerRef.current;
        if (!container || resizeObserverRef.current) {
            return;
        }
        const iframeWin = container.ownerDocument && container.ownerDocument.defaultView;
        const ResizeObserverCtor = (iframeWin && iframeWin.ResizeObserver) || (typeof window !== 'undefined' && window.ResizeObserver);
        if (!ResizeObserverCtor) {
            return;
        }

        const runner = container.querySelector('.example-driver-runner, .example-driver-placeholder');
        if (!runner) {
            return;
        }

        const ro = new ResizeObserverCtor(() => {
            scheduleHeightSyncRef.current();
        });
        ro.observe(runner);
        resizeObserverRef.current = ro;
    }, []);

    const scheduleHeightSyncRef = useRef(() => {});

    const scheduleHeightSync = useCallback(() => {
        if (resizeRafRef.current) {
            cancelAnimationFrame(resizeRafRef.current);
        }
        resizeRafRef.current = requestAnimationFrame(() => {
            resizeRafRef.current = requestAnimationFrame(() => {
                resizeRafRef.current = null;
                if (isUpdatingHeightRef.current) {
                    return;
                }
                disconnectResizeObserver();
                applyIframeHeight();
                connectResizeObserver();
            });
        });
    }, [disconnectResizeObserver, applyIframeHeight, connectResizeObserver]);

    scheduleHeightSyncRef.current = scheduleHeightSync;

    const syncIframeStyles = useCallback(() => {
        const iframe = iframeRef.current;
        const doc = iframe && iframe.contentDocument;
        if (!doc) {
            return;
        }
        syncDocumentStyles(doc);
        syncIframeRootTheme(iframe);
    }, []);

    const setIframeFramedMode = useCallback((framed) => {
        const iframe = iframeRef.current;
        const doc = iframe && iframe.contentDocument;
        if (!doc || !doc.documentElement) {
            return;
        }
        const html = doc.documentElement;
        const container = containerRef.current;

        html.classList.toggle(IFRAME_FRAMED_CLASS, !!framed);
        html.classList.add(IFRAME_ROOT_CLASS);

        if (container) {
            container.style.overflowX = 'auto';
            container.style.overflowY = 'visible';
            container.style.width = '100%';
            container.style.maxWidth = '100%';
        }
    }, []);

    const setIframeViewportMode = useCallback(({isMobilePreview, deviceWidth}) => {
        const iframe = iframeRef.current;
        if (!iframe) {
            return;
        }
        syncIframeViewport(iframe, {isMobilePreview, deviceWidth});
        const win = iframe.contentWindow;
        if (win) {
            win.dispatchEvent(new Event('resize'));
        }
    }, []);

    const setupIframe = useCallback(() => {
        const iframe = iframeRef.current;
        if (!iframe) {
            return;
        }
        const doc = iframe.contentDocument;
        if (!doc || !doc.body) {
            return;
        }

        syncDocumentStyles(doc);
        syncIframeRootTheme(iframe);
        if (!styleObserverRef.current) {
            styleObserverRef.current = watchDocumentStyles(doc);
        }

        doc.body.style.margin = '0';

        let container = doc.querySelector('.example-driver-preview-content');
        if (!container) {
            container = doc.createElement('div');
            container.className = 'example-driver-preview-content';
            doc.body.appendChild(container);
        }

        doc.documentElement.classList.add(IFRAME_ROOT_CLASS);
        container.style.overflowX = 'auto';
        container.style.overflowY = 'visible';
        container.style.width = '100%';
        container.style.maxWidth = '100%';

        const changed = containerRef.current !== container;
        containerRef.current = container;
        if (changed) {
            setContainerMount(container);
        }
        setIframeReady(true);
        scheduleHeightSync();
    }, [scheduleHeightSync]);

    const handleIframeRef = useCallback((node) => {
        if (iframeRef.current === node) {
            return;
        }
        disconnectResizeObserver();
        if (resizeRafRef.current) {
            cancelAnimationFrame(resizeRafRef.current);
            resizeRafRef.current = null;
        }
        if (styleObserverRef.current) {
            styleObserverRef.current.disconnect();
            styleObserverRef.current = null;
        }
        iframeRef.current = node;
        lastHeightRef.current = 0;
        if (!node) {
            containerRef.current = null;
            setContainerMount(null);
            setIframeReady(false);
        }
    }, [disconnectResizeObserver]);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) {
            return;
        }

        const handleLoad = () => setupIframe();
        iframe.addEventListener('load', handleLoad);
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
            setupIframe();
        }

        return () => {
            iframe.removeEventListener('load', handleLoad);
            disconnectResizeObserver();
            if (resizeRafRef.current) {
                cancelAnimationFrame(resizeRafRef.current);
                resizeRafRef.current = null;
            }
            if (styleObserverRef.current) {
                styleObserverRef.current.disconnect();
                styleObserverRef.current = null;
            }
        };
    }, [setupIframe, disconnectResizeObserver]);

    useEffect(() => {
        if (!iframeReady) {
            return;
        }
        scheduleHeightSync();
    }, [iframeReady, containerMount, scheduleHeightSync]);

    const dispatchIframeResize = useCallback(() => {
        const iframe = iframeRef.current;
        const win = iframe && iframe.contentWindow;
        if (win) {
            win.dispatchEvent(new Event('resize'));
        }
    }, []);

    return {
        containerRef,
        containerMount,
        iframeRef: handleIframeRef,
        iframeElementRef: iframeRef,
        iframeReady,
        updateIframeHeight: scheduleHeightSync,
        dispatchIframeResize,
        setIframeFramedMode,
        syncIframeStyles,
        setIframeViewportMode
    };
};

export default usePreviewIframe;

export const __private__ = {
    measureContentHeight,
    PREVIEW_IFRAME_SRCDOC,
    IFRAME_FRAMED_CLASS,
    IFRAME_ROOT_CLASS
};
