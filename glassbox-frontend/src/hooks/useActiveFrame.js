// hooks/useActiveFrame.js
import { useState } from 'react';

export function useActiveFrame(frames, topFrame) {
    const [selectedFrameId, setSelectedFrameId] = useState(null);

    // If frames is empty, reset selection
    if (frames.length === 0 && selectedFrameId !== null) {
        setSelectedFrameId(null);
    }

    const activeFrame = selectedFrameId
        ? frames.find((f) => f.id === selectedFrameId) ?? topFrame
        : topFrame;

    return { activeFrame, selectedFrameId, setSelectedFrameId };
}