import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import classnames from 'classnames';
import SimpleBar from 'simplebar-react';
import ErrorBoundary from '@kne/react-error-boundary';
import {useIntl} from '@kne/react-intl';
import {ExampleDriverResponsiveProvider, usePopupContainer, RESPONSIVE_BOUNDARY_CLASS, RESPONSIVE_CONTAINER_CLASS, RESPONSIVE_SCROLL_CLASS} from '@kne/responsive-utils';
import withLocale from '../withLocale';
import {useInView, useIsMobile, useLazyCompile, useReactRoot, useStableHeight} from '../hooks';
import DescriptionBar from './DescriptionBar';
import DeviceSwitcher from './DeviceSwitcher';
import CodePanel from './CodePanel';
import ErrorComponent from './ErrorComponent';
import normalizeCode from '../utils/normalizeCode';
import runPreviewCode from '../utils/runPreviewCode';
import {isDevicePreviewEnabled, getPlatformDevices, getPhoneDevices, isFramedDevice} from '../utils/devicePreview';

// vertical padding of .example-driver-preview (42px top + 30px bottom)
const PREVIEW_VERTICAL_PADDING = 72;
// Match --example-driver-device-header/footer-height in style.scss
const DEVICE_HEADER_HEIGHT = 36;
const DEVICE_FOOTER_HEIGHT = 20;

const BUILTIN_PREVIEW_SCOPE = [
    {name: 'useIsMobile', component: useIsMobile}
];

const mergePreviewScope = (scope) => {
    const items = (scope || []).filter(({
        component, name
    }) => !!component && typeof name === 'string' && name);
    BUILTIN_PREVIEW_SCOPE.forEach((builtin) => {
        if (!items.some((item) => item.name === builtin.name)) {
            items.push(builtin);
        }
    });
    return items;
};

const PreviewRenderBridge = ({jsx, contextComponent, AntdConfigProvider}) => {
    const getPopupContainer = usePopupContainer();
    const Component = contextComponent || (({children}) => children);
    const content = (
        <ErrorBoundary errorComponent={ErrorComponent}>
            <Component>{jsx}</Component>
        </ErrorBoundary>
    );
    return AntdConfigProvider
        ? <AntdConfigProvider getPopupContainer={getPopupContainer}>{content}</AntdConfigProvider>
        : content;
};

