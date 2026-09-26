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
type TextItem = { str?: string; hasEOL?: boolean };
type PdfPage = {
  getViewport: (o: { scale: number }) => PdfViewport;
  render: (o: { canvasContext: CanvasRenderingContext2D; viewport: PdfViewport }) => { promise: Promise<void> };
  getTextContent: () => Promise<{ items: Array<TextItem | { type?: string }> }>;
};
type PdfDoc = { numPages: number; getPage: (n: number) => Promise<PdfPage> };
type Pdfjs = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (src: {
    data: Uint8Array;
    disableWorker?: boolean;
    isEvalSupported?: boolean;
  }) => { promise: Promise<PdfDoc> };
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
    const found = [...document.scripts].find((s) => s.src === src);
    if (found) {
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

async function ensurePdf(): Promise<Pdfjs> {
  const ready = window.pdfjsLib;
  if (ready) return ready;
  await loadScript(PDFJS);
  const pdf = window.pdfjsLib;
  if (!pdf) throw new Error("Could not open that PDF. Connect once, then try again.");
  pdf.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  return pdf;
}

async function looksLikePdf(file: File): Promise<boolean> {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) return true;
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46;
}

async function openPdf(file: File): Promise<PdfDoc> {
  const pdfjs = await ensurePdf();
  const data = new Uint8Array(await file.arrayBuffer());
  return pdfjs.getDocument({ data, disableWorker: true, isEvalSupported: false }).promise;
}

function itemsToText(items: Array<TextItem | { type?: string }>): string {
  return items
    .map((item) => {
      if (!("str" in item) || !item.str) return "";
      return item.str + (item.hasEOL ? "\n" : " ");
    })
    .join("")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

async function pdfText(doc: PdfDoc): Promise<string> {
  const pages = Math.min(doc.numPages || 1, 3);
  const chunks: string[] = [];
  for (let n = 1; n <= pages; n++) {
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    const text = itemsToText(content.items);
    if (text) chunks.push(text);
  }
  return chunks.join("\n");
}

async function renderPdfPage(page: PdfPage): Promise<HTMLCanvasElement> {
  const base = page.getViewport({ scale: 1 });
  const scale = Math.min(2, 1600 / Math.max(base.width, base.height));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not open that PDF.");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
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
  if (await looksLikePdf(file)) {
    const doc = await openPdf(file);
    const page = await renderPdfPage(await doc.getPage(1));
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
  if (await looksLikePdf(file)) {
    onProgress?.("Reading PDF…");
    const doc = await openPdf(file);
    const embedded = await pdfText(doc);
    const page = await renderPdfPage(await doc.getPage(1));
    const canvas = drawForOcr(page, page.width, page.height, mode);
    if (embedded.replace(/\s/g, "").length >= 24) {
      return { text: embedded, confidence: 95, canvas };
    }
    onProgress?.("No text in the PDF. Scanning the page…");
    const worker = await ensureOcr(onProgress);
    await worker.setParameters({
      tessedit_pageseg_mode: "6",
      preserve_interword_spaces: "1",
    });
    const result = await worker.recognize(canvas);
    return {
      text: result.data?.text || "",
      confidence: result.data?.confidence || 0,
      canvas,
    };
  }

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
