import React, {useRef} from 'react';
import {render, act} from '@testing-library/react';
import useInView, {__resetSharedObserverForTests} from '../useInView';

const IN_ZONE_RECT = {top: 100, bottom: 200, left: 0, right: 300, height: 100, width: 300};
const OUT_ZONE_RECT = {top: -500, bottom: -400, left: 0, right: 300, height: 100, width: 300};
const UNMOUNT_DELAY = 300;

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
        __resetSharedObserverForTests();
        observerInstances = [];
        jest.useFakeTimers();
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
        jest.useRealTimers();
    });

    const triggerVisibility = (boundingClientRect) => {
        const observer = observerInstances[0];
        act(() => {
            observer.callback([{
                boundingClientRect,
                target: observer.element
            }]);
        });
    };

    it('should set shouldRender to true when element is in preload zone', () => {
        let state;
        render(<TestComponent onStateChange={(s) => state = s}/>);

        triggerVisibility(IN_ZONE_RECT);
        expect(state.shouldRender).toBe(true);
    });

    it('should set shouldRender to false after leaving preload zone and delay elapses', () => {
        let state;
        render(<TestComponent onStateChange={(s) => state = s}/>);

        triggerVisibility(IN_ZONE_RECT);
        expect(state.shouldRender).toBe(true);

        triggerVisibility(OUT_ZONE_RECT);
        expect(state.shouldRender).toBe(true);

        act(() => {
            jest.advanceTimersByTime(UNMOUNT_DELAY);
        });

        expect(state.shouldRender).toBe(false);
    });

    it('should cancel pending unmount when re-entering preload zone before delay', () => {
        let state;
        render(<TestComponent onStateChange={(s) => state = s}/>);

        triggerVisibility(IN_ZONE_RECT);
        triggerVisibility(OUT_ZONE_RECT);

        act(() => {
            jest.advanceTimersByTime(100);
        });

        triggerVisibility(IN_ZONE_RECT);

        act(() => {
            jest.advanceTimersByTime(UNMOUNT_DELAY);
        });

        expect(state.shouldRender).toBe(true);
    });

    it('should stay rendered when element is in preload buffer below viewport', () => {
        let state;
        render(<TestComponent onStateChange={(s) => state = s}/>);

        triggerVisibility(IN_ZONE_RECT);
        expect(state.shouldRender).toBe(true);

        const belowViewportBuffer = {
            top: window.innerHeight + 50,
            bottom: window.innerHeight + 150,
            left: 0,
            right: 300,
            height: 100,
            width: 300
        };
        triggerVisibility(belowViewportBuffer);
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

    it('should use rootMargin 0 observer options', () => {
        render(<TestComponent/>);
        expect(observerInstances[0].options.rootMargin).toBe('0px');
    });
});
