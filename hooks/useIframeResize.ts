import { useEffect } from 'react';

export function useIframeResize() {
    useEffect(() => {
        const sendHeight = () => {
            const height = document.documentElement.scrollHeight;
            window.parent.postMessage({ height }, '*');
        };

        sendHeight();
        window.addEventListener('resize', sendHeight);
        const timer = setTimeout(sendHeight, 500);

        return () => {
            window.removeEventListener('resize', sendHeight);
            clearTimeout(timer);
        };
    }, []);
}