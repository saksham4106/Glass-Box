import {useEffect, useState} from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { useTraceData } from './hooks/useTraceData';
import { useStepNavigation } from './hooks/useStepNavigation';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useActiveFrame } from './hooks/useActiveFrame';
import { LayoutSlot } from './components/LayoutSlot';
import CodeInputScreen from "./components/CodeInputScreen.jsx";
import {Mosaic} from "react-loading-indicators";

const INITIAL_LAYOUT = {
  slot_1: 'code',
  slot_2: 'globals',
  slot_3: 'locals',
  slot_4: 'visualizer',
  slot_5: 'stack',
  slot_6: 'console',
};

export default function App() {
  const [code, setCode] = useState(`class Solution {\n\tpublic static void main(String[] args){\n\t\tint a = 1 + 2;\n\t}\n}`);
  const [isVisualizing, visualize] = useState(false);
  // Store the error in App state so it persists if visualization fails
  const [error, setError] = useState(null);

  if (!isVisualizing) {
    return (
        <div>
          <CodeInputScreen
              code={code}
              setCode={setCode}
              visualize={visualize}
              error={error} // Pass the error
              setError={setError}
          />
        </div>
    );
  }

  return <Visualizer code={code} setError={setError} visualize={visualize} />;
}

// 2. Visualizer Component: Encapsulates all hooks and trace layout logic
function Visualizer({ code, setError, visualize }) {
  const [graphOrStack, setGraphOrStack] = useState(false);
  const [isGraph, setIsGraph] = useState(false);

  // 1. Core navigation and data hooks
  const { steps, preRunErrors } = useTraceData({ code });
  const { stepIndex, setStepIndex, goPrev, goNext } = useStepNavigation(steps?.length || 0);

  const {
    layout,
    draggedSlot,
    dragOverSlot,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  } = useDragAndDrop(INITIAL_LAYOUT);

  // 2. Safely compute parameters for useActiveFrame so it can run unconditionally
  const step = steps && steps.length > 0 ? steps[stepIndex] : null;
  const {
    frames = [],
    output = [],
    heap = {},
    globals = {},
    changed = {},
    label = ''
  } = step || {};
  const topFrame = frames.length > 0 ? frames[frames.length - 1] : null;

  // 3. This hook MUST be called here so it runs every single render
  const { activeFrame, selectedFrameId, setSelectedFrameId } = useActiveFrame(frames, topFrame);

  useEffect(() => {
    if (preRunErrors) {
      setError(preRunErrors);
      visualize(false);
    }
  }, [preRunErrors, setError, visualize]);

  function handleDoubleClick(e, slotId) {
    const componentInSlot = layout[slotId];
    if (componentInSlot === 'stack') {
      setGraphOrStack((prev) => !prev);
    }else if(componentInSlot === 'visualizer') {
      setIsGraph(prev => !prev);
    }
  }

  // 4. NOW it is completely safe to return early for the loading state
  if ((!steps || steps.length === 0) && !preRunErrors) {
    return (
        <div className="app-loading">
          <Mosaic
              color={[
                "#20232f", // --panel-alt (subtle dark base)
                "#4fb8ae", // --accent-teal (brand teal)
                "#8c7ae6", // --accent-violet (brand violet)
                "#e8a94a"  // --accent-amber (brand amber/active)
              ]}
          />
        </div>
    );
  }

  const panelProps = {
    code,
    activeFrame,
    changed,
    frames,
    selectedFrameId,
    topFrame,
    setSelectedFrameId,
    output,
    setStepIndex,
    stepIndex,
    steps,
    step,
    label,
    goPrev,
    goNext,
    graphOrStack,
    isGraph
  };

  const renderSlot = (slotId) => {
    const panelType = layout[slotId];
    const isOver = dragOverSlot === slotId;
    const isDragging = draggedSlot === slotId;

    return (
        <LayoutSlot
            key={slotId}
            slotId={slotId}
            panelType={panelType}
            isOver={isOver}
            isDragging={isDragging}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDoubleClick={handleDoubleClick}
            onDragEnd={handleDragEnd}
            panelProps={panelProps}
        />
    );
  };

  return (
      <div className="app">
        <header className="app-header">
          <h1>GlassBox</h1>
          <p className="app-subtitle">Java execution visualizer</p>
        </header>

        <main className="layout">
          <Group orientation="horizontal" style={{ width: '100%', height: '100%' }}>
            {/* Column 1 */}
            <Panel defaultSize={35} minSize={20} style={{ display: 'flex', flexDirection: 'column' }}>
              <Group orientation="vertical">
                <Panel defaultSize={60} minSize={25} style={{ display: 'flex', flexDirection: 'column' }}>
                  {renderSlot('slot_1')}
                </Panel>
                <Separator className="resize-handle-vertical" />
                <Panel defaultSize={40} minSize={15} style={{ display: 'flex', flexDirection: 'column' }}>
                  <Group orientation="horizontal">
                    <Panel defaultSize={50} style={{ display: 'flex', flexDirection: 'column' }}>
                      {renderSlot('slot_2')}
                    </Panel>
                    <Separator className="resize-handle-horizontal" />
                    <Panel defaultSize={50} style={{ display: 'flex', flexDirection: 'column' }}>
                      {renderSlot('slot_3')}
                    </Panel>
                  </Group>
                </Panel>
              </Group>
            </Panel>

            <Separator className="resize-handle-horizontal" />

            {/* Column 2 */}
            <Panel defaultSize={45} minSize={25} style={{ display: 'flex', flexDirection: 'column' }}>
              {renderSlot('slot_4')}
            </Panel>

            <Separator className="resize-handle-horizontal" />

            {/* Column 3 */}
            <Panel defaultSize={20} minSize={15} style={{ display: 'flex', flexDirection: 'column' }}>
              <Group orientation="vertical">
                <Panel defaultSize={70} minSize={25} style={{ display: 'flex', flexDirection: 'column' }}>
                  {renderSlot('slot_5')}
                </Panel>
                <Separator className="resize-handle-vertical" />
                <Panel defaultSize={30} minSize={15} style={{ display: 'flex', flexDirection: 'column' }}>
                  {renderSlot('slot_6')}
                </Panel>
              </Group>
            </Panel>
          </Group>
        </main>
      </div>
  );
}