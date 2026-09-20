// Keep offscreen galleries and background tabs from rendering WebGL frames.
export function observeVisibility(element) {
  let visible = false;
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  observer.observe(element);
  return {
    get active() {
      return visible && !document.hidden;
    },
    disconnect: () => observer.disconnect(),
  };
}