const LiveCodeInner = ({
                           code = '',
                           scope = [],
                           title,
                           description,
                           contextComponent,
                           mounted,
                           useInView: enableInView = true,
                           devicePreview
                       }) => {
    const {formatMessage} = useIntl();
    const isMobile = useIsMobile();
    const [_code, setCode] = useState(code);
    const [codeOpen, setCodeOpen] = useState(false);
    const [activePlatformIndex, setActivePlatformIndex] = useState(0);
    const [activePhoneIndex, setActivePhoneIndex] = useState(0);
    const containerRef = useRef(null);
    const simpleBarRef = useRef(null);
    const runnerRef = useRef(null);
    const [containerMount, setContainerMount] = useState(null);
    const {stableHeight, stableRef, reportHeight, reset: resetStableHeight} = useStableHeight();

    const handleContainerRef = useCallback((node) => {
        if (containerRef.current === node) {
            return;
        }
        containerRef.current = node;
        setContainerMount(node);
    }, []);

    const devicePreviewEnabled = isDevicePreviewEnabled(devicePreview);
    const platformDevices = useMemo(() => getPlatformDevices(formatMessage), [formatMessage]);
    const phoneDevices = useMemo(() => getPhoneDevices(formatMessage), [formatMessage]);
    const showDeviceSwitcher = !isMobile && devicePreviewEnabled;
    const isMobilePlatform = showDeviceSwitcher && activePlatformIndex === 1;
    const activeDevice = showDeviceSwitcher
        ? (isMobilePlatform ? phoneDevices[activePhoneIndex] || phoneDevices[0] : platformDevices[0])
        : null;
    const hasDeviceFrame = !isMobile && isFramedDevice(activeDevice);
    const showPhoneSwitcher = isMobilePlatform;

    useEffect(() => {
        setCode(normalizeCode(code));
    }, [code]);

    useEffect(() => {
        if (activePhoneIndex >= phoneDevices.length) {
            setActivePhoneIndex(0);
        }
    }, [activePhoneIndex, phoneDevices.length]);

    const useViewport = enableInView !== false && typeof mounted !== 'boolean';
    const {shouldRender: inViewShouldRender} = useInView(containerRef, {
        disabled: !useViewport,
        containerMount
    });
    const shouldRender = typeof mounted === 'boolean' ? mounted : (useViewport ? inViewShouldRender : true);
    const {compiledCode, error} = useLazyCompile(_code, shouldRender);

    const safeScope = useMemo(() => Array.isArray(scope) ? scope : [], [scope]);
    const currentScope = useMemo(() => mergePreviewScope(safeScope), [safeScope]);
    const antdScope = useMemo(() => currentScope.find(item => item.name === 'antd'), [currentScope]);
    const AntdConfigProvider = antdScope && antdScope.component && antdScope.component.ConfigProvider;

    const responsiveContainerWidth = hasDeviceFrame && activeDevice && activeDevice.width
        ? activeDevice.width
        : undefined;
    const responsiveContainerHeight = hasDeviceFrame && activeDevice && activeDevice.height
        ? activeDevice.height - DEVICE_HEADER_HEIGHT - DEVICE_FOOTER_HEIGHT
        : undefined;

    const handleRunnerChange = useCallback((runner) => {
        runnerRef.current = runner;
    }, []);

    const [previewJsx, setPreviewJsx] = useState(null);

    useEffect(() => {
        if (!shouldRender) {
            setPreviewJsx(null);
        }
    }, [shouldRender]);

    useEffect(() => {
        if (!compiledCode || !shouldRender) {
            return;
        }
        try {
            runPreviewCode({
                compiledCode,
                scope: currentScope,
                onRender: jsx => setPreviewJsx(jsx)
            });
        } catch (e) {
            setPreviewJsx(null);
        }
    }, [compiledCode, currentScope, shouldRender]);

    const renderJsx = useMemo(() => {
        if (!previewJsx) {
            return null;
        }
        return (
            <ExampleDriverResponsiveProvider
                runnerRef={runnerRef}
                hasDeviceFrame={hasDeviceFrame}
                containerWidth={responsiveContainerWidth}
                containerHeight={responsiveContainerHeight}
            >
                <PreviewRenderBridge
                    jsx={previewJsx}
                    contextComponent={contextComponent}
                    AntdConfigProvider={AntdConfigProvider}
                />
            </ExampleDriverResponsiveProvider>
        );
    }, [
        previewJsx,
        hasDeviceFrame,
        responsiveContainerWidth,
        responsiveContainerHeight,
        contextComponent,
        AntdConfigProvider
    ]);

    const handleHeightRecord = useCallback((h) => {
        reportHeight(h);
    }, [reportHeight]);

    useReactRoot(containerRef, shouldRender, renderJsx, stableRef, {
        onHeightRecord: handleHeightRecord,
        onRunnerChange: handleRunnerChange,
        containerMount,
        heightLockVersion: stableHeight
    });

    useEffect(() => {
        resetStableHeight();
    }, [_code, resetStableHeight]);

    useEffect(() => {
        if (!hasDeviceFrame) {
            return;
        }
        const instance = simpleBarRef.current;
        if (!instance || typeof instance.recalculate !== 'function') {
            return;
        }
        instance.recalculate();
        const raf = requestAnimationFrame(() => instance.recalculate());
        let scrollElement = null;
        if (typeof instance.getScrollElement === 'function') {
            scrollElement = instance.getScrollElement();
            scrollElement?.classList.add(RESPONSIVE_SCROLL_CLASS);
        }
        return () => {
            cancelAnimationFrame(raf);
            scrollElement?.classList.remove(RESPONSIVE_SCROLL_CLASS);
        };
    }, [hasDeviceFrame, activeDevice && activeDevice.width, activeDevice && activeDevice.height, renderJsx, shouldRender]);

    const previewStyle = stableHeight > 0 && !hasDeviceFrame
        ? {minHeight: stableHeight + PREVIEW_VERTICAL_PADDING + 'px'}
        : undefined;

    const screenStyle = hasDeviceFrame ? {
        width: activeDevice.width + 'px',
        height: activeDevice.height + 'px'
    } : undefined;

    const previewContent = (
        <div
            className={classnames('example-driver-preview-content', RESPONSIVE_CONTAINER_CLASS)}
            ref={handleContainerRef}
        />
    );

    const previewScroll = hasDeviceFrame ? (
        <SimpleBar
            ref={simpleBarRef}
            className={classnames('example-driver-device-scroll is-virtual-scroll', RESPONSIVE_BOUNDARY_CLASS)}
        >
            {previewContent}
        </SimpleBar>
    ) : previewContent;

    return <>
        <div className={classnames('example-driver-preview', {
            [RESPONSIVE_SCROLL_CLASS]: !hasDeviceFrame,
            'has-device-switcher': showDeviceSwitcher,
            'has-phone-switcher': showPhoneSwitcher,
            'has-device-frame': hasDeviceFrame
        })} style={previewStyle}>
            {showDeviceSwitcher && (
                <div className="example-driver-device-toolbar">
                    <div className="example-driver-device-toolbar-inner">
                        <DeviceSwitcher
                            devices={platformDevices}
                            activeIndex={activePlatformIndex}
                            onChange={setActivePlatformIndex}
                        />
                        {showPhoneSwitcher && (
                            <DeviceSwitcher
                                devices={phoneDevices}
                                activeIndex={activePhoneIndex}
                                onChange={setActivePhoneIndex}
                                variant="sub"
                            />
                        )}
                    </div>
                </div>
            )}
            <div className={classnames('example-driver-preview-body', {
                'is-framed': hasDeviceFrame
            })}>
                <div className="example-driver-device-frame">
                    <div className="example-driver-device-buttons example-driver-device-buttons--left">
                        <span/>
                        <span/>
                    </div>
                    <div className="example-driver-device-buttons example-driver-device-buttons--right">
                        <span/>
                    </div>
                    <div className="example-driver-device-screen" style={screenStyle}>
                        <div className="example-driver-device-header" aria-hidden="true">
                            <div className="example-driver-device-island"/>
                        </div>
                        {previewScroll}
                        <div className="example-driver-device-footer" aria-hidden="true">
                            <div className="example-driver-device-home"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <DescriptionBar title={title} description={description} codeOpen={codeOpen}
                        onToggle={() => setCodeOpen(!codeOpen)}/>
        {codeOpen && <CodePanel code={_code} scope={scope} error={error} editable onChange={setCode}/>}
    </>;
};

const LiveCode = withLocale(LiveCodeInner);

export default LiveCode;
