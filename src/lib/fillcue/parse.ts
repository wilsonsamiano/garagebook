import type { ChargeDraft, ChargeLocation, FillDraft, PhotoKind, ServiceCategory, ServiceDraft } from "./types";

function clean(text: string): string {
  return String(text || "").replace(/\u00a0/g, " ");
}

function num(s: string | null | undefined): number | null {
  if (s == null) return null;
  const n = Number(String(s).replace(/,/g, "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function pickDate(text: string): string {
  const t = clean(text);
  const mdy = t.match(/\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})\b/);
  if (mdy) {
    let y = Number(mdy[3]);
    if (y < 100) y += 2000;
    return `${y}-${String(mdy[1]).padStart(2, "0")}-${String(mdy[2]).padStart(2, "0")}`;
  }
  const iso = t.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  return iso ? iso[0] : "";
}

export function pickTime(text: string): string {
  const m = clean(text).match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  return m ? `${m[1].padStart(2, "0")}:${m[2]}` : "";
}

export type ReceiptParse = {
  kind: "receipt";
  station: string;
  city: string;
  pump: string;
  grade: string;
  gallons: number | null;
  pricePerGal: number | null;
  total: number | null;
  date: string;
  time: string;
  notes: string;
};

export type ClusterParse = {
  kind: "cluster";
  odometer: number | null;
  clusterRange: number | null;
  clusterAvgMph: number | null;
  outsideF: number | null;
  notes: string;
};

export type ShopParse = {
  kind: "shop";
  shop: string;
  city: string;
  date: string;
  odometer: number | null;
  total: number | null;
  category: ServiceCategory;
  summary: string;
};

export type ChargeParse = {
  kind: "charge";
  location: ChargeLocation;
  city: string;
  date: string;
  time: string;
  kwh: number | null;
  pricePerKwh: number | null;
  total: number | null;
  odometer: number | null;
};

