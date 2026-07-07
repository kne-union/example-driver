import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import classnames from 'classnames';
import SimpleBar from 'simplebar-react';
import ErrorBoundary from '@kne/react-error-boundary';
import {useIntl} from '@kne/react-intl';
import withLocale from '../withLocale';
import {useInView, useIsMobile, useLazyCompile, useReactRoot} from '../hooks';
import DescriptionBar from './DescriptionBar';
import DeviceSwitcher from './DeviceSwitcher';
import CodePanel from './CodePanel';
import ErrorComponent from './ErrorComponent';
import normalizeCode from '../utils/normalizeCode';
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
    const containerRef = useRef(null);
    const simpleBarRef = useRef(null);
    const [containerMount, setContainerMount] = useState(null);
    const [previewMinHeight, setPreviewMinHeight] = useState(0);

    const handleContainerRef = useCallback((node) => {
        if (containerRef.current === node) return;
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
    const {shouldRender: inViewShouldRender, heightRef} = useInView(containerRef, {
        disabled: !useViewport,
        containerMount
    });
    const shouldRender = typeof mounted === 'boolean' ? mounted : (useViewport ? inViewShouldRender : true);
    const {compiledCode, error} = useLazyCompile(_code, shouldRender);

    const safeScope = useMemo(() => Array.isArray(scope) ? scope : [], [scope]);
    const currentScope = useMemo(() => safeScope.filter(({
                                                             component, name
                                                         }) => !!component && typeof name === 'string' && name), [safeScope]);

    const [renderJsx, setRenderJsx] = useState(null);

    useEffect(() => {
        if (!shouldRender) {
            setRenderJsx(null);
        }
    }, [shouldRender]);

    useEffect(() => {
        if (!compiledCode || !shouldRender) return;
        try {
            // eslint-disable-next-line no-new-func
            const runnerFunction = new Function('React', 'render', ...currentScope.map(({name}) => String(name)), String(compiledCode));
            const Component = contextComponent || (({children}) => children);
            runnerFunction(React, jsx => setRenderJsx(<ErrorBoundary errorComponent={ErrorComponent}>
                <Component>{jsx}</Component>
            </ErrorBoundary>), ...currentScope.map(({component}) => component));
        } catch (e) {
            setRenderJsx(null);
        }
    }, [compiledCode, currentScope, contextComponent, shouldRender]);

    const handleHeightRecord = useCallback((h) => {
        setPreviewMinHeight(prev => Math.max(prev, h));
    }, []);

    useReactRoot(containerRef, shouldRender, renderJsx, heightRef, {
        onHeightRecord: handleHeightRecord,
        containerMount
    });

    useEffect(() => {
        if (!hasDeviceFrame) return;
        const instance = simpleBarRef.current;
        if (!instance || typeof instance.recalculate !== 'function') return;
        instance.recalculate();
        const raf = requestAnimationFrame(() => instance.recalculate());
        return () => cancelAnimationFrame(raf);
    }, [hasDeviceFrame, activeDevice && activeDevice.width, activeDevice && activeDevice.height, renderJsx, shouldRender]);

    const previewStyle = previewMinHeight > 0 && !hasDeviceFrame
        ? {minHeight: previewMinHeight + PREVIEW_VERTICAL_PADDING + 'px'}
        : undefined;

    const screenStyle = hasDeviceFrame ? {
        width: activeDevice.width + 'px',
        height: activeDevice.height + 'px'
    } : undefined;

    const previewContent = <div className="example-driver-preview-content" ref={handleContainerRef}/>;

    const previewScroll = (
        <SimpleBar
            ref={hasDeviceFrame ? simpleBarRef : null}
            className={classnames('example-driver-device-scroll', {
                'is-virtual-scroll': hasDeviceFrame
            })}
            autoHide={!hasDeviceFrame}
        >
            {previewContent}
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
