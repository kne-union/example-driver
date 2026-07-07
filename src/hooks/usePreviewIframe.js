import {useRef, useState, useEffect, useCallback} from 'react';
import {useDebouncedCallback} from 'use-debounce';
import {syncDocumentStyles, watchDocumentStyles} from '../utils/syncDocumentStyles';
import {syncIframeRootTheme} from '../utils/syncIframeRootTheme';
import {syncIframeViewport} from '../utils/syncIframeViewport';

export const PREVIEW_IFRAME_SRCDOC = '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=1280, initial-scale=1"><style>html,body{margin:0;padding:0;}</style></head><body></body></html>';

const IFRAME_FRAMED_CLASS = 'example-driver-iframe-framed';
const IFRAME_ROOT_CLASS = 'example-driver-iframe-root';
const HEIGHT_SYNC_DEBOUNCE_MS = 150;

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

const getSimpleBarScrollElement = (simpleBarRef) => {
    const instance = simpleBarRef && simpleBarRef.current;
    if (!instance) {
        return null;
    }
    if (typeof instance.getScrollElement === 'function') {
        return instance.getScrollElement();
    }
    return null;
};

const usePreviewIframe = (options = {}) => {
    const deviceScrollRef = options.deviceScrollRef;
    const iframeRef = useRef(null);
    const containerRef = useRef(null);
    const styleObserverRef = useRef(null);
    const contentObserverRef = useRef(null);
    const heightRafRef = useRef(null);
    const lastHeightRef = useRef(0);
    const [containerMount, setContainerMount] = useState(null);
    const [iframeReady, setIframeReady] = useState(false);

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
        iframe.style.height = height + 'px';
    }, []);

    const syncIframeHeightNow = useCallback(() => {
        if (heightRafRef.current) {
            cancelAnimationFrame(heightRafRef.current);
        }
        heightRafRef.current = requestAnimationFrame(() => {
            heightRafRef.current = null;
            applyIframeHeight();
        });
    }, [applyIframeHeight]);

    const debouncedSyncIframeHeight = useDebouncedCallback(() => {
        syncIframeHeightNow();
    }, HEIGHT_SYNC_DEBOUNCE_MS);

    const disconnectContentObserver = useCallback(() => {
        if (contentObserverRef.current) {
            contentObserverRef.current.disconnect();
            contentObserverRef.current = null;
        }
    }, []);

    const connectContentObserver = useCallback(() => {
        const container = containerRef.current;
        if (!container || contentObserverRef.current) {
            return;
        }
        if (typeof MutationObserver === 'undefined') {
            return;
        }

        const observer = new MutationObserver(() => {
            debouncedSyncIframeHeight();
        });
        observer.observe(container, {
            childList: true,
            subtree: true,
            characterData: true
        });
        contentObserverRef.current = observer;
    }, [debouncedSyncIframeHeight]);

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
        disconnectContentObserver();
        connectContentObserver();
        syncIframeHeightNow();
    }, [connectContentObserver, disconnectContentObserver, syncIframeHeightNow]);

    const handleIframeRef = useCallback((node) => {
        if (iframeRef.current === node) {
            return;
        }
        disconnectContentObserver();
        if (heightRafRef.current) {
            cancelAnimationFrame(heightRafRef.current);
            heightRafRef.current = null;
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
    }, [disconnectContentObserver]);

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
            disconnectContentObserver();
            if (heightRafRef.current) {
                cancelAnimationFrame(heightRafRef.current);
                heightRafRef.current = null;
            }
            if (styleObserverRef.current) {
                styleObserverRef.current.disconnect();
                styleObserverRef.current = null;
            }
        };
    }, [setupIframe, disconnectContentObserver]);

    useEffect(() => {
        if (!iframeReady) {
            return;
        }
        connectContentObserver();
        syncIframeHeightNow();
    }, [iframeReady, containerMount, connectContentObserver, syncIframeHeightNow]);

    useEffect(() => {
        if (!iframeReady) {
            return;
        }

        const onScroll = () => {
            debouncedSyncIframeHeight();
        };

        window.addEventListener('scroll', onScroll, {passive: true});

        const scrollElement = getSimpleBarScrollElement(deviceScrollRef);
        if (scrollElement) {
            scrollElement.addEventListener('scroll', onScroll, {passive: true});
        }

        const onScrollEnd = () => {
            debouncedSyncIframeHeight();
            syncIframeHeightNow();
        };
        if (typeof window !== 'undefined' && 'onscrollend' in window) {
            window.addEventListener('scrollend', onScrollEnd, {passive: true});
            if (scrollElement) {
                scrollElement.addEventListener('scrollend', onScrollEnd, {passive: true});
            }
        }

        return () => {
            window.removeEventListener('scroll', onScroll);
            if (typeof window !== 'undefined' && 'onscrollend' in window) {
                window.removeEventListener('scrollend', onScrollEnd);
            }
            if (scrollElement) {
                scrollElement.removeEventListener('scroll', onScroll);
                if (typeof window !== 'undefined' && 'onscrollend' in window) {
                    scrollElement.removeEventListener('scrollend', onScrollEnd);
                }
            }
            debouncedSyncIframeHeight.cancel();
        };
    }, [iframeReady, deviceScrollRef, debouncedSyncIframeHeight, syncIframeHeightNow, containerMount]);

    useEffect(() => {
        return () => {
            debouncedSyncIframeHeight.cancel();
        };
    }, [debouncedSyncIframeHeight]);

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
        updateIframeHeight: syncIframeHeightNow,
        debouncedUpdateIframeHeight: debouncedSyncIframeHeight,
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
    IFRAME_ROOT_CLASS,
    HEIGHT_SYNC_DEBOUNCE_MS,
    getSimpleBarScrollElement
};
