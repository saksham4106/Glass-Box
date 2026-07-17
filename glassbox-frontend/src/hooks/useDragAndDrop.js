import { useState } from 'react';

export function useDragAndDrop(initialLayout) {
    const [layout, setLayout] = useState(initialLayout);
    const [draggedSlot, setDraggedSlot] = useState(null);
    const [dragOverSlot, setDragOverSlot] = useState(null);

    const handleDragStart = (e, slotId) => {
        setDraggedSlot(slotId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, slotId) => {
        e.preventDefault();
        if (draggedSlot !== slotId && dragOverSlot !== slotId) {
            setDragOverSlot(slotId);
        }
    };

    const handleDragLeave = (slotId) => {
        if (dragOverSlot === slotId) {
            setDragOverSlot(null);
        }
    };

    const handleDrop = (e, targetSlotId) => {
        e.preventDefault();
        setDragOverSlot(null);
        if (!draggedSlot || draggedSlot === targetSlotId) return;

        setLayout((prev) => ({
            ...prev,
            [draggedSlot]: prev[targetSlotId],
            [targetSlotId]: prev[draggedSlot],
        }));
        setDraggedSlot(null);
    };

    const handleDragEnd = () => {
        setDraggedSlot(null);
        setDragOverSlot(null);
    };

    return {
        layout,
        draggedSlot,
        dragOverSlot,
        handleDragStart,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleDragEnd,
    };
}