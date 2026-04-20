import {useState, useEffect, useRef} from 'react';

const useInView = (ref) => {
    const [shouldRender, setShouldRender] = useState(false);
    const heightRef = useRef(0);

    useEffect(() => {
        const container = ref.current;
        if (!container) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setShouldRender(true);
                }
                if (!entry.isIntersecting && entry.intersectionRatio === 0) {
                    const h = container.getBoundingClientRect().height;
                    if (h > 0) {
                        heightRef.current = h;
                    }
                    setShouldRender(false);
                }
            });
        }, {threshold: [0]});

        observer.observe(container);
        return () => observer.disconnect();
    }, [ref]);

    return {shouldRender, heightRef};
};

export default useInView;
