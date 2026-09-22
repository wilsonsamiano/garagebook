/** iPhone Dynamic Island + iOS 27 Liquid Glass. env() is often 0. */
export const IOS_GLASS_TOP_MIN = 72;

export function isAppleTouch(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function measureInset(prop: "top" | "bottom"): number {
  if (typeof document === "undefined") return 0;
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;visibility:hidden;padding-${prop}:env(safe-area-inset-${prop},0px)`;
  document.documentElement.appendChild(probe);
  const value = probe.clientHeight || parseFloat(getComputedStyle(probe).getPropertyValue(`padding-${prop}`)) || 0;
  probe.remove();
  return value;
}

export function applySafeArea(): void {
  if (typeof document === "undefined") return;
  const envTop = measureInset("top");
  const needMin =
    isAppleTouch() || (typeof window !== "undefined" && window.matchMedia("(max-width: 480px)").matches);
  const top = Math.max(envTop, needMin ? IOS_GLASS_TOP_MIN : 0);
  if (top > 0) {
    document.documentElement.style.setProperty("--app-safe-top", `${top}px`);
  } else {
    document.documentElement.style.removeProperty("--app-safe-top");
  }
}
