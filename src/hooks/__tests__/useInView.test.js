import React, {useRef} from 'react';
import {render, act} from '@testing-library/react';
import useInView, {__resetSharedObserverForTests} from '../useInView';

const IN_ZONE_RECT = {top: 100, bottom: 200, left: 0, right: 300, height: 100, width: 300};
const ABOVE_ZONE_RECT = {top: -500, bottom: -400, left: 0, right: 300, height: 100, width: 300};
const UNMOUNT_DELAY = 300;

const getBelowZoneRect = () => ({
    top: window.innerHeight + 300,
    bottom: window.innerHeight + 400,
    left: 0,
    right: 300,
    height: 100,
    width: 300
});

const TestComponent = ({onStateChange, style}) => {
    const ref = useRef(null);
    const {shouldRender, heightRef, markMeasured, resetMeasured} = useInView(ref);
    if (onStateChange) {
        onStateChange({shouldRender, heightRef, markMeasured, resetMeasured, ref});
    }
    return <div ref={ref} data-testid="target" style={style || {height: '100px'}}/>;
};

describe('useInView', () => {
    let observerInstances = [];
    let originalGBCR;

    beforeEach(() => {
        __resetSharedObserverForTests();
        observerInstances = [];
        originalGBCR = window.HTMLElement.prototype.getBoundingClientRect;
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
        window.HTMLElement.prototype.getBoundingClientRect = originalGBCR;
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

    const stubElementRect = (rect) => {
        window.HTMLElement.prototype.getBoundingClientRect = function () {
            return rect;
        };
    };

    it('should set shouldRender to true when element is in preload zone', () => {
        let state;
        render(<TestComponent onStateChange={(s) => state = s}/>);

        triggerVisibility(IN_ZONE_RECT);
        expect(state.shouldRender).toBe(true);
    });

    it('should set shouldRender to false after leaving below preload zone and delay elapses', () => {
        let state;
        render(<TestComponent onStateChange={(s) => state = s}/>);

        triggerVisibility(IN_ZONE_RECT);
        expect(state.shouldRender).toBe(true);

        triggerVisibility(getBelowZoneRect());
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
        triggerVisibility(getBelowZoneRect());

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

    it('should keep mounted when above viewport and not yet measured', () => {
        let state;
        render(<TestComponent onStateChange={(s) => state = s}/>);

        triggerVisibility(IN_ZONE_RECT);
        triggerVisibility(ABOVE_ZONE_RECT);

        act(() => {
            jest.advanceTimersByTime(UNMOUNT_DELAY);
        });

        expect(state.shouldRender).toBe(true);
    });

    it('should unmount after markMeasured when above viewport', () => {
        let state;
        render(<TestComponent onStateChange={(s) => state = s}/>);

        triggerVisibility(IN_ZONE_RECT);
        stubElementRect(ABOVE_ZONE_RECT);

        act(() => {
            state.markMeasured();
        });

        expect(state.shouldRender).toBe(true);

        act(() => {
            jest.advanceTimersByTime(UNMOUNT_DELAY);
        });

        expect(state.shouldRender).toBe(false);
    });

    it('should stay unmounted when below viewport and not measured', () => {
        let state;
        render(<TestComponent onStateChange={(s) => state = s}/>);

        triggerVisibility(getBelowZoneRect());

        act(() => {
            jest.advanceTimersByTime(UNMOUNT_DELAY);
        });

        expect(state.shouldRender).toBe(false);
    });

    it('should force remount above after resetMeasured', () => {
        let state;
        render(<TestComponent onStateChange={(s) => state = s}/>);

        triggerVisibility(IN_ZONE_RECT);
        stubElementRect(ABOVE_ZONE_RECT);

        act(() => {
            state.markMeasured();
        });
        act(() => {
            jest.advanceTimersByTime(UNMOUNT_DELAY);
        });
        expect(state.shouldRender).toBe(false);

        act(() => {
            state.resetMeasured();
        });

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
