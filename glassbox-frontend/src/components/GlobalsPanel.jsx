import {rendererFor} from "../renderers/registry.js";

/**
 * Placeholder for static/global state.
 *
 * The JDI backend emits globals as their own event stream, separate from
 * frame locals. Once the event shape is settled, buildSteps() should track
 * a `globals` bucket in each step - parallel to `frames`, but never
 * pushed/popped, just updated - and this panel reads from that instead of
 * any one frame's `vars`.
 */
export default function GlobalsPanel({step, changed}) {
    if (!step.globals) {
        return (
            <div className="panel locals-panel">
                <p className="empty-hint">Nothing on the stack yet.</p>
            </div>
        );
    }
    const globalEntries = [];
    Object.entries(step.globals || {}).forEach(([key, value]) => {
        // If your globals are nested by class (e.g., { "DebuggerTest": { "log": {...} } })
        // you need an inner loop here. If they are flat, just push them directly:
        if (value && !value.varType) { // Detects if it's a nested class object
            Object.entries(value).forEach(([varName, varData]) => {
                globalEntries.push([`${varName} (static)`, varData]);
            });
        } else {
            globalEntries.push([`${key} (static)`, value]);
        }
    });

    const currentFrame = step.frames[step.frames.length - 1];
    if (!currentFrame) return null;

    // 2. Check if this frame belongs to an object instance
    const thisPointer = currentFrame.vars["this"];
    if (!thisPointer || !thisPointer.id) return <div>Static Context</div>;

    // 3. Look up that object in the heap!
    const currentObject = step.heap[thisPointer.id];
    const instanceEntries = [];
    if (currentObject && currentObject.objectFields) {
        currentObject.objectFields.forEach(field => {
            instanceEntries.push([`this.${field.fieldName}`, field.value]);
        });
    }

    const combinedVariables = [...globalEntries, ...instanceEntries];

// 4. Run your existing filter on the unified list
    const rows = combinedVariables.filter(([, v]) => rendererFor(v.varType).area === 'table');

    return (
        <div className="panel locals-panel">
            <center><h2 className="panel-title">{"global"}</h2></center>
            {rows.length === 0 ? (
                <p className="empty-hint">No primitives in global scope.</p>
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
                        const isChanged = changed?.keys?.includes(name);
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
