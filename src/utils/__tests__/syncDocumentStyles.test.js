import {syncDocumentStyles, __private__} from '../syncDocumentStyles';

describe('syncDocumentStyles', () => {
    it('should clone stylesheet links into target document', () => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://example.com/app.css';
        document.head.appendChild(link);

        const targetDoc = document.implementation.createHTMLDocument('preview');
        syncDocumentStyles(targetDoc);

        const cloned = targetDoc.head.querySelector('link[rel="stylesheet"]');
        expect(cloned).toBeTruthy();
        expect(cloned.getAttribute('href')).toBe('https://example.com/app.css');
        expect(cloned.getAttribute(__private__.SOURCE_MARK)).toBe('link:https://example.com/app.css');

        document.head.removeChild(link);
    });

    it('should not duplicate clones on repeated sync', () => {
        const style = document.createElement('style');
        style.textContent = '.demo { color: red; }';
        document.head.appendChild(style);

        const targetDoc = document.implementation.createHTMLDocument('preview');
        syncDocumentStyles(targetDoc);
        syncDocumentStyles(targetDoc);

        expect(targetDoc.head.querySelectorAll('[' + __private__.CLONE_MARK + ']').length).toBe(1);

        document.head.removeChild(style);
    });

    it('should update existing style clone when source content changes', () => {
        const style = document.createElement('style');
        style.setAttribute('data-css-hash', 'demo-hash');
        style.textContent = '.demo { color: red; }';
        document.head.appendChild(style);

        const targetDoc = document.implementation.createHTMLDocument('preview');
        syncDocumentStyles(targetDoc);

        style.textContent = '.demo { color: blue; }';
        syncDocumentStyles(targetDoc);

        expect(targetDoc.head.querySelectorAll('[' + __private__.CLONE_MARK + ']').length).toBe(1);
        expect(targetDoc.head.querySelector('style').textContent).toBe('.demo { color: blue; }');

        document.head.removeChild(style);
    });
});
