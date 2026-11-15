export function celebrate(canvas) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { canvas.remove(); return; }
  const context = canvas.getContext('2d');
  if (!context) { canvas.remove(); return; }
  const colors = ['#f9a8d4', '#fde047', '#86efac', '#93c5fd', '#c4b5fd', '#fb923c'];
  let width, height, previous, start, frame;
  const pieces = Array.from({ length: 300 }, () => ({ x: Math.random(), y: -Math.random() * 2, speed: 0.1 + Math.random() * 0.15, drift: Math.random() - 0.5, angle: Math.random() * 6.28, color: colors[Math.floor(Math.random() * colors.length)] }));
  const resize = () => { width = canvas.width = innerWidth; height = canvas.height = innerHeight; };
  resize(); addEventListener('resize', resize);
  function draw(now) {
    start ??= now; previous ??= now; const dt = Math.min((now - previous) / 1000, 0.05); previous = now;
    context.clearRect(0, 0, width, height);
    for (const p of pieces) {
      p.y += p.speed * dt; p.speed += dt * 0.012; p.x += p.drift * dt * 0.04; p.angle += dt * 3;
      context.save(); context.translate(p.x * width, p.y * height); context.rotate(p.angle); context.fillStyle = p.color; context.fillRect(-3, -3, 6, 9); context.restore();
    }
    if (now - start < 15000) frame = requestAnimationFrame(draw);
    else { canvas.remove(); removeEventListener('resize', resize); }
  }
  frame = requestAnimationFrame(draw);
  addEventListener('pagehide', () => { cancelAnimationFrame(frame); removeEventListener('resize', resize); }, { once: true });
}
