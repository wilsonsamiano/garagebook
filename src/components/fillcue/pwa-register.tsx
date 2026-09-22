import { useEffect, useLayoutEffect } from "react";
import { applySafeArea } from "@/lib/fillcue/safe-area";

export function PwaRegister() {
  useLayoutEffect(() => {
    applySafeArea();
    window.addEventListener("resize", applySafeArea);
    window.addEventListener("orientationchange", applySafeArea);
    return () => {
      window.removeEventListener("resize", applySafeArea);
      window.removeEventListener("orientationchange", applySafeArea);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const base = import.meta.env.BASE_URL || "/";
    const url = `${base}sw.js`.replace(/\/{2,}/g, "/");
    const onChange = () => window.location.reload();
    navigator.serviceWorker.addEventListener("controllerchange", onChange);
    void navigator.serviceWorker
      .register(url, { scope: base })
      .then((reg) => {
        void reg.update();
        if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
        reg.addEventListener("updatefound", () => {
          const worker = reg.installing;
          worker?.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      })
      .catch(() => {
        /* preview iframes and insecure hosts cannot install a worker */
      });
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onChange);
  }, []);
  return null;
}