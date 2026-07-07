import {useEffect, useState} from 'react';
import {MOBILE_BREAKPOINT} from '../utils/devicePreview';

const getIsMobile = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return false;
    }
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
};

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(getIsMobile);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }
        const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
        const handleChange = event => setIsMobile(event.matches);
        setIsMobile(mediaQuery.matches);
        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
    }, []);

    return isMobile;
};

export default useIsMobile;
