import { rendererFor } from '../renderers/registry.js';

/**
 * NAME | TYPE | VALUE table for every variable in `frame` whose renderer is
 * registered for the 'table' area (primitives today). Doesn't know or care
 * how a value is formatted - that's delegated to the registered renderer.
 */
export default function LocalsTable({ frame, changed }) {
  if (!frame) {
    return (
      <div className="panel locals-panel">
        <h2 className="panel-title">Locals</h2>
        <p className="empty-hint">Nothing on the stack yet.</p>
      </div>
    );
  }

  const rows = Object.entries(frame.vars).filter(([, v]) => rendererFor(v.varType).area === 'table');

  return (
    <div className="panel locals-panel">
      <h2 className="panel-title">Locals — {frame.id}</h2>
      {rows.length === 0 ? (
        <p className="empty-hint">No primitives in this frame.</p>
      ) : (
        <table className="locals-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, variable]) => {
              const { Component } = rendererFor(variable.varType);
              const isChanged = changed?.frameId === frame.id && changed.keys.includes(name);
              return (
                <tr key={name} className={isChanged ? 'row-changed' : ''}>
                  <td className="cell-name">{name}</td>
                  <td className="cell-type">{variable.jvmType}</td>
                  <td className="cell-value-wrap">
                    <Component variable={variable} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
