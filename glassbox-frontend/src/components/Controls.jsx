/** Back/Next buttons plus the current step's human-readable label. */
export default function Controls({ stepIndex, totalSteps, label, onPrev, onNext }) {
  return (
    <div className="controls">
      <button className="btn" onClick={onPrev} disabled={stepIndex === 0}>
        &larr; Back
      </button>
      <div className="controls-status">
        <span className="step-label">{label}</span>
      </div>
      <button className="btn" onClick={onNext} disabled={stepIndex === totalSteps - 1}>
        Next &rarr;
      </button>
    </div>
  );
}
