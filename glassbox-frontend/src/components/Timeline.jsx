const TICK_CLASS = {
  push_frame: 'tick-push',
  pop: 'tick-pop',
  local: 'tick-local',
  sysout: 'tick-sysout',
};

/**
 * A scrubber across the whole run, one tick per step, colored by event
 * type. Lets you see the shape of a recursive run at a glance (bursts of
 * "push" ticks going down, "pop" ticks coming back up) and jump straight to
 * any point, not just step one-at-a-time.
 */
export default function Timeline({ steps, stepIndex, onJump }) {
  const last = Math.max(steps.length - 1, 1);

  return (
    <div className="timeline">
      {steps.map((step, i) => (
        <button
          key={i}
          className={`tick ${TICK_CLASS[step.event?.type] ?? 'tick-start'} ${
            i === stepIndex ? 'tick-current' : ''
          }`}
          style={{ left: `${(i / last) * 100}%` }}
          onClick={() => onJump(i)}
          title={step.label}
          aria-label={`Jump to step ${i}: ${step.label}`}
        />
      ))}
    </div>
  );
}
