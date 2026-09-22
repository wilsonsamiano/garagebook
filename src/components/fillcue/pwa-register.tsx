import { useEffect } from "react";

export function PwaRegister() {
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
