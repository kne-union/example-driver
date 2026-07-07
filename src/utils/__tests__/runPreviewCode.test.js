import runPreviewCode from '../runPreviewCode';

describe('runPreviewCode', () => {
    it('should execute compiled code with scope values', () => {
        const onRender = jest.fn();
        const scope = [{name: 'demo', component: {value: 1}}];

        const ok = runPreviewCode({
            compiledCode: 'render(demo.value);',
            scope,
            onRender
        });

        expect(ok).toBe(true);
        expect(onRender).toHaveBeenCalledWith(1);
    });

    it('should allow code to access window matchMedia', () => {
        const originalMatchMedia = window.matchMedia;
        window.matchMedia = jest.fn(() => ({matches: true, addEventListener: jest.fn()}));
        const onRender = jest.fn();

        runPreviewCode({
            compiledCode: 'render(window.matchMedia("(max-width: 768px)").matches);',
            scope: [],
            onRender
        });

        expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 768px)');
        expect(onRender).toHaveBeenCalledWith(true);

        window.matchMedia = originalMatchMedia;
    });

    it('should return false when compiled code is missing', () => {
        expect(runPreviewCode({
            compiledCode: '',
            scope: [],
            onRender: jest.fn()
        })).toBe(false);
    });
});
