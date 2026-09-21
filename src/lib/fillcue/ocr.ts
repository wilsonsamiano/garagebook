/** On-device OCR via Tesseract.js. Photos never leave the device. */

type TessLogger = { status: string; progress: number };

type TessWorker = {
  setParameters: (p: Record<string, string>) => Promise<void>;
  recognize: (image: HTMLCanvasElement) => Promise<{ data?: { text?: string; confidence?: number } }>;
};

type TessNS = {
  createWorker: (
    lang: string,
    oem: number,
    opts: { logger?: (m: TessLogger) => void },
  ) => Promise<TessWorker>;
};

declare global {
  interface Window {
    Tesseract?: TessNS;
  }
}

let workerPromise: Promise<TessWorker> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("OCR needs a browser."));
      return;
    }
    if ([...document.scripts].some((s) => s.src.includes("tesseract"))) {
      resolve();
      return;
    }
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () =>
      reject(
        new Error("Could not load the OCR engine. Connect once to cache it, then you can go offline."),
      );
    document.head.appendChild(el);
  });
}

export async function ensureOcr(onProgress?: (msg: string) => void): Promise<TessWorker> {
  if (typeof window === "undefined") throw new Error("OCR needs a browser.");
  if (window.Tesseract && workerPromise) return workerPromise;
  onProgress?.("Loading OCR engine…");
  await loadScript("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js");
  const Tess = window.Tesseract;
  if (!Tess) throw new Error("OCR engine did not start.");
  workerPromise = Tess.createWorker("eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(`Reading photo ${Math.round((m.progress || 0) * 100)}%`);
      }
    },
  });
  const worker = await workerPromise;
  await worker.setParameters({
    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#.,:$/°%+- ",
    preserve_interword_spaces: "1",
  });
  return worker;
}

export function preprocessImage(
  file: File,
  maxW = 1600,
): Promise<{ canvas: HTMLCanvasElement }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not prepare that image"));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h);
      const d = data.data;
      for (let i = 0; i < d.length; i += 4) {
        let y = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
        y = (y - 128) * 1.35 + 128;
        y = Math.max(0, Math.min(255, y));
        d[i] = d[i + 1] = d[i + 2] = y;
      }
      ctx.putImageData(data, 0, 0);
      URL.revokeObjectURL(url);
      resolve({ canvas });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image"));
    };
    img.src = url;
  });
}

export async function recognizeFile(
  file: File,
  onProgress?: (msg: string) => void,
): Promise<{ text: string; confidence: number; canvas: HTMLCanvasElement }> {
  const pre = await preprocessImage(file);
  const worker = await ensureOcr(onProgress);
  onProgress?.("Reading photo…");
  const result = await worker.recognize(pre.canvas);
  return {
    text: result.data?.text || "",
    confidence: result.data?.confidence || 0,
    canvas: pre.canvas,
  };
}
