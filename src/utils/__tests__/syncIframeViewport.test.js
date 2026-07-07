import {buildViewportContent, syncIframeViewport} from '../syncIframeViewport';
import {DESKTOP_PREVIEW_VIEWPORT_WIDTH, MOBILE_BREAKPOINT} from '../devicePreview';

describe('syncIframeViewport', () => {
    it('should use wide viewport for desktop preview', () => {
        expect(buildViewportContent({isMobilePreview: false, deviceWidth: 0}))
            .toBe('width=' + DESKTOP_PREVIEW_VIEWPORT_WIDTH + ', initial-scale=1');
        expect(DESKTOP_PREVIEW_VIEWPORT_WIDTH).toBeGreaterThan(MOBILE_BREAKPOINT);
    });

    it('should use device width for mobile preview', () => {
        expect(buildViewportContent({isMobilePreview: true, deviceWidth: 430}))
            .toBe('width=430, initial-scale=1');
    });

    it('should update iframe viewport meta', () => {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);

        syncIframeViewport(iframe, {isMobilePreview: true, deviceWidth: 390});
        const meta = iframe.contentDocument.querySelector('meta[name="viewport"]');
        expect(meta.getAttribute('content')).toBe('width=390, initial-scale=1');

        syncIframeViewport(iframe, {isMobilePreview: false, deviceWidth: 0});
        expect(meta.getAttribute('content')).toBe('width=' + DESKTOP_PREVIEW_VIEWPORT_WIDTH + ', initial-scale=1');

        document.body.removeChild(iframe);
    });
});
