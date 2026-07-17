import ReactFlow, {useNodesState, useEdgesState, Position} from 'reactflow';
import dagre from '@dagrejs/dagre';
import 'reactflow/dist/style.css';
import {useEffect, useMemo} from "react";
import {frameLabel} from "../lib/traceProcessor.js";


function getLayoutElements(nodes, edges, direction = 'TB') {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 5,
        ranksep: 35,

        marginx: 10,
        marginy: 10
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 150, height: 40 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - 75,
                y: nodeWithPosition.y - 20,
            },
        };
    });

    return { nodes: layoutNodes, edges };
}


function FramesToTree({steps}) {
    if (!steps || steps.length === 0) {
        return { nodes: [], edges: [] };
    }

    const initialNodes = steps.filter((step) => step?.event?.type === 'push_frame').map(({event}) => (
        {
        id: event.frame,
        data: {label: frameLabel(event.frame).slice(0, -1).concat(Object.entries(event.args)
                .filter(([_, v]) => v.varType === 'PRIMITIVE')
                .slice(0, 3)
                .map(([name, v]) => `${name}=${v.data}`)
                .join(',')).concat(")")},

        position: {x: 0, y: 0},
        style: {
            background: '#1e2a2a',
            color: '#d4d4d4',
            border: '1px solid #4a9eff',
            borderRadius: '10px',
            padding: '10px',
            width: 'fit-content',
            textAlign: 'center',
            fontFamily: 'monospace',
            fontSize: '15px',
        }
    }));


    const initialEdges = steps
        .filter((step) => step?.event?.parent != null)
        .map(({event}) => ({
            id: `edge-${event.parent}-${event.frame}`,
            source: event.parent,
            target: event.frame,
            style: { stroke: '#4a9eff', strokeWidth: 2 },
        }));


    // Layout with Dagre
    const { nodes, edges } = getLayoutElements(initialNodes, initialEdges);
    return { nodes, edges };

}

export default function Graph({ steps, selectedFrameId, stepIndex }) {
    const { nodes: layoutNodes = [], edges: layoutEdges = [] } = FramesToTree({ steps });
    const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

    // Sync state when steps change
    useEffect(() => {
        const { nodes: newNodes, edges: newEdges } = FramesToTree({ steps });
        setNodes(newNodes);
        setEdges(newEdges);
    }, [steps, setNodes, setEdges]);

    const poppedFramesMap = useMemo(() => {
        const popped = new Map(); // key: frameId, value: return value string
        for (let i = 0; i <= stepIndex; i++) {
            const step = steps?.[i];
            if (step?.event?.type === 'pop') {
                // Read the return value (fallback to "void" or empty if none)
                const retValue = step.event.return.data ?? 'void';
                popped.set(step.event.frame, retValue);
            }
        }
        return popped;
    }, [steps, stepIndex]);


    const styledNodes = useMemo(() => {
        return nodes.map((node) => {
            const isSelected = node.id === selectedFrameId;
            const hasPopped = poppedFramesMap.has(node.id);
            const returnVal = poppedFramesMap.get(node.id);
            // ${node.data.label} →
            return {
                ...node,
                data: {
                    ...node.data,
                    label: hasPopped
                        ? `${node.data.label} → ${returnVal}`
                        : node.data.label
                },
                style: {
                    ...node.style,
                    background: hasPopped ? "#161e1e" : node.style.background,
                    color: hasPopped ? '#666666' : node.style.color,
                    borderColor: hasPopped
                        ? '#2a5e8f' // Faded blue border
                        : isSelected
                            ? '#f0a030' // Orange selection border
                            : '#4a9eff',

                    borderWidth: isSelected ? '3px' : '1px',
                    // opacity: hasPopped ? 0.6 : 1, // Fades the entire node slightly
                }}
        });
    }, [nodes, selectedFrameId, poppedFramesMap]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={styledNodes} // Use the dynamically styled nodes here
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                proOptions={{ hideAttribution: true }}
                fitView
            />
        </div>
    );
}