import { useState, useEffect } from 'react';

interface WindowDimensions {
    width: number;
    height: number;
}

export default function useWindowDimensions(): WindowDimensions {
    const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        function getWindowDimensions(): WindowDimensions {
            const { innerWidth: width, innerHeight: height } = window;
            return { width, height };
        }

        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        handleResize(); // set initial size
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
}
