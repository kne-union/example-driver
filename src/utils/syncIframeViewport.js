import {DESKTOP_PREVIEW_VIEWPORT_WIDTH} from './devicePreview';

export const buildViewportContent = ({isMobilePreview, deviceWidth}) => {
    if (isMobilePreview && deviceWidth > 0) {
        return 'width=' + deviceWidth + ', initial-scale=1';
    }
    return 'width=' + DESKTOP_PREVIEW_VIEWPORT_WIDTH + ', initial-scale=1';
};

export const syncIframeViewport = (iframe, options = {}) => {
    if (!iframe) {
        return;
    }
    const doc = iframe.contentDocument;
    if (!doc || !doc.head) {
        return;
    }

    let meta = doc.querySelector('meta[name="viewport"]');
    if (!meta) {
        meta = doc.createElement('meta');
        meta.setAttribute('name', 'viewport');
        doc.head.insertBefore(meta, doc.head.firstChild);
    }

    const content = buildViewportContent(options);
    if (meta.getAttribute('content') !== content) {
        meta.setAttribute('content', content);
    }
};
