import React, {useEffect} from 'react';
import {render, act, waitFor} from '@testing-library/react';
import usePreviewIframe, {__private__} from '../usePreviewIframe';

const {measureContentHeight, HEIGHT_SYNC_DEBOUNCE_MS} = __private__;

const PreviewIframeHarness = ({onReady, deviceScrollRef}) => {
    const {
        iframeRef,
        containerRef,
        iframeReady,
        updateIframeHeight,
        debouncedUpdateIframeHeight
    } = usePreviewIframe({deviceScrollRef});

    useEffect(() => {
        if (iframeReady && typeof onReady === 'function') {
            onReady({containerRef, updateIframeHeight, debouncedUpdateIframeHeight});
        }
    }, [iframeReady, onReady, containerRef, updateIframeHeight, debouncedUpdateIframeHeight]);

    return (
        <iframe
            ref={iframeRef}
            title="preview test"
            srcDoc={__private__.PREVIEW_IFRAME_SRCDOC}
        />
    );
};

describe('usePreviewIframe', () => {
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
        });
        expect(iframe.style.height).toBe('200px');

        await act(async () => {
            updateIframeHeight();
            await new Promise(resolve => requestAnimationFrame(resolve));
        });
        expect(iframe.style.height).toBe('200px');
    });

    it('should sync height when container content mutates', async () => {
        let containerRef;

        const {container} = render(
            <PreviewIframeHarness
                onReady={({containerRef: ref}) => {
                    containerRef = ref;
                }}
            />
        );

        await waitFor(() => {
            expect(containerRef.current).toBeTruthy();
        });

        const iframe = container.querySelector('iframe');
        const runner = document.createElement('div');
        runner.className = 'example-driver-runner';
        Object.defineProperty(runner, 'scrollHeight', {value: 180, configurable: true});

        await act(async () => {
            containerRef.current.appendChild(runner);
            await new Promise(resolve => requestAnimationFrame(resolve));
            await new Promise(resolve => setTimeout(resolve, HEIGHT_SYNC_DEBOUNCE_MS + 50));
        });

        await waitFor(() => {
            expect(iframe.style.height).toBe('180px');
        });
    });
});
