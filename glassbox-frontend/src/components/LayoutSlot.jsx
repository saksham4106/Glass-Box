import CodePanel from './CodePanel.jsx';
import GlobalsPanel from './GlobalsPanel.jsx';
import LocalsTable from './LocalsTable.jsx';
import ObjectPanel from './ObjectPanel.jsx';
import CallStack from './CallStack.jsx';
import ConsoleOutput from './ConsoleOutput.jsx';

const PANEL_CONFIG = {
    code: {
        title: 'Source Code',
        areaClass: 'area-code',
        render: ({ code, setCode, activeFrame, setStepIndex, stepIndex, steps, label, goPrev, goNext}) => (
            <CodePanel line={activeFrame?.currentLine || []} code={code} setCode={setCode} steps={steps}
            setStepIndex={setStepIndex} stepIndex={stepIndex} label={label} goPrev={goPrev} goNext={goNext} />
        ),
    },
    globals: {
        title: 'Globals',
        areaClass: 'area-globals scrollable-y',
        render: ({ step, changed }) => <GlobalsPanel step={step} changed={changed} />,
    },
    locals: {
        title: 'Locals',
        areaClass: 'area-locals scrollable-y',
        render: ({ activeFrame, changed }) => <LocalsTable frame={activeFrame} changed={changed} />,
    },
    visualizer: {
        title: 'Object Visualizer',
        areaClass: 'area-main scrollable-y',
        render: ({ activeFrame, changed, isGraph, steps, stepIndex }) =>
            <ObjectPanel frame={activeFrame} changed={changed} isGraph={isGraph} stepIndex={stepIndex} steps={steps} />,
    },
    stack: {
        title: 'Call Stack',
        areaClass: 'area-stack scrollable-y',
        render: ({ frames, selectedFrameId, topFrame, setSelectedFrameId, steps, stepIndex, graphOrStack}) => (
            <CallStack
                frames={frames}
                stepIndex={stepIndex}
                selectedFrameId={selectedFrameId}
                activeFrameId={topFrame?.id ?? null}
                onSelect={setSelectedFrameId}
                steps={steps}
                graphOrStack={graphOrStack}
            />
        ),
    },
    console: {
        title: 'Console Output',
        areaClass: 'area-console',
        render: ({ output }) => <ConsoleOutput lines={output} />,
    },
};


export function LayoutSlot({
                               slotId,
                               panelType,
                               isOver,
                               isDragging,
                               onDragStart,
                               onDragOver,
                               onDragLeave,
                               onDrop,
                               onDragEnd,
                               panelProps,
                               onDoubleClick
                           }) {
    const config = PANEL_CONFIG[panelType];
    if (!config) return null;

    return (
        <div
            className={`${config.areaClass} swappable-wrapper`}
            onDragOver={(e) => onDragOver(e, slotId)}
            onDragLeave={() => onDragLeave(slotId)}
            onDrop={(e) => onDrop(e, slotId)}
            onDoubleClick={(e) => onDoubleClick(e, slotId)}
        >
            <div className={`panel swappable-panel ${isOver ? 'drag-over' : ''} ${isDragging ? 'is-dragging' : ''}`}>
                <div
                    className="panel-header-drag"
                    draggable
                    onDragStart={(e) => onDragStart(e, slotId)}
                    onDragEnd={onDragEnd}
                >
                    <span className="panel-title">{config.title}</span>
                    <span className="drag-handle">⋮⋮</span>
                </div>
                <div className="panel-content">{config.render(panelProps)}</div>
            </div>
        </div>
    );
}