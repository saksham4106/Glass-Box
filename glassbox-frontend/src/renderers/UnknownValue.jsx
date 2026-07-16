/**
 * Fallback for a varType with no registered renderer. Rather than crashing
 * or silently dropping the variable, it shows the raw payload so a new
 * backend variable type is immediately visible (if ugly) instead of just
 * missing - a nudge to go write a real renderer and register it.
 */
export default function UnknownValue({ name, variable }) {
  return (
    <div className="collection-block unknown-block">
      <div className="collection-header">
        <span className="var-name">{name}</span>
        <span className="var-type">{variable.jvmType ?? 'unknown'}</span>
      </div>
      <pre className="unknown-raw">{JSON.stringify(variable, null, 2)}</pre>
    </div>
  );
}
