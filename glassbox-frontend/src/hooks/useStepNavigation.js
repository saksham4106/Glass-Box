import { useEffect, useState } from 'react';

export function useStepNavigation(stepsLength) {
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        if (stepsLength === 0) return;

        function handleKey(e) {
            if (e.key === 'ArrowRight') {
                setStepIndex((i) => Math.min(i + 1, stepsLength - 1));
            }
            if (e.key === 'ArrowLeft') {
                setStepIndex((i) => Math.max(i - 1, 0));
            }
        }

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [stepsLength]);

    const goPrev = () => setStepIndex((i) => Math.max(i - 1, 0));
    const goNext = () => setStepIndex((i) => Math.min(i + 1, stepsLength - 1));

    return { stepIndex, setStepIndex, goPrev, goNext };
}