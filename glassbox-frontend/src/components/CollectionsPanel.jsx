import { rendererFor } from '../renderers/registry.js';

/**
 * Renders every variable in `frame` whose registered renderer lives in the
 * 'pictorial' area - collections today, trees/graphs/maps later, all
 * without this component needing to know the difference.
 */
export default function CollectionsPanel({ frame, changed }) {
  if (!frame) {
    return (
      <div className="panel collections-panel">
        <h2 className="panel-title">Objects</h2>
        <p className="empty-hint">Nothing to show yet.</p>
      </div>
    );
  }

  const items = Object.entries(frame.vars).filter(([, v]) => rendererFor(v.varType).area === 'pictorial');

  return (
    <div className="panel collections-panel">
      <h2 className="panel-title">Objects — {frame.id}</h2>
      {items.length === 0 ? (
        <p className="empty-hint">No collections in this frame.</p>
      ) : (
        items.map(([name, variable]) => {
          const { Component } = rendererFor(variable.varType);
          const isChanged = changed?.frameId === frame.id && changed.keys.includes(name);
          return (
            <div key={name} className={isChanged ? 'block-changed' : ''}>
              <Component name={name} variable={variable} />
            </div>
          );
        })
      )}
    </div>
  );
}
