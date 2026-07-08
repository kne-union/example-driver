import {useLayoutEffect} from 'react';
import {
    ResponsiveProvider,
    applyViewportCssVars,
    resetViewportCssVars,
    findResponsiveBoundary,
    findResponsiveScroll,
    getDefaultScrollElement
} from '@kne/responsive-utils';

const resolveBoundary = (runnerRef, hasDeviceFrame) => {
    const runner = runnerRef && runnerRef.current;
    if (!runner) {
        return null;
    }
    if (hasDeviceFrame) {
        const deviceScroll = runner.closest('.example-driver-device-scroll');
        if (deviceScroll) {
            return deviceScroll;
        }
    }
    return findResponsiveBoundary(runner);
};

const resolveViewportTarget = (runner, hasDeviceFrame) => {
    if (!runner) {
        return null;
    }
    if (hasDeviceFrame) {
        return runner.closest('.example-driver-device-scroll') || runner;
    }
    return runner;
};

export const createExampleDriverResponsiveProps = ({runnerRef, hasDeviceFrame = false, containerWidth, containerHeight}) => {
    // 只要给了数值 containerWidth 就进入 container 模式，
    // 因此桌面 80vw 视口（无设备外框）也能复用同一套响应式判断。
    const useContainerMode = typeof containerWidth === 'number';

    return {
        mode: useContainerMode ? 'container' : 'viewport',
        containerWidth: useContainerMode ? containerWidth : undefined,
        containerHeight: useContainerMode ? containerHeight : undefined,
        getBoundaryElement: () => {
            return resolveBoundary(runnerRef, hasDeviceFrame) || document.body;
        },
        getScrollElement: () => {
            const anchor = runnerRef && runnerRef.current;
            return findResponsiveScroll(anchor) || getDefaultScrollElement();
        }
    };
};

const useRunnerViewportCssVars = (runnerRef, hasDeviceFrame, containerWidth, containerHeight) => {
    useLayoutEffect(() => {
        const runner = runnerRef && runnerRef.current;
        if (!runner) {
            return undefined;
        }

        const target = resolveViewportTarget(runner, hasDeviceFrame);

        // 仅设备框（手机）模式写入内联 px；桌面 80vw 交给 style.scss 里的 CSS 变量覆盖，
        // 避免内联样式盖过 CSS，也省去 resize 监听。
        if (hasDeviceFrame && typeof containerWidth === 'number' && typeof containerHeight === 'number') {
            applyViewportCssVars(target, {width: containerWidth, height: containerHeight});
        } else {
            resetViewportCssVars(target);
        }

        return () => {
            resetViewportCssVars(target);
        };
    }, [runnerRef, hasDeviceFrame, containerWidth, containerHeight]);
};

const ExampleDriverResponsiveProvider = ({runnerRef, hasDeviceFrame, containerWidth, containerHeight, children}) => {
    useRunnerViewportCssVars(runnerRef, hasDeviceFrame, containerWidth, containerHeight);

    return (
        <ResponsiveProvider
            {...createExampleDriverResponsiveProps({
                runnerRef,
                hasDeviceFrame,
                containerWidth,
                containerHeight
            })}
        >
            {children}
        </ResponsiveProvider>
    );
};

export default ExampleDriverResponsiveProvider;
