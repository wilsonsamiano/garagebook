/** Compact on-device document scans. Photos never leave the browser. */

export type ScanMode = "document" | "cluster";

export function otsuThreshold(hist: number[]): number {
  const total = hist.reduce((a, b) => a + b, 0);
  if (!total) return 128;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * (hist[i] || 0);
  let sumB = 0;
  let wB = 0;
  let max = 0;
  let thresh = 128;
  for (let t = 0; t < 256; t++) {
    wB += hist[t] || 0;
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += t * (hist[t] || 0);
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between >= max) {
      max = between;
      thresh = t;
    }
  }
  return thresh;
}

export function fitSize(w: number, h: number, maxEdge = 720): { w: number; h: number } {
  const edge = Math.max(w, h);
  if (edge <= maxEdge) return { w, h };
  const s = maxEdge / edge;
  return { w: Math.max(1, Math.round(w * s)), h: Math.max(1, Math.round(h * s)) };
}

export function luminanceHist(data: Uint8ClampedArray): number[] {
  const hist = Array.from({ length: 256 }, () => 0);
  for (let i = 0; i < data.length; i += 4) hist[data[i]] += 1;
  return hist;
}

/** Hard black/white — receipt / shop / charge paper. */
export function applyDocumentScan(data: Uint8ClampedArray): void {
  const t = otsuThreshold(luminanceHist(data));
  for (let i = 0; i < data.length; i += 4) {
    const v = data[i] > t ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = v;
    data[i + 3] = 255;
  }
}

/** 8-level gray so cluster needles and digits stay readable. */
export function applyClusterScan(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.min(255, Math.round(data[i] / 32) * 32);
    data[i] = data[i + 1] = data[i + 2] = v;
    data[i + 3] = 255;
  }
}

export function scanByteLength(dataUrl: string): number {
  if (!dataUrl) return 0;
  const comma = dataUrl.indexOf(",");
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return Math.floor((b64.length * 3) / 4);
}

export function formatScanSize(dataUrl: string): string {
  const n = scanByteLength(dataUrl);
  if (n <= 0) return "";
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
}

export function encodeScan(source: HTMLCanvasElement, mode: ScanMode = "document"): string {
  if (typeof document === "undefined") return "";
  const maxEdge = mode === "cluster" ? 640 : 720;
  const { w, h } = fitSize(source.width, source.height, maxEdge);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return "";
  ctx.drawImage(source, 0, 0, w, h);
  const image = ctx.getImageData(0, 0, w, h);
  if (mode === "document") applyDocumentScan(image.data);
  else applyClusterScan(image.data);
  ctx.putImageData(image, 0, 0);
  const jpeg = canvas.toDataURL("image/jpeg", mode === "document" ? 0.42 : 0.48);
  const png = canvas.toDataURL("image/png");
  return scanByteLength(png) < scanByteLength(jpeg) ? png : jpeg;
}
