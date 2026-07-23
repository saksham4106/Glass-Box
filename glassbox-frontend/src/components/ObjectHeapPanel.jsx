import ReactFlow, { useEdgesState, useNodesState, MarkerType } from "reactflow";
import { useEffect, useMemo, useRef, useCallback } from "react";
import ELK from "elkjs/lib/elk.bundled.js";
import "./ObjectHeapPanel.css";
import { HeapNode } from "./HeapNode.jsx";

const elk = new ELK();

export function ObjectHeapPanel({ step, frame }) {
    let variables = {};

    Object.entries(frame.vars).forEach(([name, data]) => {
        if (data.id) {
            variables[data.id] = name;
        }
    });

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // 1. Maintain a ref of the current nodes to persist coordinates
    const nodesRef = useRef([]);
    useEffect(() => {
        nodesRef.current = nodes;
    }, [nodes]);

    // 2. Track manually dragged nodes so we know which ones to freeze
    const draggedNodesRef = useRef(new Set());

    // Intercept node changes to catch user dragging
    const handleNodesChange = useCallback((changes) => {
        changes.forEach(change => {
            if (change.type === 'position' && change.dragging) {
                draggedNodesRef.current.add(change.id);
            }
        });
        onNodesChange(changes);
    }, [onNodesChange]);

    // 3. Layout Calculation
    useEffect(() => {
        let isMounted = true;

        StateToMemoryGraph(step, nodesRef.current, draggedNodesRef.current).then(({ nodes: newNodes, edges: newEdges }) => {
            if (isMounted) {
                setNodes(newNodes);
                setEdges(newEdges);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [step, setNodes, setEdges]);

    // 4. Dynamic Real-Time Edge Routing
    useEffect(() => {
        setEdges((currentEdges) => {
            let hasChanges = false;

            const updatedEdges = currentEdges.map(edge => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);

                if (!sourceNode || !targetNode) return edge;

                // If target is above or within 20px of the source's horizontal level, loop it right!
                const isUpwardOrSideways = targetNode.position.y < (sourceNode.position.y + 20);

                const optimalSource = isUpwardOrSideways ? 'right-source' : 'bottom';
                const optimalTarget = isUpwardOrSideways ? 'right-target' : 'top';

                if (edge.sourceHandle !== optimalSource || edge.targetHandle !== optimalTarget) {
                    hasChanges = true;
                    return {
                        ...edge,
                        sourceHandle: optimalSource,
                        targetHandle: optimalTarget
                    };
                }
                return edge;
            });

            // Only trigger a React re-render if a handle actually needed to swap
            return hasChanges ? updatedEdges : currentEdges;
        });
    }, [nodes, setEdges]); // Runs every time `nodes` changes (including manual drags!)

    const styledNodes = useMemo(() => {
        return nodes.map((node) => {
            const isSelected = !!variables[node.id];
            const varName = variables[node.id];
            const typeName = node.data.jvmType ? node.data.jvmType.split('$').pop() : '';

            return {
                ...node,
                data: {
                    ...node.data,
                    heading: isSelected ? `${varName} ${node.data.heading || ''}` : node.data.heading,
                    label: (
                        <div className="node-body">
                            <div className="node-header">
                            <span>
                                {isSelected ? (
                                    <strong style={{ color: '#f0a030', marginRight: '4px' }}>
                                        {varName}:
                                    </strong>
                                ) : null}
                                {typeName}
                            </span>
                                <span style={{ fontSize: '9px', opacity: 0.4 }}>#{node.id}</span>
                            </div>
                            {node.data.visibleFields?.map(f => (
                                <div key={f.fieldName} className="node-row">
                                    <span className="node-key">{f.fieldName}:</span>
                                    <span className="node-val-primitive">{f.value.data ?? 'null'}</span>
                                </div>
                            ))}
                        </div>
                    )
                },
                style: {
                    ...node.style,
                    borderColor: isSelected ? '#f0a030' : '#3182ce',
                    borderWidth: isSelected ? '2px' : '1px',
                    boxShadow: isSelected ? '0 0 12px rgba(240, 160, 48, 0.4)' : 'none'
                }
            };
        });
    }, [nodes, variables]);

    const nodeTypes = useMemo(() => ({ heapNode: HeapNode }), []);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={styledNodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={handleNodesChange} // <-- Replaced with wrapped handler
                onEdgesChange={onEdgesChange}
                proOptions={{ hideAttribution: true }}
                fitView
            />
        </div>
    );
}

// Added draggedNodes parameter
async function StateToMemoryGraph(currentStep, previousNodes = [], draggedNodes = new Set()) {
    if (!currentStep) return { nodes: [], edges: [] };

    const { heap } = currentStep;
    const nodes = [];
    const edges = [];

    Object.entries(heap).forEach(([id, objData]) => {
        const visibleFields = objData.objectFields.filter(f => !f.value.id);

        nodes.push({
            id: String(id),
            type: 'heapNode',
            className: 'glass-node glass-node-heap',
            style: {
                background: 'rgba(22, 34, 43, 0.95)',
                color: '#63b3ed',
                border: '1px solid #3182ce',
                borderRadius: '8px',
                padding: '6px 10px',
                width: '130px'
            },
            data: {
                heading: "",
                jvmType: objData.jvmType,
                visibleFields: visibleFields,
                label: null
            }
        });

        objData.objectFields.forEach(field => {
            if (field.value.varType === 'OBJECT' && field.value.id) {
                edges.push({
                    id: `edge-${id}-${field.fieldName}-${field.value.id}`,
                    source: String(id),
                    target: String(field.value.id),
                    label: field.fieldName,
                    type: 'smoothstep',
                    style: { stroke: '#f0a030', strokeWidth: 1.5 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#f0a030',
                    }
                    // Handle assignments completely removed from here!
                });
            }
        });
    });

    return await getLayoutElements(nodes, edges, previousNodes, draggedNodes, 'DOWN');
}

// Added draggedNodes parameter
async function getLayoutElements(nodes, edges, previousNodes = [], draggedNodes = new Set(), direction = 'DOWN') {
    const graph = {
        id: 'root',
        layoutOptions: {
            'elk.algorithm': 'layered',
            'elk.direction': direction,
            'elk.spacing.nodeNode': '50',
            'elk.layered.spacing.nodeNodeBetweenLayers': '60',
            'elk.layered.cycleBreaking.strategy': 'DEPTH_FIRST'
        },
        children: nodes.map(n => ({ id: n.id, width: 130, height: 55 })),
        edges: edges.map(e => ({ id: e.id, sources: [e.source], targets: [e.target] }))
    };

    const layoutedGraph = await elk.layout(graph);

    const layoutedNodes = nodes.map(node => {
        const prevNode = previousNodes.find(n => n.id === node.id);
        const isDragged = draggedNodes.has(node.id); // Check if manually dragged

        const elkNode = layoutedGraph.children.find(n => n.id === node.id);

        // ONLY freeze the position if the user explicitly dragged this specific node
        if (prevNode && prevNode.position && isDragged) {
            return {
                ...node,
                position: prevNode.position
            };
        }

        // Otherwise, use ELK's newly calculated position to keep trees balanced
        return {
            ...node,
            position: { x: elkNode.x, y: elkNode.y }
        };
    });

    // Edges are passed back exactly as-is.
    // The new useEffect will handle mapping sourceHandle and targetHandle dynamically!
    return { nodes: layoutedNodes, edges };
}