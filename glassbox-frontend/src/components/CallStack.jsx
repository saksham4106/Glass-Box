import { frameLabel } from '../lib/traceProcessor.js';

/**
 * Visualizes the current call stack. Newest call renders on top, matching
 * how people usually picture a call stack growing. Clicking a frame pins
 * the Locals/Objects panels to it - useful once recursion puts more than
 * one frame on the stack at once.
 */
export default function CallStack({ frames, selectedFrameId, activeFrameId, onSelect }) {
  const stackOrder = [...frames].reverse();

  return (
    <div className="panel stack-panel">
      <h2 className="panel-title">Call stack</h2>
      {stackOrder.length === 0 ? (
        <p className="empty-hint">No active frames.</p>
      ) : (
        <div className="stack-list">
          {stackOrder.map((frame) => {
            const isActive = frame.id === activeFrameId;
            const isSelected = selectedFrameId ? frame.id === selectedFrameId : isActive;
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
                <span className="frame-name">{frameLabel(frame.id)}</span>
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
