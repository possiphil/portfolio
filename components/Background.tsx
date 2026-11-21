/** Fixed warm "lamp" glow in the top-left corner, behind everything. */
export function Background() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-[10vw] -top-[20vh] h-[55rem] w-[55rem] max-w-[120vw]">
        <div className="aura" />
      </div>
      <div className="absolute inset-0 bg-background/35" />
    </div>
  );
}
