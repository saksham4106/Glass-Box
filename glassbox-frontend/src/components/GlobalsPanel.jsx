/**
 * Placeholder for static/global state.
 *
 * The JDI backend emits globals as their own event stream, separate from
 * frame locals. Once the event shape is settled, buildSteps() should track
 * a `globals` bucket in each step - parallel to `frames`, but never
 * pushed/popped, just updated - and this panel reads from that instead of
 * any one frame's `vars`.
 */
export default function GlobalsPanel() {
  return (
    <div className="panel globals-panel">
      <p className="empty-hint">Not wired up yet.</p>
    </div>
  );
}
