import React, { useState, useMemo, useRef, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {java} from '@codemirror/lang-java'
import { oneDark } from '@codemirror/theme-one-dark';
import { StateField, StateEffect } from '@codemirror/state';
import { EditorView, Decoration } from '@codemirror/view';

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

export default function CodeInput({line}) {
    const [code, setCode] = useState(
        `function calculateSum(a, b) {\n  // Line 2: This line is highlighted!\n  const sum = a + b;\n  return sum; // Line 4: This is also highlighted!\n}`
    );
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
        <div style={{ width: '100%', maxWidth: '700px' }}>
            <div style={{ border: '1px solid #333', borderRadius: '6px', overflow: 'hidden' }}>
                <CodeMirror
                    value={code}
                    theme={oneDark}
                    // Pass the dynamic line highlighter into the extensions array alongside JS support
                    extensions={[java(), highlightExtension]}
                    onChange={(value) => setCode(value)}
                    style={{ fontSize: '14px' }}
                    className="custom-code-editor"
                    themeProps={{
                        style: {
                            maxHeight: '500px',
                            overflow: 'auto',
                        }
                    }}
                />
            </div>
        </div>
    );
}