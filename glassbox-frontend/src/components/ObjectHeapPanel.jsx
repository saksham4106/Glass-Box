import ReactFlow, { useEdgesState, useNodesState, MarkerType } from "reactflow";
import {useEffect, useMemo} from "react";
import dagre from "@dagrejs/dagre";
import "./ObjectHeapPanel.css";
import {HeapNode} from "./HeapNode.jsx";

export function ObjectHeapPanel({ step, frame }) {
    let variables = {};

    Object.entries(frame.vars).map(([name, data]) => {
        if(data.id){
           variables[data.id] = name;
        }
    })


    const { nodes: layoutNodes = [], edges: layoutEdges = [] } = StateToMemoryGraph(step, variables);
    const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

    useEffect(() => {
        const { nodes: newNodes, edges: newEdges } = StateToMemoryGraph(step, variables);
        setNodes(newNodes);
        setEdges(newEdges);
    }, [step, setNodes, setEdges]);

    const styledNodes = useMemo(() => {
        return nodes.map((node) => {
            const isSelected = !!variables[node.id];
            const varName = variables[node.id]; // e.g. "root" or "head"

            // Extract original objData stored in node.data or rebuild label dynamically
            const typeName = node.data.jvmType ? node.data.jvmType.split('$').pop() : '';

            return {
                ...node,
                data: {
                    ...node.data,
                    heading: isSelected ? `${varName} ${node.data.heading || ''}` : node.data.heading,
                    // Re-render data.label to reflect isSelected state
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
                // nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                proOptions={{ hideAttribution: true }}
                fitView
            />
        </div>
    );
}

function StateToMemoryGraph(currentStep) {
    if (!currentStep) return { nodes: [], edges: [] };

    const { heap } = currentStep;
    const nodes = [];
    const edges = [];

    // Skip rendering stack frames as nodes entirely!

    // Render Heap Objects
    Object.entries(heap).forEach(([id, objData]) => {
        const visibleFields = objData.objectFields.filter(f => !f.value.id);

        nodes.push({
            id: String(id),
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
                jvmType: objData.jvmType, // Store raw jvmType
                visibleFields: visibleFields, // Store raw visibleFields
                label: null // Will be generated/hydrated by styledNodes
            }
        });


        objData.objectFields.forEach(field => {
            if (field.value.varType === 'OBJECT' && field.value.id) {
                const isBackEdge = Number(field.value.id) < Number(id);

                edges.push({
                    id: `edge-${id}-${field.fieldName}-${field.value.id}`,
                    source: String(id),
                    target: String(field.value.id),
                    label: field.fieldName,
                    type: isBackEdge ? 'default' : 'smoothstep', // Bezier creates a nice sweeping arc for loops
                    style: { stroke: '#f0a030', strokeWidth: 1.5 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#f0a030',
                    }
                });
                // edges.push({
                    // id: `edge-${id}-${field.fieldName}-${field.value.id}`,
                    // source: String(id),            // Node 61 (-4)
                    // target: String(field.value.id), // Node 59 (2)
                    // sourceHandle: isBackwardsEdge ? 'right-source' : 'bottom',
                    // targetHandle: isBackwardsEdge ? 'left-target' : 'top',
                    // label: field.fieldName,
                    // type: 'smoothstep',
                    // style: { stroke: '#f0a030', strokeWidth: 1.5 },
                    // markerEnd: {
                    //     type: MarkerType.ArrowClosed,
                    //     width: 12,
                    //     height: 12,
                    //     color: '#f0a030',
                    // }
                // });
            }
        });
    });

    return getLayoutElements(nodes, edges, 'TB');
}

function getLayoutElements(nodes, edges, direction = 'TB') {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: 25,
        ranksep: 40,
        marginx: 20,
        marginy: 20
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 130, height: 55 });
    });

    // CRITICAL FIX: Only give Dagre acyclic edges!
    // Filter out backward edges (where target ID is smaller or already above)
    const layoutEdges = edges.filter(edge => {
        const sourceNum = Number(edge.source);
        const targetNum = Number(edge.target);

        // If it's a numeric ID comparison, ignore backward links for Dagre ranking
        if (!isNaN(sourceNum) && !isNaN(targetNum)) {
            return sourceNum < targetNum;
        }
        return true;
    });

    // Feed ONLY non-cycle edges to Dagre so it doesn't invert node positions
    layoutEdges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - 65,
                y: nodeWithPosition.y - 27.5,
            },
        };
    });

    // Return the nodes along with ALL original edges (so ReactFlow draws the cycle!)
    return { nodes: layoutNodes, edges };
}