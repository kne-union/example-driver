import React, {useRef, useState, useEffect} from 'react';
import {render, act, waitFor} from '@testing-library/react';
import useInView, {__resetSharedObserverForTests} from '../useInView';
import useReactRoot from '../useReactRoot';

const UNMOUNT_DELAY = 300;
const IN_ZONE_RECT = {top: 100, bottom: 300, left: 0, right: 300, height: 200, width: 300};
const OUT_ZONE_RECT = {top: -500, bottom: -300, left: 0, right: 300, height: 200, width: 300};

const InnerComponent = ({height}) => (
    <div data-testid="inner" style={{height: height + 'px', backgroundColor: 'lightblue'}}>
        Rendered Content
    </div>
);

const TestWrapper = ({mockHeight = 200}) => {
    const containerRef = useRef(null);
    const {shouldRender, heightRef, markMeasured} = useInView(containerRef);
    const [renderJsx, setRenderJsx] = useState(null);

    useEffect(() => {
        if (shouldRender) {
            setRenderJsx(<InnerComponent height={mockHeight}/>);
        } else {
            setRenderJsx(null);
        }
    }, [shouldRender, mockHeight]);

    useReactRoot(containerRef, shouldRender, renderJsx, heightRef, {
        onHeightRecord: (h) => {
            heightRef.current = h;
            if (h > 0) {
                markMeasured();
            }
        }
    });

    return <div data-testid="container" ref={containerRef}/>;
};

