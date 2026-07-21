import {useEffect, useMemo, useState} from 'react';
import {loadTrace} from '../services/traceService.js';
import {buildSteps} from '../lib/traceProcessor.js';

export function useTraceData({ code }) {
    const [events, setEvents] = useState(null);
    const [preRunErrors, setPreRunErrors] = useState(null);

    useEffect(() => {
        loadTrace({ code }).then((trace) => {

            if(trace){
                if (trace.events) {
                    console.log(`useTraceData: Successfully found ${trace.events.length} events. Setting state.`);
                    setEvents(trace.events);
                } else {
                    console.log(`useTraceData: Events did not generate. Error`);
                    setPreRunErrors(trace.trace);
                }
            }else{
                console.error("No trace found");
            }

        }).catch(err => {
            console.error("useTraceData: Error during loadTrace execution:", err);
        });
    }, [code]); // Added 'code' dependency so it updates cleanly if code changes

    const steps = useMemo(() => {
        if (!events) return [];
        return buildSteps(events);
    }, [events]);

    return { steps, events, preRunErrors };
}