import { applyDocumentScan } from "@/lib/fillcue/scan";

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

type PdfViewport = { width: number; height: number };
type PdfPage = {
  getViewport: (o: { scale: number }) => PdfViewport;
  render: (o: { canvasContext: CanvasRenderingContext2D; viewport: PdfViewport }) => { promise: Promise<void> };
};
type PdfDoc = { getPage: (n: number) => Promise<PdfPage> };
type Pdfjs = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (src: { data: ArrayBuffer }) => { promise: Promise<PdfDoc> };
};

declare global {
  interface Window {
    Tesseract?: TessNS;
    pdfjsLib?: Pdfjs;
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

const PDFJS = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js";
const PDFJS_WORKER = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

async function ensurePdf(): Promise<Pdfjs> {
  const ready = window.pdfjsLib;
  if (ready) return ready;
  await loadScript(PDFJS);
  const pdf = window.pdfjsLib;
  if (!pdf) throw new Error("Could not open that PDF.");
  pdf.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  return pdf;
}

async function pdfFirstPage(file: File): Promise<HTMLCanvasElement> {
  const pdfjs = await ensurePdf();
  const data = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not open that PDF.");
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image"));
    };
    img.src = url;
  });
}

function drawForOcr(source: CanvasImageSource, sw: number, sh: number, mode: "document" | "cluster"): HTMLCanvasElement {
  const maxW = 1800;
  const scale = Math.min(1, maxW / sw);
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare that image");
  ctx.drawImage(source, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h);
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    let y = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    y = (y - 128) * 1.35 + 128;
    y = Math.max(0, Math.min(255, y));
    d[i] = d[i + 1] = d[i + 2] = y;
  }
  if (mode === "document") applyDocumentScan(d);
  ctx.putImageData(data, 0, 0);
  return canvas;
}

export async function preprocessImage(
  file: File,
  mode: "document" | "cluster" = "document",
): Promise<{ canvas: HTMLCanvasElement }> {
  if (isPdf(file)) {
    const page = await pdfFirstPage(file);
    return { canvas: drawForOcr(page, page.width, page.height, mode) };
  }
  const img = await loadImage(file);
  return { canvas: drawForOcr(img, img.naturalWidth || img.width, img.naturalHeight || img.height, mode) };
}

export async function recognizeFile(
  file: File,
  onProgress?: (msg: string) => void,
  mode: "document" | "cluster" = "document",
): Promise<{ text: string; confidence: number; canvas: HTMLCanvasElement }> {
  const pre = await preprocessImage(file, mode);
  const worker = await ensureOcr(onProgress);
  await worker.setParameters({
    tessedit_pageseg_mode: mode === "cluster" ? "11" : "6",
    tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#.,:$/°%+- ",
    preserve_interword_spaces: "1",
  });
  onProgress?.("Reading scan…");
  const result = await worker.recognize(pre.canvas);
  return {
    text: result.data?.text || "",
    confidence: result.data?.confidence || 0,
    canvas: pre.canvas,
  };
}
