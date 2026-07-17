import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import {oneDark} from "@codemirror/theme-one-dark";
import {java} from "@codemirror/lang-java";


export default function CodeInputScreen({ code, setCode, visualize }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',

        }}>
            <div style={{ width: '80%'}}>
                <center>
                    <h1 style={{ marginBottom: '24px', fontSize: '2.5rem', color: '#38bdf8' }}>
                        Code Trace Visualizer
                    </h1>
                </center>

                <CodeMirror
                    value={code}
                    theme={oneDark}
                    extensions={[java()]}
                    onChange={(value) => setCode(value)}
                    style={{ fontSize: '14px', height: '100%' }} // Ensure the editor tries to fill height
                    height="500px" // <-- Pass height directly as a prop here
                    className="custom-code-editor"
                />

                <center>
                    <button
                        onClick={() => visualize(true)}
                        style={{
                            padding: '12px 32px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            background: '#38bdf8',
                            color: '#0f172a',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                        }}
                    >
                        Visualize Execution
                    </button>
                </center>

            </div>
        </div>
    );
}