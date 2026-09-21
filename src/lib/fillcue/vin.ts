/** VIN is optional. Empty is fine. A complete VIN is 17 chars, no I / O / Q. */

export function normalizeVin(raw: string): string {
  return String(raw || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 17);
}

export function isCompleteVin(vin: string): boolean {
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
}

export function vinHint(vin: string): string | null {
  if (!vin) return null;
  if (/[IOQ]/.test(vin)) return "VIN never uses I, O, or Q";
  if (vin.length < 17) return `${vin.length} of 17 characters — optional until you have it`;
  return null;
}

export function vinTail(vin: string): string {
  const n = normalizeVin(vin);
  if (n.length < 4) return n;
  return n.slice(-6);
}
