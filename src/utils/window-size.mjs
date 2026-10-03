export function getWindowSize(target = globalThis.window) {
  return {
    width: target ? target.innerWidth : Infinity,
    height: target ? target.innerHeight : Infinity,
  };
}

export function subscribeToWindowSize(onChange, target = globalThis.window) {
  if (!target) return () => {};

  let frame = 0;
  const resize = () => {
    const size = getWindowSize(target);
    target.cancelAnimationFrame(frame);
    frame = target.requestAnimationFrame(() => onChange(size));
  };

  target.addEventListener('resize', resize);
  return () => {
    target.removeEventListener('resize', resize);
    target.cancelAnimationFrame(frame);
  };
}
