import { useEffect, useMemo, useState } from 'react';
import { loadTrace } from './services/traceService.js';
import { buildSteps } from './lib/traceProcessor.js';
import CallStack from './components/CallStack.jsx';
import LocalsTable from './components/LocalsTable.jsx';
import CollectionsPanel from './components/CollectionsPanel.jsx';
import ConsoleOutput from './components/ConsoleOutput.jsx';
import Controls from './components/Controls.jsx';
import Timeline from './components/Timeline.jsx';
import CodePanel from './components/CodePanel.jsx';
import GlobalsPanel from './components/GlobalsPanel.jsx';

export default function App() {
  const [events, setEvents] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedFrameId, setSelectedFrameId] = useState(null);

  useEffect(() => {
    // loadTrace() resolves to the whole trace object ({ events: [...] }),
    // matching what the real API will eventually send - so unwrap it here.
    loadTrace().then((trace) => setEvents(trace.events));
  }, []);

  const steps = useMemo(() => (events ? buildSteps(events) : []), [events]);

  // Arrow-key stepping, PythonTutor-style.
  useEffect(() => {
    if (steps.length === 0) return;
    function handleKey(e) {
      if (e.key === 'ArrowRight') setStepIndex((i) => Math.min(i + 1, steps.length - 1));
      if (e.key === 'ArrowLeft') setStepIndex((i) => Math.max(i - 1, 0));
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [steps.length]);

  if (!events || steps.length === 0) {
    return <div className="app-loading">Loading trace…</div>;
  }

  const step = steps[stepIndex];
  const { frames, output, changed, label } = step;
  const topFrame = frames[frames.length - 1] ?? null;

  // If nothing is explicitly selected (or the selected frame has since been
  // popped / not yet pushed at this step), fall back to the top of stack.
  const activeFrame = selectedFrameId
    ? frames.find((f) => f.id === selectedFrameId) ?? topFrame
    : topFrame;

  return (
    <div className="app">
      <header className="app-header">
        <h1>GlassBox</h1>
        <p className="app-subtitle">Java execution visualizer</p>
      </header>

      <Timeline steps={steps} stepIndex={stepIndex} onJump={setStepIndex} />

      <Controls
        stepIndex={stepIndex}
        totalSteps={steps.length}
        label={label}
        onPrev={() => setStepIndex((i) => Math.max(i - 1, 0))}
        onNext={() => setStepIndex((i) => Math.min(i + 1, steps.length - 1))}
      />

      <main className="layout">
        <div className="area-code">
          <CodePanel
              line={activeFrame?.currentLine || []}
          />
        </div>

        <div className="area-main">
          {/* Stand-in for the checkbox-driven multi-variable view. */}
          <CollectionsPanel frame={activeFrame} changed={changed} />
        </div>

        <div className="area-stack">
          <CallStack
            frames={frames}
            selectedFrameId={selectedFrameId}
            activeFrameId={topFrame?.id ?? null}
            onSelect={setSelectedFrameId}
          />
        </div>

        <div className="area-locals">
          <LocalsTable frame={activeFrame} changed={changed} />
        </div>

        <div className="area-globals">
          <GlobalsPanel />
        </div>
      </main>

      <ConsoleOutput lines={output} />
    </div>
  );
}
