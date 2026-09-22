/** Measured inset; 0 when iOS already letterboxes the webview. */
export const IOS_GLASS_TOP_MIN = 0;

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
  if (envTop > 0) {
    document.documentElement.style.setProperty("--app-safe-top", `${envTop}px`);
  } else {
    document.documentElement.style.removeProperty("--app-safe-top");
  }
}

/** Drops Cache Storage + the service worker. IndexedDB (the log) is not touched. */
export async function reloadAppFiles(): Promise<void> {
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
  }
  if (typeof caches !== "undefined") {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  }
  window.location.reload();
}