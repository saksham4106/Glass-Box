# GlassBox frontend

A PythonTutor-style step-through visualizer for traced Java execution
(JDI backend produces the trace; this renders it). Built for small,
single-file, LeetCode-shaped programs.

## Run it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. It currently loads the bundled
`src/data/sampleTrace.json` instead of hitting a real API - see
"Wiring up the real backend" below.

## How a trace becomes a UI

```
events (flat log, one entry per debugger step)
        │
        ▼  buildSteps()          src/lib/traceProcessor.js
steps[]  — one full snapshot per point in time:
           { frames, output, changed, label, event }
        │
        ▼
      App.jsx  — holds stepIndex + selectedFrameId, picks steps[stepIndex]
        │
        ├─ Timeline        — scrubber, one tick per step, colored by event type
        ├─ Controls        — Back / Next + step label
        ├─ CallStack       — stacked frame cards (push_frame / pop)
        ├─ LocalsTable     — scalar vars for the active frame, as a table
        └─ CollectionsPanel — structured vars for the active frame, pictorially
```

The backend only ever sends **diffs**: a `local` event carries just the
variables that changed on that line, and `push_frame` carries the
frame's initial parameters in the same shape. `buildSteps` folds each
event into the running state immutably (new objects for what changed,
shared references for what didn't) and snapshots the result. That's
why stepping backward is an instant array lookup (`steps[i]`) rather
than a re-simulation, and why unaffected frames aren't copied on every
step.

## Adding a new variable type (trees, graphs, maps, ...)

This is the part built to grow. Everything about "how does a variable
look" is decided in one place: `src/renderers/registry.js`.

1. Write a component that takes `{ name, variable }` (`variable` has
   whatever shape your backend sends for that `varType` - e.g. `nodes`
   + `edges` for a graph).
2. Register it:

   ```js
   import TreeValue from './TreeValue.jsx';

   export const variableRenderers = {
     PRIMITIVE: { area: 'table', Component: PrimitiveValue },
     COLLECTION: { area: 'pictorial', Component: CollectionValue },
     TREE: { area: 'pictorial', Component: TreeValue }, // new
   };
   ```

`area: 'table'` puts it in the scalar locals table; `'pictorial'` gives
it its own block in the Objects panel. `LocalsTable.jsx` and
`CollectionsPanel.jsx` both just iterate a frame's variables and look
up the renderer - neither needs to change.

Unregistered types don't crash the app: they fall back to
`UnknownValue.jsx`, which dumps the raw JSON so a new backend type is
visible (if ugly) instead of silently missing.

## Wiring up the real backend

Everything trace-loading related is isolated in
`src/services/traceService.js`. Swap `loadTrace()`'s body for a
`fetch()` call; its `async` signature already matches, so nothing else
in the app changes.

## Project layout

```
src/
  data/sampleTrace.json     stand-in "API response" for local dev
  services/traceService.js  the only file that knows where trace data comes from
  lib/traceProcessor.js     events -> steps
  renderers/                variable-type -> component registry + the renderers themselves
  components/               UI panels (CallStack, LocalsTable, CollectionsPanel, Timeline, Controls, ConsoleOutput)
  App.jsx                   wires state (stepIndex, selectedFrameId) to the panels
```

## Known limitations (by design, for now)

- No animation on push/pop itself yet (frame cards just appear/disappear).
- Collections render as a flat row of boxes; no nesting for
  collections-of-collections yet.
- No object identity / pointer arrows between a frame slot and a heap
  object (PythonTutor-style) - collections are rendered inline in the
  frame that references them instead.