describe('Height stability integration test', () => {
    let observerInstances = [];
    let originalGBCR;

    beforeEach(() => {
        __resetSharedObserverForTests();
        observerInstances = [];
        originalGBCR = window.HTMLElement.prototype.getBoundingClientRect;

        window.IntersectionObserver = class {
            constructor(callback, options) {
                this.callback = callback;
                this.options = options;
                observerInstances.push(this);
            }
            observe(element) { this.element = element; }
            unobserve() {}
            disconnect() {}
        };
    });

    afterEach(() => {
        window.HTMLElement.prototype.getBoundingClientRect = originalGBCR;
        delete window.HTMLElement.prototype.scrollHeight;
    });

    const mockGetBoundingClientRect = (height) => {
        window.HTMLElement.prototype.getBoundingClientRect = function () {
            return {height, width: 300, top: 0, left: 0, bottom: height, right: 300};
        };
        Object.defineProperty(window.HTMLElement.prototype, 'scrollHeight', {
            configurable: true,
            get() {
                return height;
            }
        });
    };

    const triggerVisibility = (boundingClientRect) => {
        const observer = observerInstances[observerInstances.length - 1];
        act(() => {
            observer.callback([{
                boundingClientRect,
                target: observer.element
            }]);
        });
    };

    const waitForHeightRecord = async () => {
        await act(async () => {
            await new Promise(resolve => requestAnimationFrame(resolve));
            await new Promise(resolve => requestAnimationFrame(resolve));
        });
    };

    const waitForUnmount = async () => {
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, UNMOUNT_DELAY + 20));
        });
    };

    const waitForPlaceholder = async (container) => {
        await waitFor(() => {
            expect(container.querySelector('.example-driver-placeholder')).toBeInTheDocument();
        });
    };

    it('should maintain consistent height through viewport in/out cycle', async () => {
        const mockHeight = 250;
        mockGetBoundingClientRect(mockHeight);

        const {container} = render(<TestWrapper mockHeight={mockHeight}/>);

        triggerVisibility(IN_ZONE_RECT);
        await waitForHeightRecord();

        const containerDiv = container.querySelector('[data-testid="container"]');
        const heightAfterRender = containerDiv.getBoundingClientRect().height;

        triggerVisibility(OUT_ZONE_RECT);
        await waitForUnmount();
        await waitForPlaceholder(container);

        const placeholder = containerDiv.querySelector('.example-driver-placeholder');
        const placeholderHeight = parseInt(placeholder.style.height, 10);
        expect(placeholderHeight).toBe(heightAfterRender);

        triggerVisibility(IN_ZONE_RECT);
        await waitForHeightRecord();

        const heightAfterRerender = containerDiv.getBoundingClientRect().height;
        expect(heightAfterRerender).toBe(heightAfterRender);

        triggerVisibility(OUT_ZONE_RECT);
        await waitForUnmount();
        await waitForPlaceholder(container);

        const placeholder2 = containerDiv.querySelector('.example-driver-placeholder');
        const placeholderHeight2 = parseInt(placeholder2.style.height, 10);
        expect(placeholderHeight2).toBe(heightAfterRender);
    });

    it('should not lose height when quickly toggling in/out', async () => {
        const mockHeight = 180;
        mockGetBoundingClientRect(mockHeight);

        const {container} = render(<TestWrapper mockHeight={mockHeight}/>);

        triggerVisibility(IN_ZONE_RECT);
        await waitForHeightRecord();

        const initialHeight = container.querySelector('[data-testid="container"]')
            .getBoundingClientRect().height;

        for (let i = 0; i < 5; i++) {
            triggerVisibility(OUT_ZONE_RECT);
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 50));
            });
            triggerVisibility(IN_ZONE_RECT);
            await waitForHeightRecord();
        }

        const finalHeight = container.querySelector('[data-testid="container"]')
            .getBoundingClientRect().height;

        expect(finalHeight).toBe(initialHeight);
    });

    it('placeholder height should equal the last rendered height exactly', async () => {
        const mockHeight = 320;
        mockGetBoundingClientRect(mockHeight);

        const {container} = render(<TestWrapper mockHeight={mockHeight}/>);

        triggerVisibility(IN_ZONE_RECT);
        await waitForHeightRecord();

        const renderedHeight = container.querySelector('[data-testid="container"]')
            .getBoundingClientRect().height;

        triggerVisibility(OUT_ZONE_RECT);
        await waitForUnmount();
        await waitForPlaceholder(container);

        const placeholder = container.querySelector('.example-driver-placeholder');
        const placeholderHeight = parseInt(placeholder.style.height, 10);

        expect(placeholderHeight).toBe(renderedHeight);
    });

    it('should create default placeholder on first enter before JSX is ready', async () => {
        const mockHeight = 200;
        mockGetBoundingClientRect(mockHeight);

        const PendingWrapper = () => {
            const containerRef = useRef(null);
            const {shouldRender, heightRef} = useInView(containerRef);
            useReactRoot(containerRef, shouldRender, null, heightRef);
            return <div data-testid="container" ref={containerRef}/>;
        };

        const {container} = render(<PendingWrapper/>);

        triggerVisibility(IN_ZONE_RECT);

        await waitFor(() => {
            const placeholder = container.querySelector('.example-driver-placeholder');
            expect(placeholder).toBeInTheDocument();
            expect(parseInt(placeholder.style.height, 10)).toBe(120);
        });
    });

    it('should keep container height stable during placeholder to remount transition', async () => {
        const mockHeight = 260;
        mockGetBoundingClientRect(mockHeight);

        const {container} = render(<TestWrapper mockHeight={mockHeight}/>);

        triggerVisibility(IN_ZONE_RECT);
        await waitForHeightRecord();

        const containerDiv = container.querySelector('[data-testid="container"]');
        const stableHeight = containerDiv.getBoundingClientRect().height;

        triggerVisibility(OUT_ZONE_RECT);
        await waitForUnmount();
        await waitForPlaceholder(container);
        expect(containerDiv.getBoundingClientRect().height).toBe(stableHeight);

        triggerVisibility(IN_ZONE_RECT);
        expect(containerDiv.getBoundingClientRect().height).toBe(stableHeight);

        await waitForHeightRecord();
        expect(containerDiv.getBoundingClientRect().height).toBe(stableHeight);
    });

    it('should force mount above until measured then unmount with real placeholder height', async () => {
        const mockHeight = 280;
        mockGetBoundingClientRect(mockHeight);

        const {container} = render(<TestWrapper mockHeight={mockHeight}/>);

        // Above viewport and never measured — must mount to capture real height
        triggerVisibility(OUT_ZONE_RECT);
        await waitFor(() => {
            expect(container.querySelector('.example-driver-runner, .example-driver-placeholder')).toBeInTheDocument();
        });
        await waitForHeightRecord();

        const renderedHeight = container.querySelector('[data-testid="container"]')
            .getBoundingClientRect().height;
        expect(renderedHeight).toBe(mockHeight);

        // Measured + still above → may unmount (re-fire because markMeasured saw stubbed in-zone GBCR)
        triggerVisibility(OUT_ZONE_RECT);
        await waitForUnmount();
        await waitForPlaceholder(container);

        const placeholder = container.querySelector('.example-driver-placeholder');
        expect(parseInt(placeholder.style.height, 10)).toBe(renderedHeight);
    });
});
