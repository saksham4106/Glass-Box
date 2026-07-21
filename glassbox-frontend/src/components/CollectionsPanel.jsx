import { rendererFor } from '../renderers/registry.js';
import { getTrackingConfig} from "../services/trackingConfig.js";

/**
 * Renders every variable in `frame` whose registered renderer lives in the
 * 'pictorial' area - collections today, trees/graphs/maps later, all
 * without this component needing to know the difference.
 */
export default function CollectionsPanel({ frame, changed, trackingConfig }) {
  if (!frame) {
    return (
      <div className="panel collections-panel">
        <p className="empty-hint">Nothing to show yet.</p>
      </div>
    );
  }
  const config = trackingConfig || getTrackingConfig(frame.id);
  const pointers = config?.pointers || {};
  const trackedPrimitives = Object.keys(pointers);

  const items = Object.entries(frame.vars).filter(([, v]) => rendererFor(v.varType).area === 'pictorial');

  return (
    <div className="panel collections-panel">
      <center><h2 className="panel-title">{frame.id}</h2></center>
      {items.length === 0 ? (
        <p className="empty-hint">No collections in this frame.</p>
      ) : (
        items.map(([name, variable]) => {
          const { Component } = rendererFor(variable.varType);
          const isChanged = changed?.frameId === frame.id && changed.keys.includes(name);


          const tracking = Object.keys(frame.vars)
              .filter(key => trackedPrimitives.includes(key))
              .filter(key => pointers[key]["target"] === name)
              .reduce((result, key) => {
                result[key] = {
                  data: frame.vars[key]["data"],
                  axis: pointers[key]["axis"],
                }
                return result;
              }, {});

          return (
            <div key={name} className={isChanged ? 'block-changed' : ''}>

              <Component name={name} variable={variable} track={tracking} />
            </div>
          );
        })
      )}
    </div>
  );
}
