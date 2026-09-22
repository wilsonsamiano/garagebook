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
    void navigator.serviceWorker.register(url, { scope: base }).catch(() => {
      /* preview iframes and insecure hosts cannot install a worker */
    });
  }, []);
  return null;
}