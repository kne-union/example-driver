export const MOBILE_BREAKPOINT = 768;

export const PHONE_DEVICES = [
    {key: 'iphoneProMax', width: 430, height: 930},
    {key: 'iphonePro', width: 390, height: 844},
    {key: 'iphoneSE', width: 375, height: 667}
];

export const getPlatformDevices = formatMessage => [
    {
        key: 'desktop',
        label: formatMessage({id: 'DevicePreview.desktop'}),
        width: null,
        height: null,
        icon: 'desktop'
    },
    {
        key: 'mobile',
        label: formatMessage({id: 'DevicePreview.mobile'}),
        width: null,
        height: null,
        icon: 'mobile'
    }
];

export const getPhoneDevices = formatMessage => PHONE_DEVICES.map(device => ({
    ...device,
    label: formatMessage({id: 'DevicePreview.' + device.key}),
    icon: 'mobile'
}));

export const isDevicePreviewEnabled = devicePreview => devicePreview !== false;

export const resolveDevicePreview = (itemValue, globalValue) => {
    if (itemValue === false || itemValue === true) {
        return itemValue;
    }
    if (globalValue === false || globalValue === true) {
        return globalValue;
    }
    return true;
};

export const isFramedDevice = device => {
    return !!(device && device.width && device.height);
};
