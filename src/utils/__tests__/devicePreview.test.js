import {
    getPlatformDevices,
    getPhoneDevices,
    isDevicePreviewEnabled,
    isFramedDevice,
    resolveDevicePreview,
    MOBILE_BREAKPOINT,
    PHONE_DEVICES
} from '../devicePreview';

const formatMessage = ({id}) => {
    const map = {
        'DevicePreview.desktop': '电脑',
        'DevicePreview.mobile': '手机',
        'DevicePreview.iphoneProMax': 'iPhone Pro Max',
        'DevicePreview.iphonePro': 'iPhone Pro',
        'DevicePreview.iphoneSE': 'iPhone SE'
    };
    return map[id] || id;
};

describe('devicePreview utils', () => {
    test('getPlatformDevices returns desktop and mobile', () => {
        const devices = getPlatformDevices(formatMessage);
        expect(devices).toHaveLength(2);
        expect(devices[0].label).toBe('电脑');
        expect(devices[1].label).toBe('手机');
    });

    test('getPhoneDevices returns three iPhone models', () => {
        const devices = getPhoneDevices(formatMessage);
        expect(devices).toHaveLength(3);
        expect(devices[0]).toMatchObject({width: 430, height: 930, label: 'iPhone Pro Max'});
        expect(devices[1]).toMatchObject({width: 390, height: 844, label: 'iPhone Pro'});
        expect(devices[2]).toMatchObject({width: 375, height: 667, label: 'iPhone SE'});
    });

    test('PHONE_DEVICES has fixed sizes', () => {
        expect(PHONE_DEVICES).toEqual([
            {key: 'iphoneProMax', width: 430, height: 930},
            {key: 'iphonePro', width: 390, height: 844},
            {key: 'iphoneSE', width: 375, height: 667}
        ]);
    });

    test('isDevicePreviewEnabled returns false only when disabled', () => {
        expect(isDevicePreviewEnabled(undefined)).toBe(true);
        expect(isDevicePreviewEnabled(true)).toBe(true);
        expect(isDevicePreviewEnabled(false)).toBe(false);
    });

    test('resolveDevicePreview prefers item over global', () => {
        expect(resolveDevicePreview(false, true)).toBe(false);
        expect(resolveDevicePreview(true, false)).toBe(true);
        expect(resolveDevicePreview(undefined, false)).toBe(false);
        expect(resolveDevicePreview(undefined, undefined)).toBe(true);
    });

    test('isFramedDevice detects framed devices', () => {
        expect(isFramedDevice({label: 'phone', width: 375, height: 667})).toBe(true);
        expect(isFramedDevice({label: 'desktop', width: null, height: null})).toBe(false);
        expect(isFramedDevice(null)).toBe(false);
    });

    test('MOBILE_BREAKPOINT matches stylesheet', () => {
        expect(MOBILE_BREAKPOINT).toBe(768);
    });
});
