/* Dependency-free animation helper. Plain script: window.ChickenMotion. */
(() => {
  const clamp = n => Math.max(0, Math.min(1, n));
  function setProgress(stage, value) {
    stage.style.setProperty('--progress', String(clamp(Number(value) || 0)));
  }
  function attachScroll(stage, trigger = stage) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    function paint() {
      frame = 0;
      const rect = trigger.getBoundingClientRect();
      const range = Math.max(1, rect.height + innerHeight * 0.35);
      setProgress(stage, reduce.matches ? 1 : (innerHeight * 0.85 - rect.top) / range);
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(paint); }
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    reduce.addEventListener('change', schedule);
    paint();
    return () => {
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      reduce.removeEventListener('change', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }
  window.ChickenMotion = { setProgress, attachScroll };
})();
