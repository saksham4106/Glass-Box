/**
 * Turns a flat `events` array (as produced by the JDI backend) into an array
 * of `steps`, one per point in time, each holding the FULL state of the
 * program at that instant: every live frame, its variables, and everything
 * printed so far.
 *
 * Why precompute every step instead of replaying events on demand?
 * Stepping backward needs to be instant and correct, and the event log only
 * gives us *diffs* (a `local` event carries just the variables that changed
 * on that line). Rebuilding "what did frame X look like 40 steps ago" by
 * replaying from the start every time you click "back" would be wasteful
 * and, in a UI, laggy. So we walk the log exactly once, and at each event we
 * fold it into the running state and snapshot the result. Going back in
 * time then is just `steps[i]` - an array lookup, not a re-simulation.
 *
 * Memory note: because state updates below are done immutably (spreading
 * into new objects rather than mutating in place), unchanged frames are
 * *shared by reference* across snapshots rather than copied. So this is
 * cheaper than it looks - closer to a persistent data structure than N full
 * deep copies. Still O(steps) memory, which is fine for LeetCode-sized runs.
 */
export function buildSteps(events) {
  let frames = []; // ordered oldest -> newest (top of call stack = last)
  let output = [];

  let heap = {}


  const steps = [makeStep({ frames, output, heap, event: null, changed: null })];

  for (const event of events) {
    const result = applyEvent({ frames, output, heap }, event);
    frames = result.frames;
    output = result.output;
    heap = result.heap;

    steps.push(makeStep({ frames, output, heap,  event, changed: result.changed }));
  }

  return steps;
}

/**
 * Applies a single event to the current (frames, output) state and returns
 * the next state, plus a `changed` descriptor used to drive the
 * "value just changed" highlight animation in the UI.
 *
 * Adding a new event type later (e.g. an "exception" event) means adding a
 * case here - nothing else in this file needs to know about it.
 */
function applyEvent({ frames, output, heap }, event) {
  let nextHeap = event.heap ? {...heap, ...event.heap} : heap;

  switch (event.type) {
    case 'push_frame': {
      const vars = event.args ?? {};
      const newFrame = {
        id: event.frame,
        parent: event.parent,
        currentLine: event.line,
        vars,
      };
      return {
        frames: [...frames, newFrame],
        output,
        heap: collectGarbage([...frames, newFrame], nextHeap),
        changed: { frameId: event.frame, keys: Object.keys(vars) },
      };
    }

    case 'local': {
      const keys = Object.keys(event.varState ?? {});
      const nextFrames = frames.map((frame) =>
        frame.id === event.frameId
          ? { ...frame, currentLine: event.line, vars: { ...frame.vars, ...event.varState } }
          : frame
      );
      return { frames: nextFrames, output,
        heap: collectGarbage(nextFrames, nextHeap), changed: { frameId: event.frameId, keys } };
    }

    case 'sysout': {
      return { frames, output: [...output, event.data], heap, changed: null };
    }

    case 'syserr': {
      return { frames, output: [...output, event.data], heap, changed: null };
    }

    case 'pop': {
      const nextFrames = frames.filter((f) => f.id !== event.frame);
      return { frames: nextFrames, output, heap: collectGarbage(nextFrames, nextHeap), changed: null };
    }

    default: {
      // Unknown event types are ignored rather than crashing the app, so a
      // backend change that adds a new event type won't break playback of
      // older traces - it'll just be a no-op until a case is added above.
      return { frames, output, heap, changed: null };
    }
  }
}

function makeStep({ frames, output, heap, event, changed }) {
  return { frames, output, heap, event, changed, label: describeEvent(event) };
}

/** Human-readable label for the current step, used in the controls bar and timeline tooltips. */
export function describeEvent(event) {
  if (!event) return 'Start';
  switch (event.type) {
    case 'push_frame':
      return `Called ${frameLabel(event.frame)}`;
    case 'local':
      return `Line ${event.line}`;
    case 'sysout':
      return `Printed "${event.data}"`;
    case 'pop': {
      const ret = event.return;
      const suffix = ret && ret.data !== '<void value>' ? ` \u2192 returned ${ret.data}` : ' \u2192 returned';
      return `Left ${frameLabel(event.frame)}${suffix}`;
    }
    default:
      return event.type;
  }
}

/** "main_0" -> "main()" - strips the JDI-assigned uniqueness suffix for display. */
export function frameLabel(frameId) {
  const idx = frameId.lastIndexOf('_');
  return idx === -1 ? frameId : `${frameId.slice(0, idx)}()`;
}

function collectGarbage(frames, rawHeap) {
  if(!rawHeap || Object.keys(rawHeap).length === 0) return {};

  const reachable = new Set();
  const queue = [];

  for(const frame of frames) {
    for(const variable of Object.values(frame.vars)){
      if(variable.varType === 'OBJECT' && variable.id){
        queue.push(String(variable.id));
      }
    }
  }

  while(queue.length > 0){
    const id = queue.pop();

    if(!reachable.has(id)){
      reachable.add(id);

      const obj = rawHeap[id];
      if(obj && obj.objectFields){
        for(const field of obj.objectFields){
          if(field.value.varType === 'OBJECT' && field.value.id){
            queue.push(String(field.value.id));
          }
        }
      }
    }
  }

  const cleanedHeap = {};
  for(const id of reachable){
    if(rawHeap[id]){
      cleanedHeap[id] = rawHeap[id];
    }
  }

  return cleanedHeap;
}
