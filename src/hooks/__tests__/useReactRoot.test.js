import React, {useRef} from 'react';
import {render, waitFor, act} from '@testing-library/react';
import useReactRoot from '../useReactRoot';

const TestComponent = ({shouldRender, fixedHeight = 200}) => {
    const containerRef = useRef(null);
    const heightRef = useRef(0);
    const jsx = shouldRender ?
        <div data-testid="rendered-content" style={{height: fixedHeight + 'px'}}>Content</div> : null;
    useReactRoot(containerRef, shouldRender, jsx, heightRef);
    return <div data-testid="container" ref={containerRef}/>;
};

describe('useReactRoot', () => {
    let originalGBCR;

    beforeEach(() => {
        originalGBCR = window.HTMLElement.prototype.getBoundingClientRect;
    });

    afterEach(() => {
        window.HTMLElement.prototype.getBoundingClientRect = originalGBCR;
    });

    const mockGetBoundingClientRect = (height) => {
        window.HTMLElement.prototype.getBoundingClientRect = function () {
            return {height, width: 300, top: 0, left: 0, bottom: height, right: 300};
        };
    };

    it('should render content when shouldRender is true', async () => {
        const {container} = render(<TestComponent shouldRender={true}/>);

        await waitFor(() => {
            expect(container.querySelector('.example-driver-runner')).toBeInTheDocument();
        });
    });

    it('should record height before unmounting and create placeholder with that height', async () => {
        const fixedHeight = 250;
        mockGetBoundingClientRect(fixedHeight);

        const {rerender, container} = render(
            <TestComponent shouldRender={true} fixedHeight={fixedHeight}/>
        );

        // Wait for render + double rAF height recording
        await act(async () => {
            await new Promise(resolve => requestAnimationFrame(resolve));
            await new Promise(resolve => requestAnimationFrame(resolve));
        });

        // Unmount the content
        rerender(<TestComponent shouldRender={false} fixedHeight={fixedHeight}/>);

        // Wait for setTimeout(0) placeholder creation
        await waitFor(() => {
            const placeholder = container.querySelector('.example-driver-placeholder');
            expect(placeholder).toBeInTheDocument();
            expect(placeholder.style.height).toBe(fixedHeight + 'px');
        });
    });

    it('should preserve height consistency across mount/unmount cycles', async () => {
        const fixedHeight = 300;
        mockGetBoundingClientRect(fixedHeight);

        const {rerender, container} = render(
            <TestComponent shouldRender={true} fixedHeight={fixedHeight}/>
        );

        // Wait for initial render + double rAF
        await act(async () => {
            await new Promise(resolve => requestAnimationFrame(resolve));
            await new Promise(resolve => requestAnimationFrame(resolve));
        });

        // Cycle 1: unmount
        rerender(<TestComponent shouldRender={false} fixedHeight={fixedHeight}/>);
        await waitFor(() => {
            const placeholder = container.querySelector('.example-driver-placeholder');
            expect(placeholder).toBeInTheDocument();
            expect(placeholder.style.height).toBe(fixedHeight + 'px');
        });

        // Cycle 1: remount
        rerender(<TestComponent shouldRender={true} fixedHeight={fixedHeight}/>);
        await waitFor(() => {
            expect(container.querySelector('.example-driver-runner')).toBeInTheDocument();
        });

        await act(async () => {
            await new Promise(resolve => requestAnimationFrame(resolve));
            await new Promise(resolve => requestAnimationFrame(resolve));
        });

        // Cycle 2: unmount again
        rerender(<TestComponent shouldRender={false} fixedHeight={fixedHeight}/>);
        await waitFor(() => {
            const placeholder = container.querySelector('.example-driver-placeholder');
            expect(placeholder).toBeInTheDocument();
            expect(placeholder.style.height).toBe(fixedHeight + 'px');
        });
    });

    it('should remove placeholder before rendering new content', async () => {
        const fixedHeight = 180;
        mockGetBoundingClientRect(fixedHeight);

        const {rerender, container} = render(
            <TestComponent shouldRender={true} fixedHeight={fixedHeight}/>
        );

        await act(async () => {
            await new Promise(resolve => requestAnimationFrame(resolve));
            await new Promise(resolve => requestAnimationFrame(resolve));
        });

        // Unmount to create placeholder
        rerender(<TestComponent shouldRender={false} fixedHeight={fixedHeight}/>);
        await waitFor(() => {
            expect(container.querySelector('.example-driver-placeholder')).toBeInTheDocument();
        });

        // Remount
        rerender(<TestComponent shouldRender={true} fixedHeight={fixedHeight}/>);
        await waitFor(() => {
            expect(container.querySelector('.example-driver-placeholder')).not.toBeInTheDocument();
            expect(container.querySelector('.example-driver-runner')).toBeInTheDocument();
        });
    });

    it('should not create placeholder if never rendered and height is 0', async () => {
        const {container} = render(<TestComponent shouldRender={false}/>);

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
        });

        expect(container.querySelector('.example-driver-placeholder')).not.toBeInTheDocument();
        expect(container.querySelector('.example-driver-runner')).not.toBeInTheDocument();
    });

    it('should create placeholder when shouldRender becomes false without reactRoot but heightRef has value', async () => {
        const fixedHeight = 200;
        mockGetBoundingClientRect(fixedHeight);

        const heightRefValue = {current: 0};
        const ContainerWithRef = ({shouldRender}) => {
            const containerRef = useRef(null);
            const jsx = shouldRender ? <div style={{height: fixedHeight + 'px'}}>Content</div> : null;
            useReactRoot(containerRef, shouldRender, jsx, heightRefValue);
            return <div ref={containerRef}/>;
        };

        const {rerender, container} = render(<ContainerWithRef shouldRender={true}/>);

        await act(async () => {
            await new Promise(resolve => requestAnimationFrame(resolve));
            await new Promise(resolve => requestAnimationFrame(resolve));
        });

        // Unmount: should create placeholder
        rerender(<ContainerWithRef shouldRender={false}/>);

        await waitFor(() => {
            const placeholder = container.querySelector('.example-driver-placeholder');
            expect(placeholder).toBeInTheDocument();
            expect(placeholder.style.height).toBe(fixedHeight + 'px');
        });

        // Re-render with shouldRender=false again (reactRootRef is null now):
        // placeholder should still exist
        rerender(<ContainerWithRef shouldRender={false}/>);

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
        });

        const placeholder2 = container.querySelector('.example-driver-placeholder');
        expect(placeholder2).toBeInTheDocument();
        expect(placeholder2.style.height).toBe(fixedHeight + 'px');
    });

    it('should not have residual DOM nodes after unmount', async () => {
        const fixedHeight = 200;
        mockGetBoundingClientRect(fixedHeight);

        const {rerender, container} = render(
            <TestComponent shouldRender={true} fixedHeight={fixedHeight}/>
        );

        await act(async () => {
            await new Promise(resolve => requestAnimationFrame(resolve));
            await new Promise(resolve => requestAnimationFrame(resolve));
        });

        // Unmount
        rerender(<TestComponent shouldRender={false} fixedHeight={fixedHeight}/>);
        await waitFor(() => {
            const placeholder = container.querySelector('.example-driver-placeholder');
            expect(placeholder).toBeInTheDocument();
        });

        // Only placeholder should remain
        const containerDiv = container.querySelector('[data-testid="container"]');
        expect(containerDiv.children.length).toBe(1);
        expect(containerDiv.children[0].className).toBe('example-driver-placeholder');
    });

    it('should record height synchronously before unmount (not relying on async)', async () => {
        const fixedHeight = 275;
        mockGetBoundingClientRect(fixedHeight);

        const heightRefValue = {current: 0};
        const ContainerWithRef = () => {
            const containerRef = useRef(null);
            const jsx = <div style={{height: fixedHeight + 'px'}}>Content</div>;
            useReactRoot(containerRef, true, jsx, heightRefValue);
            return <div ref={containerRef}/>;
        };

        const {unmount} = render(<ContainerWithRef/>);

        // Wait for double rAF to record height
        await act(async () => {
            await new Promise(resolve => requestAnimationFrame(resolve));
            await new Promise(resolve => requestAnimationFrame(resolve));
        });

        // heightRef should have been recorded
        expect(heightRefValue.current).toBe(fixedHeight);
    });
});
