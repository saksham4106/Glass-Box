import React, { useState, useMemo, useRef, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {java} from '@codemirror/lang-java'
import { oneDark } from '@codemirror/theme-one-dark';
import { StateField, StateEffect } from '@codemirror/state';
import { EditorView, Decoration } from '@codemirror/view';
import Timeline from "./Timeline.jsx";
import Controls from "./Controls.jsx";

// 1. UPDATED HIGHLIGHTER GENERATOR (Accepts both lines)
const createDualLineHighlighter = (activeLineNum, lastLineNum) => {
    // Define active decoration style
    const activeDecoration = Decoration.line({
        attributes: { class: 'highlighted-line-active' },
    });

    // Define previous decoration style
    const lastDecoration = Decoration.line({
        attributes: { class: 'highlighted-line-last' },
    });

    return StateField.define({
        create() {
            return Decoration.none;
        },
        update(decorations, tr) {
            const builder = [];
            const state = tr.state;

            // Handle the ACTIVE line highlight
            try {
                if (activeLineNum > 0 && activeLineNum <= state.doc.lines) {
                    const line = state.doc.line(activeLineNum);
                    builder.push(activeDecoration.range(line.from));
                }
            } catch (e) {}

            // Handle the PREVIOUS line highlight
            try {
                if (lastLineNum > 0 && lastLineNum <= state.doc.lines) {
                    const line = state.doc.line(lastLineNum);
                    builder.push(lastDecoration.range(line.from));
                }
            } catch (e) {}

            // CodeMirror requires ranges to be sorted before building
            builder.sort((a, b) => a.from - b.from);
            return Decoration.set(builder);
        },
        provide: (f) => EditorView.decorations.from(f),
    });
};

export default function CodeInput({line, code, setCode, setStepIndex, stepIndex, steps, label, goPrev, goNext}) {

    const [lastLine, setLastLine] = useState(null);
    const currentLineRef = useRef(line);


    useEffect(() => {
        if(line !== currentLineRef.current) {
            setLastLine(currentLineRef.current);
            currentLineRef.current = line;
        }
    }, [line]);

    // Memoize the extension so it doesn't re-instantiate unnecessarily unless the lines array changes
    const highlightExtension = useMemo(() => {
            return createDualLineHighlighter(line, lastLine);
        }, [line, lastLine]
    );

    return (
        <div className="custom-code-editor-wrapper" style={{  border: '1px solid #333', borderRadius: '6px', overflow:'hidden'}}>
            <CodeMirror
                value={code}
                theme={oneDark}
                extensions={[java(), highlightExtension]}
                onChange={(value) => setCode(value)}
                style={{ fontSize: '14px', height: '100%' }} // Ensure the editor tries to fill height
                className="custom-code-editor"
            />

            <Timeline steps={steps} stepIndex={stepIndex} onJump={setStepIndex} />

            <Controls
                stepIndex={stepIndex}
                totalSteps={steps.length}
                label={label}
                onPrev={goPrev}
                onNext={goNext}
            />
        </div>
    );
}