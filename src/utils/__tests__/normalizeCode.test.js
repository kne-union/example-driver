import normalizeCode from '../normalizeCode';

describe('normalizeCode', () => {
    it('should restore backticks from HTML entities', () => {
        expect(normalizeCode('const code = &#96;')).toBe('const code = `');
        expect(normalizeCode('const code = &amp;#96;')).toBe('const code = `');
    });

    it('should leave normal code unchanged', () => {
        const code = 'const code = `hello`;\nrender(<App />);';
        expect(normalizeCode(code)).toBe(code);
    });

    it('should handle empty input', () => {
        expect(normalizeCode('')).toBe('');
        expect(normalizeCode(null)).toBe('');
    });
});
