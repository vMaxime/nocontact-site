// Eases the mouse wheel, like the landing pages of web apps. Trackpads, touch and keyboards keep
// their native scrolling, and so does anyone who asked for less motion.
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(pointer: fine)").matches) return;
  var root = document.documentElement;
  var target = window.scrollY;
  var current = target;
  var running = false;
  var EASE = 0.12;

  function limit() { return root.scrollHeight - window.innerHeight; }

  function scrollsInside(node) {
    for (; node && node !== document.body && node.nodeType === 1; node = node.parentNode) {
      var overflow = getComputedStyle(node).overflowY;
      if ((overflow === "auto" || overflow === "scroll") && node.scrollHeight > node.clientHeight) return true;
    }
    return false;
  }

  function step() {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.5) {
      current = target;
      running = false;
    }
    window.scrollTo({ top: current, behavior: "instant" });
    if (running) requestAnimationFrame(step);
  }

  window.addEventListener("wheel", function (event) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return;
    // A wheel moves by notches; a trackpad sends many small pixel moves and is already smooth.
    var notch = event.deltaMode === 1 || Math.abs(event.deltaY) >= 50;
    if (!notch || event.deltaX !== 0 || scrollsInside(event.target)) return;
    event.preventDefault();
    if (!running) target = current = window.scrollY;
    var delta = event.deltaMode === 1 ? event.deltaY * 40 : event.deltaY;
    target = Math.max(0, Math.min(limit(), target + delta));
    if (!running) {
      running = true;
      requestAnimationFrame(step);
    }
  }, { passive: false });

  // Anything else that moves the page (keyboard, links, scrollbar) stops the easing where it is.
  window.addEventListener("keydown", function () { running = false; });
  window.addEventListener("mousedown", function () { running = false; });
  window.addEventListener("click", function (event) {
    if (event.target.closest && event.target.closest('a[href^="#"]')) running = false;
  });
})();
