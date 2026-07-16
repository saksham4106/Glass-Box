import sampleTrace from '../data/sampleTrace.json';

/**
 * Loads a trace (a `{ events: [...] }` object produced by the JDI backend).
 *
 * Right now this just returns the bundled sample JSON so the frontend can be
 * built and tested without a running backend. When the real API exists, swap
 * the body for something like:
 *
 *   export async function loadTrace(runId) {
 *     const res = await fetch(`/api/traces/${runId}`);
 *     if (!res.ok) throw new Error(`Failed to load trace: ${res.status}`);
 *     return res.json();
 *   }
 *
 * The async signature is kept identical on purpose so nothing that calls
 * loadTrace() needs to change when the swap happens.
 */
export async function loadTrace() {
  return sampleTrace;
}