export function parseReceipt(text: string): ReceiptParse {
  const t = clean(text);
  const out: ReceiptParse = {
    kind: "receipt",
    station: "",
    city: "",
    pump: "",
    grade: "",
    gallons: null,
    pricePerGal: null,
    total: null,
    date: pickDate(t),
    time: pickTime(t),
    notes: "",
  };

  if (/aafes|army\s*&\s*air force|exchange\s*(gas|fuel)|shopette/i.test(t)) {
    out.station = "AAFES Exchange";
  } else if (/costco/i.test(t)) {
    const m = t.match(/costco[^\n]*#?\s*\d+/i);
    out.station = m ? m[0].replace(/\s+/g, " ").trim() : "Costco";
  } else {
    const first = t.split(/\n/).map((l) => l.trim()).find((l) => l && !/date|time|pump|gallon/i.test(l));
    if (first) out.station = first.slice(0, 48);
  }

  const city = t.match(/([A-Za-z .]+),\s*([A-Z]{2})\s+\d{5}/);
  if (city) out.city = `${city[1].trim()}, ${city[2]}`;

  const pump = t.match(/pump\s*#?\s*(\d+)/i);
  if (pump) out.pump = pump[1];

  if (/diesel/i.test(t)) out.grade = "Diesel";
  else if (/premium\s*93|93\s*octane/i.test(t)) out.grade = "Premium 93";
  else if (/premium\s*91|91\s*octane/i.test(t)) out.grade = "Premium 91";
  else if (/midgrade|89/i.test(t)) out.grade = "Midgrade 89";
  else if (/regular|87/i.test(t)) out.grade = "Regular 87";

  const gal = t.match(/gallons?\s*[:\s]*([0-9]+\.[0-9]+)/i) || t.match(/\b([0-9]+\.[0-9]{2,4})\s*gal/i);
  if (gal) out.gallons = num(gal[1]);
  const ppg = t.match(/price\s*[:\s]*\$?\s*([0-9]+\.[0-9]{2,3})/i);
  if (ppg) out.pricePerGal = num(ppg[1]);
  const tot = t.match(/(?:total sale|amount|total)\s*[:\s]*\$?\s*([0-9]+\.[0-9]{2})/i);
  if (tot) out.total = num(tot[1]);
  return out;
}

export function parseCluster(text: string): ClusterParse {
  const t = clean(text);
  const out: ClusterParse = {
    kind: "cluster",
    odometer: null,
    clusterRange: null,
    clusterAvgMph: null,
    outsideF: null,
    notes: "",
  };
  const odo = t.match(/\bODO\b\s*[:\s]*([0-9]{4,7})/i) || t.match(/odometer\s*[:\s]*([0-9]{4,7})/i);
  if (odo) out.odometer = num(odo[1]);
  const range = t.match(/\bRange\b\s*[:\s]*([0-9]{2,4})/i);
  if (range) out.clusterRange = num(range[1]);
  const mph = t.match(/(?:after\s*reset|avg)?\s*([0-9]{1,3})\s*MPH/i);
  if (mph) out.clusterAvgMph = num(mph[1]);
  const temp = t.match(/outside\s*([0-9]{1,3})\s*°?\s*F/i) || t.match(/\b([0-9]{2})\s*°F/);
  if (temp) out.outsideF = num(temp[1]);
  return out;
}

const SHOPS: { re: RegExp; name: string }[] = [
  { re: /firestone/i, name: "Firestone" },
  { re: /jiffy\s*lube/i, name: "Jiffy Lube" },
  { re: /valvoline/i, name: "Valvoline" },
  { re: /pep\s*boys/i, name: "Pep Boys" },
  { re: /napa/i, name: "NAPA" },
  { re: /toyota/i, name: "Toyota" },
  { re: /tesla/i, name: "Tesla Service" },
];

const CATEGORY_RULES: { re: RegExp; category: ServiceCategory; label: string }[] = [
  { re: /oil\s*change|0w-20|5w-30|synthetic\s*oil/i, category: "oil", label: "Oil change" },
  { re: /tire\s*rotation|rotate\s*tires/i, category: "rotation", label: "Tire rotation" },
  { re: /cabin\s*(air\s*)?filter/i, category: "cabin-filter", label: "Cabin air filter" },
  { re: /engine\s*air\s*filter|(?<!cabin\s)air\s*filter/i, category: "air-filter", label: "Engine air filter" },
  { re: /brake\s*fluid/i, category: "brake-fluid", label: "Brake fluid" },
  { re: /brake|rotor|pad/i, category: "brakes", label: "Brakes" },
  { re: /trans(mission)?|\batf\b|ws\s*fluid/i, category: "transmission", label: "Transmission" },
  { re: /coolant|antifreeze/i, category: "coolant", label: "Coolant" },
  { re: /spark\s*plug/i, category: "spark-plugs", label: "Spark plugs" },
  { re: /wiper/i, category: "wipers", label: "Wipers" },
  { re: /alignment/i, category: "alignment", label: "Alignment" },
  { re: /\btires?\b(?!\s*rotation)/i, category: "tires", label: "Tires" },
  { re: /batter/i, category: "battery", label: "Battery" },
  { re: /inspect/i, category: "inspection", label: "Inspection" },
];

export function parseShopReceipt(text: string): ShopParse {
  const t = clean(text);
  const out: ShopParse = {
    kind: "shop",
    shop: "",
    city: "",
    date: pickDate(t),
    odometer: null,
    total: null,
    category: "other",
    summary: "",
  };
  for (const s of SHOPS) {
    if (s.re.test(t)) {
      out.shop = s.name;
      break;
    }
  }
  const city = t.match(/([A-Za-z .]+),\s*([A-Z]{2})\s+\d{5}/);
  if (city) out.city = `${city[1].trim()}, ${city[2]}`;
  const odo =
    t.match(/(?:mileage|odometer|odo)\s*[:\s]*([0-9]{4,7})/i) || t.match(/\b([0-9]{5,7})\s*mi(?:les)?\b/i);
  if (odo) out.odometer = num(odo[1]);
  const amount = t.match(/(?:amount|total|balance)\s*[:\s]*\$?\s*([0-9]+\.[0-9]{2})/i);
  if (amount) out.total = num(amount[1]);
  const hits = CATEGORY_RULES.filter((r) => r.re.test(t));
  if (hits.length) {
    out.category = hits[0].category;
    out.summary = [...new Set(hits.map((h) => h.label))].join(", ");
  }
  return out;
}

export function parseChargeReceipt(text: string): ChargeParse {
  const t = clean(text);
  const out: ChargeParse = {
    kind: "charge",
    location: "Other",
    city: "",
    date: pickDate(t),
    time: pickTime(t),
    kwh: null,
    pricePerKwh: null,
    total: null,
    odometer: null,
  };
  if (/supercharger/i.test(t)) out.location = "Supercharger";
  else if (/destination/i.test(t)) out.location = "Destination";
  else if (/home|wall\s*connector|tesla\s*wall/i.test(t)) out.location = "Home";
  else if (/work|office/i.test(t)) out.location = "Work";
  const city = t.match(/([A-Za-z .]+),\s*([A-Z]{2})\s+\d{5}/);
  if (city) out.city = `${city[1].trim()}, ${city[2]}`;
  const kwh = t.match(/([0-9]+(?:\.[0-9]+)?)\s*kwh/i);
  if (kwh) out.kwh = num(kwh[1]);
  const rate = t.match(/\$?\s*([0-9]+\.[0-9]{2,3})\s*\/\s*kwh/i);
  if (rate) out.pricePerKwh = num(rate[1]);
  const tot = t.match(/(?:total|amount)\s*[:\s]*\$?\s*([0-9]+\.[0-9]{2})/i);
  if (tot) out.total = num(tot[1]);
  const odo = t.match(/(?:odometer|odo|mileage)\s*[:\s]*([0-9]{4,7})/i);
  if (odo) out.odometer = num(odo[1]);
  return out;
}

export function guessPhotoKind(text: string): PhotoKind {
  const t = clean(text);
  const r = [/costco/i, /gallons/i, /total sale/i, /pump/i, /regular/i, /aafes/i, /exchange/i].reduce(
    (n, re) => n + (re.test(t) ? 1 : 0),
    0,
  );
  const c = [/\bODO\b/i, /\bRange\b/i, /After\s*Reset/i, /\bMPH\b/i].reduce(
    (n, re) => n + (re.test(t) ? 1 : 0),
    0,
  );
  const s = [
    /oil\s*change/i,
    /tire\s*rotation/i,
    /invoice/i,
    /\blabor\b/i,
    /\bRO\b/,
    /repair\s*order/i,
    /firestone/i,
    /cabin\s*air/i,
  ].reduce((n, re) => n + (re.test(t) ? 1 : 0), 0);
  const e = [/kwh/i, /supercharger/i, /\$\s*[0-9.]+\s*\/\s*kwh/i, /wall\s*connector/i].reduce(
    (n, re) => n + (re.test(t) ? 1 : 0),
    0,
  );
  if (c > r && c > s && c > e) return "cluster";
  if (e > r && e >= s) return "charge";
  if (s > r) return "shop";
  if (r > 0) return "receipt";
  return "unknown";
}

export function mergeParse(
  receipt: Partial<ReceiptParse>,
  cluster: Partial<ClusterParse>,
  extra: Partial<FillDraft> = {},
): FillDraft {
  const str = (n: number | string | null | undefined) => (n == null || n === "" ? "" : String(n));
  return {
    id: extra.id || "",
    date: receipt.date || extra.date || "",
    time: receipt.time || extra.time || "",
    station: receipt.station || extra.station || "",
    city: receipt.city || extra.city || "",
    pump: receipt.pump || extra.pump || "",
    grade: receipt.grade || extra.grade || "Regular 87",
    gallons: str(receipt.gallons ?? extra.gallons),
    pricePerGal: str(receipt.pricePerGal ?? extra.pricePerGal),
    total: str(receipt.total ?? extra.total),
    odometer: str(cluster.odometer ?? extra.odometer),
    clusterRange: str(cluster.clusterRange ?? extra.clusterRange),
    clusterAvgMph: str(cluster.clusterAvgMph ?? extra.clusterAvgMph),
    outsideF: str(cluster.outsideF ?? extra.outsideF),
    fillToFull: extra.fillToFull || "Yes",
    tripType: extra.tripType || "Mixed",
    notes: extra.notes || "",
  };
}

export function mergeShopParse(shop: ShopParse, extra: Partial<ServiceDraft> = {}): ServiceDraft {
  const str = (n: number | string | null | undefined) => (n == null || n === "" ? "" : String(n));
  return {
    id: extra.id || "",
    date: shop.date || extra.date || "",
    shop: shop.shop || extra.shop || "",
    city: shop.city || extra.city || "",
    odometer: str(shop.odometer ?? extra.odometer),
    total: str(shop.total ?? extra.total),
    category: shop.category || extra.category || "other",
    summary: shop.summary || extra.summary || "",
    status: extra.status || "done",
    dueDate: extra.dueDate || "",
    dueMiles: extra.dueMiles || "",
    notes: extra.notes || "",
  };
}

export function mergeChargeParse(charge: ChargeParse, extra: Partial<ChargeDraft> = {}): ChargeDraft {
  const str = (n: number | string | null | undefined) => (n == null || n === "" ? "" : String(n));
  return {
    id: extra.id || "",
    date: charge.date || extra.date || "",
    time: charge.time || extra.time || "",
    location: charge.location || extra.location || "Other",
    city: charge.city || extra.city || "",
    kwh: str(charge.kwh ?? extra.kwh),
    pricePerKwh: str(charge.pricePerKwh ?? extra.pricePerKwh),
    total: str(charge.total ?? extra.total),
    odometer: str(charge.odometer ?? extra.odometer),
    notes: extra.notes || "",
  };
}
