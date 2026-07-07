const IFRAME_ROOT_CLASS = 'example-driver';

const THEME_CSS_VARS = [
    '--primary-color',
    '--example-driver-primary',
    '--example-driver-primary-light',
    '--example-driver-primary-bg',
    '--example-driver-primary-border',
    '--example-driver-primary-shadow',
    '--example-driver-device-header-height',
    '--example-driver-device-footer-height'
];

export const syncIframeRootTheme = (iframe) => {
    if (!iframe || typeof document === 'undefined') {
        return;
    }
    const doc = iframe.contentDocument;
    if (!doc || !doc.documentElement) {
        return;
    }

    const html = doc.documentElement;
    html.classList.add(IFRAME_ROOT_CLASS);

    const parentHost = iframe.closest('.' + IFRAME_ROOT_CLASS);
    if (!parentHost) {
        return;
    }

    const computed = window.getComputedStyle(parentHost);
    THEME_CSS_VARS.forEach((name) => {
        const value = computed.getPropertyValue(name).trim();
        if (value) {
            html.style.setProperty(name, value);
        }
    });

    ['color', 'font-size', 'font-family', 'line-height', 'text-align'].forEach((prop) => {
        const value = computed.getPropertyValue(prop).trim();
        if (value) {
            html.style.setProperty(prop, value);
        }
    });
};

export const IFRAME_ROOT_CLASS_NAME = IFRAME_ROOT_CLASS;
