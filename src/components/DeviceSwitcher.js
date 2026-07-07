import React from 'react';
import classnames from 'classnames';

const DesktopIcon = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path
            fill="currentColor"
            d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4.5l1.2 2h2.3a1 1 0 1 1 0 2H9.5a1 1 0 1 1 0-2h2.3l1.2-2H6a2 2 0 0 1-2-2V5Z"
        />
    </svg>
);

const MobileIcon = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path
            fill="currentColor"
            d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 2v16h8V4H8Zm4 14a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
        />
    </svg>
);

const ICON_MAP = {
    desktop: DesktopIcon,
    mobile: MobileIcon
};

const renderDeviceIcon = icon => {
    if (!icon) {
        return null;
    }
    if (typeof icon === 'string' && ICON_MAP[icon]) {
        const Icon = ICON_MAP[icon];
        return <span className="example-driver-device-switcher-icon"><Icon/></span>;
    }
    return icon;
};

const DeviceSwitcher = ({devices, activeIndex, onChange, variant}) => {
    const isSub = variant === 'sub';

    return (
        <div
            className={classnames('example-driver-device-switcher', {
                'is-sub': isSub,
                'is-platform': !isSub
            })}
            role="tablist"
        >
            {devices.map((device, index) => (
                <button
                    key={(device.label || 'device') + '_' + index}
                    type="button"
                    role="tab"
                    aria-selected={index === activeIndex}
                    className={classnames('example-driver-device-switcher-item', {
                        'is-active': index === activeIndex
                    })}
                    onClick={() => onChange(index)}
                >
                    {renderDeviceIcon(device.icon)}
                    <span className="example-driver-device-switcher-text">
                        <span className="example-driver-device-switcher-label">{device.label}</span>
                        {device.width && device.height && (
                            <span className="example-driver-device-switcher-size">
                                {device.width} × {device.height}
                            </span>
                        )}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default DeviceSwitcher;
