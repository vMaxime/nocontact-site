// Eases wheel and trackpad scrolling, like the landing pages of web apps. Touch screens and
// keyboards keep their native scrolling, and so does anyone who asked for less motion.
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(pointer: fine)").matches) return;
  var root = document.documentElement;
  var target = 0;
  var current = 0;
  var lastTime = 0;
  var running = false;
  var TAU = 110; // milliseconds: how long the page takes to catch up

  function limit() { return Math.max(0, root.scrollHeight - window.innerHeight); }

  function scrollsInside(node) {
    for (; node && node.nodeType === 1 && node !== document.body && node !== root; node = node.parentNode) {
      var overflow = getComputedStyle(node).overflowY;
      if ((overflow === "auto" || overflow === "scroll") && node.scrollHeight > node.clientHeight) return true;
    }
    return false;
  }

  function stop() {
    if (!running) return;
    running = false;
    root.style.scrollBehavior = "";
  }

  function step(now) {
    if (!running) return;
    // Something else moved the page (scrollbar, keyboard, a link): let it.
    if (Math.abs(window.scrollY - current) > 2) return stop();
    // The first frame can carry a timestamp older than the wheel event: never go back in time.
    var dt = Math.max(0, Math.min(64, now - lastTime));
    lastTime = now;
    var next = current + (target - current) * (1 - Math.exp(-dt / TAU));
    if (Math.abs(target - next) < 0.5) next = target;
    window.scrollTo(0, next);
    // Browsers round the position: keep what was really applied.
    current = Math.abs(window.scrollY - next) < 1.5 ? next : window.scrollY;
    if (next === target) return stop();
    requestAnimationFrame(step);
  }

  window.addEventListener("wheel", function (event) {
    if (event.ctrlKey || event.metaKey || event.defaultPrevented) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || scrollsInside(event.target)) return;
    var delta = event.deltaY;
    if (event.deltaMode === 1) delta *= 40;
    if (event.deltaMode === 2) delta *= window.innerHeight;
    var max = limit();
    if (!running) {
      // Nothing to ease at the ends of the page: keep the native bounce.
      if ((delta < 0 && window.scrollY <= 0) || (delta > 0 && window.scrollY >= max)) return;
      target = current = window.scrollY;
    }
    event.preventDefault();
    target = Math.max(0, Math.min(max, target + delta));
    if (!running) {
      running = true;
      root.style.scrollBehavior = "auto";
      lastTime = performance.now();
      requestAnimationFrame(step);
    }
  }, { passive: false });

  window.addEventListener("keydown", stop);
  window.addEventListener("mousedown", stop);
  window.addEventListener("touchstart", stop, { passive: true });
})();
