import { useState } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { useTraceData } from './hooks/useTraceData';
import { useStepNavigation } from './hooks/useStepNavigation';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useActiveFrame } from './hooks/useActiveFrame';
import { LayoutSlot } from './components/LayoutSlot';
import CodeInputScreen from "./components/CodeInputScreen.jsx";

const INITIAL_LAYOUT = {
  slot_1: 'code',
  slot_2: 'globals',
  slot_3: 'locals',
  slot_4: 'visualizer',
  slot_5: 'stack',
  slot_6: 'console',
};


export default function App() {

  const [code, setCode] = useState(
      `class Solution {\n  public static void main(String[] args){\n    int a = 1 + 2;\n  }\n}`
  );

  const [isVisualizing, visualize] = useState(false);

  const [graphOrStack, setGraphOrStack] = useState(false);

  const { steps } = useTraceData({code});
  const { stepIndex, setStepIndex, goPrev, goNext } = useStepNavigation(steps.length);

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

  function handleDoubleClick(e, slotId){
    const componentInSlot = layout[slotId];

    if (componentInSlot === 'stack') {
      setGraphOrStack((prev) => !prev);
      console.log(`Toggling CallStack in ${slotId}`);
    }
  }


  const step = steps && steps.length > 0 ? steps[stepIndex] : null;

  const {
    frames = [],
    output = [],
    changed = {},
    label = ''
  } = step || {};

  const topFrame = frames.length > 0 ? frames[frames.length - 1] : null;

  const { activeFrame, selectedFrameId, setSelectedFrameId } = useActiveFrame(frames, topFrame);

  if (!steps || steps.length === 0) {
    return <div className="app-loading">Loading trace…</div>;
  }

  const panelProps = {
    code,
    setCode,
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
    label,
    goPrev,
    goNext,
    graphOrStack
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

  if(!isVisualizing){
    return (
        <div>
          <CodeInputScreen code={code} setCode={setCode} visualize={visualize}></CodeInputScreen>
        </div>
    )
  }

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
