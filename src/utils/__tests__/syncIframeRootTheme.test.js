import {syncIframeRootTheme, IFRAME_ROOT_CLASS_NAME} from '../syncIframeRootTheme';

describe('syncIframeRootTheme', () => {
    it('should add example-driver class to iframe html', () => {
        const host = document.createElement('div');
        host.className = IFRAME_ROOT_CLASS_NAME;
        host.style.setProperty('--primary-color', '#123456');
        document.body.appendChild(host);

        const iframe = document.createElement('iframe');
        host.appendChild(iframe);

        syncIframeRootTheme(iframe);

        expect(iframe.contentDocument.documentElement.classList.contains(IFRAME_ROOT_CLASS_NAME)).toBe(true);

        document.body.removeChild(host);
    });
});
