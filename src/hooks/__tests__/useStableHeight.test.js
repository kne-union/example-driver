import {renderHook, act} from '@testing-library/react';
import useStableHeight, {HEIGHT_STABILITY_MS} from '../useStableHeight';

describe('useStableHeight', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should grow immediately when height increases', () => {
        const {result} = renderHook(() => useStableHeight());

        act(() => {
            result.current.reportHeight(200);
        });

        expect(result.current.stableHeight).toBe(200);
        expect(result.current.stableRef.current).toBe(200);
    });

    it('should not shrink until height is stable for the delay period', () => {
        const {result} = renderHook(() => useStableHeight());

        act(() => {
            result.current.reportHeight(300);
        });

        act(() => {
            result.current.reportHeight(150);
        });

        expect(result.current.stableHeight).toBe(300);

        act(() => {
            jest.advanceTimersByTime(HEIGHT_STABILITY_MS - 1);
        });
        expect(result.current.stableHeight).toBe(300);

        act(() => {
            jest.advanceTimersByTime(1);
        });
        expect(result.current.stableHeight).toBe(150);
    });

    it('should reset shrink timer when height changes again', () => {
        const {result} = renderHook(() => useStableHeight());

        act(() => {
            result.current.reportHeight(300);
            result.current.reportHeight(150);
        });

        act(() => {
            jest.advanceTimersByTime(500);
            result.current.reportHeight(180);
        });

        act(() => {
            jest.advanceTimersByTime(HEIGHT_STABILITY_MS - 1);
        });
        expect(result.current.stableHeight).toBe(300);

        act(() => {
            jest.advanceTimersByTime(1);
        });
        expect(result.current.stableHeight).toBe(180);
    });

    it('should reset stored height', () => {
        const {result} = renderHook(() => useStableHeight());

        act(() => {
            result.current.reportHeight(240);
            result.current.reset();
        });

        expect(result.current.stableHeight).toBe(0);
        expect(result.current.stableRef.current).toBe(0);
    });
});
