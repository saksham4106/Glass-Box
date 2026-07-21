import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from "@codemirror/theme-one-dark";
import { java } from "@codemirror/lang-java";

export default function CodeInputScreen({ code, setCode, visualize, error, setError }) {
    return (
        <div className="setup-container">
            {/* Header styled exactly like the visualizer shell */}
            <header className="setup-header">
                <h1 className="setup-title">GlassBox</h1>
                <p className="setup-subtitle">Java execution visualizer</p>
            </header>

            {/* Main Content: 2-Column Layout */}
            <main className="setup-main">

                {/* Left Column: Code Editor Panel */}
                <div className="setup-panel">
                    <div className="setup-panel-header">
                        <span>Source Code</span>
                        <span>:::</span>
                    </div>

                    <div className="setup-code-input-container">
                        <CodeMirror
                            value={code}
                            theme={oneDark}
                            extensions={[java()]}
                            onChange={(value) => {
                                setError(null);
                                setCode(value)
                            }}
                            className="custom-code-input"
                        />
                    </div>

                    {error && (
                        <div className="error-banner">
                            <h3>Compilation Error:</h3>
                            <pre>{error}</pre>
                        </div>
                    )}

                    <div className="setup-action-bar">

                        <button
                            onClick={() => visualize(true)}
                            className="setup-visualize-btn"
                        >
                            Visualize Execution →
                        </button>
                    </div>
                </div>

                {/* Right Column: Future Content / Configuration */}
                <div className="setup-panel">
                    <div className="setup-panel-header">
                        <span>Configuration & Info</span>
                        <span>:::</span>
                    </div>

                    <div className="setup-panel-body">
                        <h2 className="setup-panel-title">Welcome to GlassBox</h2>
                        <p className="setup-panel-description">
                            Paste or write your Java code in the editor on the left. Once you're ready, click the <strong>Visualize Execution</strong> button to step through the trace line-by-line.
                        </p>

                        <div className="setup-args-container">
                            <label className="setup-args-label">Program Arguments (Coming Soon)</label>
                            <input
                                disabled
                                placeholder="e.g. arg1 arg2"
                                className="setup-args-input"
                            />
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}