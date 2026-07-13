import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { updatePlan } from '../api/plans';

/**
 * Hook to automatically save data after a debounce interval.
 * @param {string} planId - The ID of the plan to save
 * @param {object} data - The current state of the plan data
 * @param {number} delay - Debounce delay in milliseconds
 */
export function useAutoSave(planId, data, delay = 1500) {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const initialDataRef = useRef(data);
    const isFirstRender = useRef(true);

    useEffect(() => {
        // Skip auto-save on initial mount
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // Deep equality check to avoid saving if nothing really changed
        if (JSON.stringify(initialDataRef.current) === JSON.stringify(data)) {
            return;
        }

        const handler = setTimeout(async () => {
            setIsSaving(true);
            try {
                await updatePlan(planId, data);
                setLastSaved(new Date());
                // Silently succeed for auto-saves so we don't spam toasts,
                // but we could use a subtle "Saving..." indicator in the UI.
            } catch (err) {
                console.error("Auto-save failed", err);
                toast.error("Auto-save failed. Please save manually.");
            } finally {
                setIsSaving(false);
            }
        }, delay);

        return () => clearTimeout(handler);
    }, [planId, data, delay]);

    return { isSaving, lastSaved };
}
