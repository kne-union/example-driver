import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import classnames from 'classnames';
import SimpleBar from 'simplebar-react';
import ErrorBoundary from '@kne/react-error-boundary';
import {useIntl} from '@kne/react-intl';
import withLocale from '../withLocale';
import {useInView, useIsMobile, useLazyCompile, useReactRoot, usePreviewIframe, PREVIEW_IFRAME_SRCDOC} from '../hooks';
import DescriptionBar from './DescriptionBar';
import DeviceSwitcher from './DeviceSwitcher';
import CodePanel from './CodePanel';
import ErrorComponent from './ErrorComponent';
import normalizeCode from '../utils/normalizeCode';
import runPreviewCode from '../utils/runPreviewCode';
import {isDevicePreviewEnabled, getPlatformDevices, getPhoneDevices, isFramedDevice} from '../utils/devicePreview';

// vertical padding of .example-driver-preview (42px top + 30px bottom)
const PREVIEW_VERTICAL_PADDING = 72;

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
    const [previewMinHeight, setPreviewMinHeight] = useState(0);
    const simpleBarRef = useRef(null);

    const {
        containerRef,
        containerMount,
        iframeRef,
        iframeElementRef,
        iframeReady,
        updateIframeHeight,
        debouncedUpdateIframeHeight,
        setIframeFramedMode,
        syncIframeStyles,
        setIframeViewportMode
    } = usePreviewIframe({deviceScrollRef: simpleBarRef});

    const getPopupContainer = useCallback(() => {
        return containerRef.current?.ownerDocument?.body || document.body;
    }, [containerRef]);

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
    const {shouldRender: inViewShouldRender, heightRef} = useInView(iframeElementRef, {
        disabled: !useViewport,
        containerMount: iframeReady ? containerMount : undefined
    });
    const shouldRender = typeof mounted === 'boolean' ? mounted : (useViewport ? inViewShouldRender : true);
    const {compiledCode, error} = useLazyCompile(_code, shouldRender);

    const safeScope = useMemo(() => Array.isArray(scope) ? scope : [], [scope]);
    const currentScope = useMemo(() => safeScope.filter(({
                                                             component, name
                                                         }) => !!component && typeof name === 'string' && name), [safeScope]);
    const antdScope = useMemo(() => currentScope.find(item => item.name === 'antd'), [currentScope]);
    const AntdConfigProvider = antdScope && antdScope.component && antdScope.component.ConfigProvider;

    const [renderJsx, setRenderJsx] = useState(null);

    useEffect(() => {
        if (!shouldRender) {
            setRenderJsx(null);
        }
    }, [shouldRender]);

    useEffect(() => {
        if (!compiledCode || !shouldRender || !iframeReady) {
            return;
        }
        const iframeWindow = iframeElementRef.current && iframeElementRef.current.contentWindow;
        if (!iframeWindow) {
            return;
        }
        try {
            const Component = contextComponent || (({children}) => children);
            runPreviewCode({
                iframeWindow,
                compiledCode,
                scope: currentScope,
                onRender: jsx => {
                    const content = (
                        <ErrorBoundary errorComponent={ErrorComponent}>
                            <Component>{jsx}</Component>
                        </ErrorBoundary>
                    );
                    setRenderJsx(
                        AntdConfigProvider
                            ? <AntdConfigProvider getPopupContainer={getPopupContainer}>{content}</AntdConfigProvider>
                            : content
                    );
                }
            });
        } catch (e) {
            setRenderJsx(null);
        }
    }, [compiledCode, currentScope, contextComponent, shouldRender, iframeReady, AntdConfigProvider, getPopupContainer, iframeElementRef]);

    const handleHeightRecord = useCallback((h) => {
        setPreviewMinHeight(prev => Math.max(prev, h));
        debouncedUpdateIframeHeight();
    }, [debouncedUpdateIframeHeight]);

    useReactRoot(containerRef, shouldRender, renderJsx, heightRef, {
        onHeightRecord: handleHeightRecord,
        containerMount
    });

    useEffect(() => {
        if (!iframeReady) {
            return;
        }
        setIframeFramedMode(hasDeviceFrame);
        setIframeViewportMode({
            isMobilePreview: hasDeviceFrame,
            deviceWidth: hasDeviceFrame && activeDevice ? activeDevice.width : 0
        });
        const raf = requestAnimationFrame(() => {
            updateIframeHeight();
            const instance = simpleBarRef.current;
            if (instance && typeof instance.recalculate === 'function') {
                instance.recalculate();
            }
        });
        return () => cancelAnimationFrame(raf);
    }, [iframeReady, hasDeviceFrame, activeDevice && activeDevice.width, setIframeFramedMode, setIframeViewportMode, updateIframeHeight]);

    useEffect(() => {
        if (!iframeReady || !renderJsx) {
            return;
        }
        const raf = requestAnimationFrame(() => {
            syncIframeStyles();
        });
        return () => cancelAnimationFrame(raf);
    }, [iframeReady, renderJsx, syncIframeStyles]);

    useEffect(() => {
        if (!iframeReady) {
            return;
        }
        const raf = requestAnimationFrame(() => {
            updateIframeHeight();
        });
        return () => cancelAnimationFrame(raf);
    }, [iframeReady, renderJsx, updateIframeHeight, hasDeviceFrame, activeDevice && activeDevice.width, activeDevice && activeDevice.height]);

    useEffect(() => {
        if (!hasDeviceFrame) return;
        const instance = simpleBarRef.current;
        if (!instance || typeof instance.recalculate !== 'function') return;
        const raf = requestAnimationFrame(() => {
            updateIframeHeight();
            instance.recalculate();
        });
        return () => cancelAnimationFrame(raf);
    }, [hasDeviceFrame, activeDevice && activeDevice.width, activeDevice && activeDevice.height, renderJsx, shouldRender, updateIframeHeight]);

    const previewStyle = previewMinHeight > 0 && !hasDeviceFrame
        ? {minHeight: previewMinHeight + PREVIEW_VERTICAL_PADDING + 'px'}
        : undefined;

    const screenStyle = hasDeviceFrame ? {
        width: activeDevice.width + 'px',
        height: activeDevice.height + 'px'
    } : undefined;

    const previewScroll = (
        <SimpleBar
            ref={hasDeviceFrame ? simpleBarRef : null}
            className={classnames('example-driver-device-scroll', {
                'is-virtual-scroll': hasDeviceFrame
            })}
            autoHide={!hasDeviceFrame}
        >
            <iframe
                ref={iframeRef}
                className="example-driver-preview-iframe"
                title="example preview"
                srcDoc={PREVIEW_IFRAME_SRCDOC}
            />
        </SimpleBar>
    );

    return <>
        <div className={classnames('example-driver-preview', {
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
