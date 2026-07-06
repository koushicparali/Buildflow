import { useEffect, useRef } from 'react';

export const usePolling = (callback, interval = 10000, dependencies = []) => {
    const savedCallback = useRef();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        function tick() {
            if (savedCallback.current) {
                savedCallback.current();
            }
        }

        // Initial call is handled by the caller or we can do it here if required.
        // Wait, the original code did an initial call. Let's do it:
        tick();
        
        // Setup interval
        if (interval !== null) {
            const timer = setInterval(tick, interval);
            return () => clearInterval(timer);
        }
    }, [interval, ...dependencies]);
};
