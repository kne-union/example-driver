import React, {useRef} from 'react';
import {render, act} from '@testing-library/react';
import useInView from '../useInView';

const TestComponent = ({onStateChange, style}) => {
    const ref = useRef(null);
    const {shouldRender, heightRef} = useInView(ref);
    if (onStateChange) {
        onStateChange({shouldRender, heightRef, ref});
    }
    return <div ref={ref} data-testid="target" style={style || {height: '100px'}}/>;
};

describe('useInView', () => {
    let observerInstances = [];

    beforeEach(() => {
        observerInstances = [];
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

    it('should set shouldRender to true when element is intersecting', () => {
        let state;
        render(<TestComponent onStateChange={(s) => state = s}/>);

        const observer = observerInstances[0];
        act(() => {
            observer.callback([{
                isIntersecting: true,
                intersectionRatio: 0.1,
                target: observer.element
            }]);
        });

        expect(state.shouldRender).toBe(true);
    });

    it('should set shouldRender to false when fully out of view (intersectionRatio === 0)', () => {
        let state;
        render(<TestComponent onStateChange={(s) => state = s}/>);

        const observer = observerInstances[0];

        act(() => {
            observer.callback([{
                isIntersecting: true,
                intersectionRatio: 0.5,
                target: observer.element
            }]);
        });
        expect(state.shouldRender).toBe(true);

        act(() => {
            observer.callback([{
                isIntersecting: false,
                intersectionRatio: 0,
                target: observer.element
            }]);
        });

        expect(state.shouldRender).toBe(false);
    });

    it('should not set shouldRender to false when partially out of view (intersectionRatio > 0)', () => {
        let state;
        render(<TestComponent onStateChange={(s) => state = s}/>);

        const observer = observerInstances[0];

        act(() => {
            observer.callback([{
                isIntersecting: true,
                intersectionRatio: 0.5,
                target: observer.element
            }]);
        });

        // Partially out of view
        act(() => {
            observer.callback([{
                isIntersecting: false,
                intersectionRatio: 0.3,
                target: observer.element
            }]);
        });

        // shouldRender stays true since intersectionRatio > 0
        expect(state.shouldRender).toBe(true);
    });

    it('should default shouldRender to false', () => {
        let state;
        render(<TestComponent onStateChange={(s) => state = s}/>);
        expect(state.shouldRender).toBe(false);
    });

    it('should expose heightRef for external height management', () => {
        let state;
        render(<TestComponent onStateChange={(s) => state = s}/>);
        expect(state.heightRef).toBeDefined();
        expect(state.heightRef.current).toBe(0);
    });
});
