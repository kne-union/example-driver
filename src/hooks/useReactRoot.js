import {useEffect, useRef} from 'react';
import {createRoot} from 'react-dom/client';

const useReactRoot = (containerRef, shouldRender, renderJsx, heightRef) => {
    const reactRootRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        if (!shouldRender) {
            if (reactRootRef.current) {
                const root = reactRootRef.current;
                const savedHeight = heightRef.current;
                reactRootRef.current = null;

                setTimeout(() => {
                    root.unmount();
                    container.innerHTML = '';
                    const placeholder = document.createElement('div');
                    placeholder.className = 'example-driver-placeholder';
                    placeholder.style.height = savedHeight + 'px';
                    container.appendChild(placeholder);
                }, 0);
            }
            return;
        }

        const wasPlaceholder = container.querySelector('.example-driver-placeholder');
        if (wasPlaceholder) {
            wasPlaceholder.remove();
        }

        const root = document.createElement('div');
        root.className = 'example-driver-runner';
        container.appendChild(root);
        const reactRoot = createRoot(root);
        reactRootRef.current = reactRoot;
        reactRoot.render(renderJsx);

        requestAnimationFrame(() => {
            const h = container.getBoundingClientRect().height;
            if (h > 0) {
                heightRef.current = h;
            }
        });
    }, [shouldRender, renderJsx, containerRef, heightRef]);
};

export default useReactRoot;
