import { Handle, Position } from 'reactflow';

// Custom Heap Node component with 4 handles for smooth cycle routing
export function HeapNode({ data, id }) {
    return (
        <div className="node-body">
            {/* Top (Target) */}
            <Handle type="target" position={Position.Top} id="top" />
            {/* Left (Target/Source for cycles) */}
            <Handle type="target" position={Position.Left} id="left-target" />

            <div className="node-header">
                <span>{data.typeName}</span>
                <span style={{ fontSize: '9px', opacity: 0.4 }}>#{id}</span>
            </div>

            {data.visibleFields?.map(f => (
                <div key={f.fieldName} className="node-row">
                    <span className="node-key">{f.fieldName}:</span>
                    <span className="node-val-primitive">{f.value.data ?? 'null'}</span>
                </div>
            ))}

            {/* Bottom (Source) */}
            <Handle type="source" position={Position.Bottom} id="bottom" />
            {/* Right (Source for cycles) */}
            <Handle type="source" position={Position.Right} id="right-source" />
        </div>
    );
}