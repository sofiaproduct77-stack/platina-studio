(function () {
  const layers = document.querySelectorAll(".hero-img[data-depth]");
  if (!layers.length) return;

  let raf = 0;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  function tick() {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;
    layers.forEach((el) => {
      const depth = Number(el.dataset.depth) || 40;
      el.style.transform = `translate3d(${currentX * depth}px, ${currentY * depth}px, 0)`;
    });
    raf =
      Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001
        ? requestAnimationFrame(tick)
        : 0;
  }

  function onMove(e) {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    targetX = nx;
    targetY = ny;
    if (!raf) raf = requestAnimationFrame(tick);
  }

  window.addEventListener("mousemove", onMove, { passive: true });
})();