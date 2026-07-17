import { frameLabel } from '../lib/traceProcessor.js';
import Graph from "./Graph.jsx";

/**
 * Visualizes the current call stack. Newest call renders on top, matching
 * how people usually picture a call stack growing. Clicking a frame pins
 * the Locals/Objects panels to it - useful once recursion puts more than
 * one frame on the stack at once.
 */
export default function CallStack({ frames, selectedFrameId, activeFrameId, onSelect, steps, stepIndex, graphOrStack }) {
  const stackOrder = [...frames].reverse();

  if(graphOrStack) {
      return (
          <div style={{ height: '100%', width: '100%' }}>
              <Graph
                  steps={steps}
                  stepIndex={stepIndex}
                  selectedFrameId={activeFrameId}
              />
          </div>
      );

  }

  return (
    <div className="panel stack-panel">
      {stackOrder.length === 0 ? (
        <p className="empty-hint">No active frames.</p>
      ) : (
        <div className="stack-list">
          {stackOrder.map((frame) => {
            const isActive = frame.id === activeFrameId;
            const isSelected = selectedFrameId ? frame.id === selectedFrameId : isActive;

            let label = frameLabel(frame.id);
            const primitives = Object.entries(frame.vars)
                .filter(([_, v]) => v.varType === 'PRIMITIVE')
                .slice(0, 3)
                .map(([name, v]) => `${name}=${v.data}`)
                .join(',');
            label = label.slice(0, -1).concat(primitives).concat(")");

            return (
              <button
                key={frame.id}
                className={[
                  'frame-card',
                  isActive ? 'frame-active' : '',
                  isSelected ? 'frame-selected' : '',
                ].join(' ')}
                onClick={() => onSelect(frame.id)}
              >
                <span className="frame-name">{
                  label
                }</span>
                {frame.currentLine != null && (
                  <span className="frame-line">line {frame.currentLine}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
