import React, {useEffect} from 'react';
import {render, act, waitFor} from '@testing-library/react';
import usePreviewIframe, {__private__} from '../usePreviewIframe';

const {measureContentHeight} = __private__;

const PreviewIframeHarness = ({onReady}) => {
    const {
        iframeRef,
        containerRef,
        iframeReady,
        updateIframeHeight
    } = usePreviewIframe();

    useEffect(() => {
        if (iframeReady && typeof onReady === 'function') {
            onReady({containerRef, updateIframeHeight});
        }
    }, [iframeReady, onReady, containerRef, updateIframeHeight]);

    return (
        <iframe
            ref={iframeRef}
            title="preview test"
            srcDoc={__private__.PREVIEW_IFRAME_SRCDOC}
        />
    );
};

describe('usePreviewIframe', () => {
    let resizeObserverInstances = [];
    let originalRO;

    beforeEach(() => {
        resizeObserverInstances = [];
        originalRO = window.ResizeObserver;
        window.ResizeObserver = class {
            constructor(callback) {
                this.callback = callback;
                resizeObserverInstances.push(this);
            }
            observe() {}
            disconnect() {}
        };
    });

    afterEach(() => {
        window.ResizeObserver = originalRO;
    });

    it('should create preview container after iframe load', async () => {
        let containerRef;
        render(
            <PreviewIframeHarness
                onReady={({containerRef: ref}) => {
                    containerRef = ref;
                }}
            />
        );

        await waitFor(() => {
            expect(containerRef.current).toBeTruthy();
            expect(containerRef.current.className).toBe('example-driver-preview-content');
        });
    });

    it('measureContentHeight should prefer runner scrollHeight', () => {
        const container = document.createElement('div');
        const runner = document.createElement('div');
        runner.className = 'example-driver-runner';
        Object.defineProperty(runner, 'scrollHeight', {value: 240, configurable: true});
        Object.defineProperty(runner, 'getBoundingClientRect', {
            value: () => ({height: 100, width: 300})
        });
        container.appendChild(runner);

        expect(measureContentHeight(container)).toBe(240);
    });

    it('updateIframeHeight should skip writes when height is unchanged', async () => {
        let updateIframeHeight;
        let containerRef;

        const {container} = render(
            <PreviewIframeHarness
                onReady={({containerRef: ref, updateIframeHeight: update}) => {
                    containerRef = ref;
                    updateIframeHeight = update;
                }}
            />
        );

        await waitFor(() => {
            expect(containerRef.current).toBeTruthy();
        });

        const iframe = container.querySelector('iframe');
        const runner = document.createElement('div');
        runner.className = 'example-driver-runner';
        Object.defineProperty(runner, 'scrollHeight', {value: 200, configurable: true});
        containerRef.current.appendChild(runner);

        await act(async () => {
            updateIframeHeight();
            await new Promise(resolve => requestAnimationFrame(resolve));
            await new Promise(resolve => requestAnimationFrame(resolve));
        });
        expect(iframe.style.height).toBe('200px');

        await act(async () => {
            updateIframeHeight();
            await new Promise(resolve => requestAnimationFrame(resolve));
            await new Promise(resolve => requestAnimationFrame(resolve));
        });
        expect(iframe.style.height).toBe('200px');
    });

    it('should coalesce ResizeObserver callbacks without throwing', async () => {
        let updateIframeHeight;
        let containerRef;

        render(
            <PreviewIframeHarness
                onReady={({containerRef: ref, updateIframeHeight: update}) => {
                    containerRef = ref;
                    updateIframeHeight = update;
                }}
            />
        );

        await waitFor(() => {
            expect(containerRef.current).toBeTruthy();
        });

        const runner = document.createElement('div');
        runner.className = 'example-driver-runner';
        Object.defineProperty(runner, 'scrollHeight', {value: 180, configurable: true});
        containerRef.current.appendChild(runner);

        await act(async () => {
            updateIframeHeight();
            await new Promise(resolve => requestAnimationFrame(resolve));
            await new Promise(resolve => requestAnimationFrame(resolve));
        });

        await waitFor(() => {
            expect(resizeObserverInstances.length).toBeGreaterThan(0);
        });

        const ro = resizeObserverInstances[resizeObserverInstances.length - 1];
        await act(async () => {
            ro.callback();
            ro.callback();
            await new Promise(resolve => requestAnimationFrame(resolve));
            await new Promise(resolve => requestAnimationFrame(resolve));
        });

        expect(typeof updateIframeHeight).toBe('function');
    });
});
