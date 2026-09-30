/** Opening capsule — gold cap, amber body, blue granules. Decorative only. */
export function PillCapsule({ className = "" }: { className?: string }) {
  return (
    <div className={`pill-stage ${className}`.trim()} aria-hidden="true">
      <div className="capsule">
        <div className="medicine">
          {Array.from({ length: 20 }, (_, i) => <i key={i} />)}
        </div>
        <div className="side" />
        <div className="side" />
      </div>
    </div>
  );
}
