import runPreviewCode, {injectPreviewScope} from '../runPreviewCode';

describe('runPreviewCode', () => {
    it('should execute compiled code in iframe window context', () => {
        const iframeWindow = {
            Function: Function,
            matchMedia: jest.fn(() => ({matches: false, addEventListener: jest.fn()}))
        };
        const onRender = jest.fn();
        const scope = [{name: 'demo', component: {value: 1}}];

        injectPreviewScope(iframeWindow, scope);

        const ok = runPreviewCode({
            iframeWindow,
            compiledCode: 'render(demo.value);',
            scope,
            onRender
        });

        expect(ok).toBe(true);
        expect(onRender).toHaveBeenCalledWith(1);
        expect(iframeWindow.demo).toEqual({value: 1});
    });

    it('should allow code to access iframe window matchMedia', () => {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        const iframeWindow = iframe.contentWindow;
        iframeWindow.matchMedia = jest.fn(() => ({matches: true, addEventListener: jest.fn()}));
        const onRender = jest.fn();

        runPreviewCode({
            iframeWindow,
            compiledCode: 'render(window.matchMedia("(max-width: 768px)").matches);',
            scope: [],
            onRender
        });

        expect(iframeWindow.matchMedia).toHaveBeenCalledWith('(max-width: 768px)');
        expect(onRender).toHaveBeenCalledWith(true);

        document.body.removeChild(iframe);
    });

    it('should return false when iframe window is missing', () => {
        expect(runPreviewCode({
            iframeWindow: null,
            compiledCode: 'render(1);',
            scope: [],
            onRender: jest.fn()
        })).toBe(false);
    });
});
