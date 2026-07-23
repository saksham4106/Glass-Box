import { Handle, Position } from 'reactflow';

export function HeapNode({ data }) {
    return (
        <>
            {/* Target handles (Incoming) */}
            <Handle type="target" position={Position.Top} id="top" style={{ background: 'transparent', border: 'none' }} />
            <Handle type="target" position={Position.Right} id="right-target" style={{ background: 'transparent', border: 'none' }} />

            {/* Your existing JSX payload renders exactly as before */}
            {data.label}

            {/* Source handles (Outgoing) */}
            <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: 'transparent', border: 'none' }} />
            <Handle type="source" position={Position.Right} id="right-source" style={{ background: 'transparent', border: 'none' }} />
        </>
    );
}