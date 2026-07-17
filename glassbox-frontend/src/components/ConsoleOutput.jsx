/** Accumulated System.out lines, up to the current step. */
export default function ConsoleOutput({ lines }) {
  return (
    <div className="panel console-panel">
      {lines.length === 0 ? (
        <p className="empty-hint">No output yet.</p>
      ) : (
        <pre className="console-lines">{lines.join('\n')}</pre>
      )}
    </div>
  );
}
