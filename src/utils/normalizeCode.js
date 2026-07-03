const normalizeCode = (code) => {
    if (!code || typeof code !== 'string') {
        return '';
    }
    return code.replace(/&amp;#96;/g, '`').replace(/&#96;/g, '`');
};

export default normalizeCode;
