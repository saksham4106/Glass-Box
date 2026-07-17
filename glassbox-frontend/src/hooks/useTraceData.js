import { useEffect, useState, useMemo } from 'react';
import { loadTrace } from '../services/traceService.js';
import { buildSteps } from '../lib/traceProcessor.js';

export function useTraceData() {
    const [events, setEvents] = useState(null);

    useEffect(() => {
        loadTrace().then((trace) => setEvents(trace.events));
    }, []);

    const steps = useMemo(() => (events ? buildSteps(events) : []), [events]);

    return { steps, events };
}