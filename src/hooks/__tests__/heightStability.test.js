import React, {useRef, useState, useEffect} from 'react';
import {render, act, waitFor} from '@testing-library/react';
import useInView from '../useInView';
import useReactRoot from '../useReactRoot';

/**
 * Integration test: verifies height consistency when
 * useInView and useReactRoot work together.
 */

const InnerComponent = ({height}) => (
    <div data-testid="inner" style={{height: height + 'px', backgroundColor: 'lightblue'}}>
        Rendered Content
    </div>
);

const TestWrapper = ({mockHeight = 200}) => {
    const containerRef = useRef(null);
    const {shouldRender, heightRef} = useInView(containerRef);
    const [renderJsx, setRenderJsx] = useState(null);

    useEffect(() => {
        if (shouldRender) {
            setRenderJsx(<InnerComponent height={mockHeight}/>);
        } else {
            setRenderJsx(null);
        }
    }, [shouldRender, mockHeight]);

    useReactRoot(containerRef, shouldRender, renderJsx, heightRef);

    return <div data-testid="container" ref={containerRef}/>;
};

describe('Height stability integration test', () => {
    let observerInstances = [];
    let originalGBCR;

    beforeEach(() => {
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
    });

    const mockGetBoundingClientRect = (height) => {
        window.HTMLElement.prototype.getBoundingClientRect = function () {
            return {height, width: 300, top: 0, left: 0, bottom: height, right: 300};
        };
    };

    const triggerIntersection = (isIntersecting, intersectionRatio) => {
        const observer = observerInstances[observerInstances.length - 1];
        act(() => {
            observer.callback([{
                isIntersecting,
                intersectionRatio,
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

    const waitForPlaceholder = async (container) => {
        await waitFor(() => {
            expect(container.querySelector('.example-driver-placeholder')).toBeInTheDocument();
        });
    };

    it('should maintain consistent height through viewport in/out cycle', async () => {
        const mockHeight = 250;
        mockGetBoundingClientRect(mockHeight);

        const {container} = render(<TestWrapper mockHeight={mockHeight}/>);

        // Step 1: Element enters viewport
        triggerIntersection(true, 0.1);
        await waitForHeightRecord();

        const containerDiv = container.querySelector('[data-testid="container"]');
        const heightAfterRender = containerDiv.getBoundingClientRect().height;

        // Step 2: Element leaves viewport
        triggerIntersection(false, 0);
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
        });
        await waitForPlaceholder(container);

        const placeholder = containerDiv.querySelector('.example-driver-placeholder');
        const placeholderHeight = parseInt(placeholder.style.height, 10);

        // Placeholder height must match rendered height
        expect(placeholderHeight).toBe(heightAfterRender);

        // Step 3: Element re-enters viewport
        triggerIntersection(true, 0.1);
        await waitForHeightRecord();

        const heightAfterRerender = containerDiv.getBoundingClientRect().height;
        expect(heightAfterRerender).toBe(heightAfterRender);

        // Step 4: Leave viewport again
        triggerIntersection(false, 0);
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
        });
        await waitForPlaceholder(container);

        const placeholder2 = containerDiv.querySelector('.example-driver-placeholder');
        const placeholderHeight2 = parseInt(placeholder2.style.height, 10);
        expect(placeholderHeight2).toBe(heightAfterRender);
    });

    it('should not lose height when quickly toggling in/out', async () => {
        const mockHeight = 180;
        mockGetBoundingClientRect(mockHeight);

        const {container} = render(<TestWrapper mockHeight={mockHeight}/>);

        triggerIntersection(true, 0.1);
        await waitForHeightRecord();

        const initialHeight = container.querySelector('[data-testid="container"]')
            .getBoundingClientRect().height;

        // Multiple in/out toggles
        for (let i = 0; i < 3; i++) {
            triggerIntersection(false, 0);
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
            });

            triggerIntersection(true, 0.1);
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

        triggerIntersection(true, 0.1);
        await waitForHeightRecord();

        const renderedHeight = container.querySelector('[data-testid="container"]')
            .getBoundingClientRect().height;

        triggerIntersection(false, 0);
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
        });
        await waitForPlaceholder(container);

        const placeholder = container.querySelector('.example-driver-placeholder');
        const placeholderHeight = parseInt(placeholder.style.height, 10);

        expect(placeholderHeight).toBe(renderedHeight);
    });
});
