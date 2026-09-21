export type FillToFull = "Yes" | "Partial" | "No";
export type TripType = "Mixed" | "City" | "Highway" | "Towing" | "Loaded family";
export type Powertrain = "ice" | "hybrid" | "phev" | "ev";
export type ServiceStatus = "done" | "scheduled";
export type ChargeLocation = "Home" | "Supercharger" | "Destination" | "Work" | "Other";
export type ServiceCategory =
  | "oil"
  | "rotation"
  | "tires"
  | "brakes"
  | "brake-fluid"
  | "cabin-filter"
  | "air-filter"
  | "transmission"
  | "coolant"
  | "spark-plugs"
  | "battery"
  | "wipers"
  | "alignment"
  | "inspection"
  | "other";

export type Fill = {
  id: string;
  vehicleId: string;
  date: string;
  time: string;
  station: string;
  city: string;
  pump: string;
  grade: string;
  gallons: number | null;
  pricePerGal: number | null;
  total: number | null;
  odometer: number | null;
  clusterRange: number | null;
  clusterAvgMph: number | null;
  outsideF: number | null;
  fillToFull: FillToFull;
  tripType: TripType;
  notes: string;
  receiptText?: string;
  clusterText?: string;
  receiptScan?: string;
  clusterScan?: string;
  updatedAt?: string;
};

export type EnrichedFill = Fill & {
  milesThisTank: number | null;
  mpg: number | null;
  costPerMile: number | null;
};

export type Charge = {
  id: string;
  vehicleId: string;
  date: string;
  time: string;
  location: ChargeLocation;
  city: string;
  kwh: number | null;
  pricePerKwh: number | null;
  total: number | null;
  odometer: number | null;
  notes: string;
  receiptText?: string;
  receiptScan?: string;
  updatedAt?: string;
};

export type ChargeDraft = {
  id: string;
  date: string;
  time: string;
  location: ChargeLocation;
  city: string;
  kwh: string;
  pricePerKwh: string;
  total: string;
  odometer: string;
  notes: string;
};

/** First-class garage entry. Fills, charges, and jobs point at `id`. */
export type VehicleRecord = {
  id: string;
  name: string;
  powertrain: Powertrain;
  vin: string;
  tankGal: number;
  usableGal: number;
  epaCity: number;
  epaHwy: number;
  epaComb: number;
  ownedSince: string;
  purchaseOdo: number | null;
};

/** Snapshot of the active vehicle — what stats, OCR, and the spreadsheet read. */
export type VehicleSettings = {
  vehicle: string;
  tankGal: number;
  usableGal: number;
  epaCity: number;
  epaHwy: number;
  epaComb: number;
  activeVehicleId: string;
  powertrain: Powertrain;
  ownedSince: string;
  purchaseOdo: number | null;
  vin: string;
};

export type VehiclePreset = {
  id: string;
  name: string;
  powertrain: Powertrain;
  tankGal: number;
  usableGal: number;
  epaCity: number;
  epaHwy: number;
  epaComb: number;
};

export const VEHICLE_PRESETS: VehiclePreset[] = [
  {
    id: "highlander",
    name: "2015 Toyota Highlander XLE",
    powertrain: "ice",
    tankGal: 19.2,
    usableGal: 18.5,
    epaCity: 18,
    epaHwy: 24,
    epaComb: 20,
  },
  {
    id: "tesla",
    name: "2018 Tesla Model 3 LR",
    powertrain: "ev",
    tankGal: 0,
    usableGal: 0,
    epaCity: 0,
    epaHwy: 0,
    epaComb: 0,
  },
];

export type FillDraft = {
  id: string;
  date: string;
  time: string;
  station: string;
  city: string;
  pump: string;
  grade: string;
  gallons: string;
  pricePerGal: string;
  total: string;
  odometer: string;
  clusterRange: string;
  clusterAvgMph: string;
  outsideF: string;
  fillToFull: FillToFull;
  tripType: TripType;
  notes: string;
};

export type ServiceDraft = {
  id: string;
  date: string;
  shop: string;
  city: string;
  odometer: string;
  total: string;
  category: ServiceCategory;
  summary: string;
  status: ServiceStatus;
  dueDate: string;
  dueMiles: string;
  notes: string;
};

export type ServiceJob = {
  id: string;
  vehicleId: string;
  date: string;
  shop: string;
  city: string;
  odometer: number | null;
  total: number | null;
  category: ServiceCategory;
  summary: string;
  status: ServiceStatus;
  dueDate: string;
  dueMiles: number | null;
  notes: string;
  receiptText?: string;
  receiptScan?: string;
  updatedAt?: string;
};

export type PhotoKind = "receipt" | "cluster" | "shop" | "charge" | "unknown";
export type CaptureMode = "fuel" | "shop" | "charge";

export const POWERTRAIN_OPTIONS: { id: Powertrain; label: string }[] = [
  { id: "ice", label: "Gas" },
  { id: "hybrid", label: "Hybrid" },
  { id: "phev", label: "Plug-in" },
  { id: "ev", label: "EV" },
];

export function powertrainLabel(p: Powertrain): string {
  return POWERTRAIN_OPTIONS.find((o) => o.id === p)?.label ?? "Gas";
}

/** Gasoline, hybrid, and plug-in hybrids all burn fuel. */
export function burnsFuel(p: Powertrain): boolean {
  return p !== "ev";
}

/** Battery EVs and plug-in hybrids take a charge log. */
export function plugsIn(p: Powertrain): boolean {
  return p === "ev" || p === "phev";
}

export function coerceCaptureMode(powertrain: Powertrain, mode: CaptureMode): CaptureMode {
  if (mode === "shop") return "shop";
  if (mode === "charge") return plugsIn(powertrain) ? "charge" : "fuel";
  return burnsFuel(powertrain) ? "fuel" : "charge";
}

export function captureModesFor(p: Powertrain): { id: CaptureMode; label: string }[] {
  const rows: { id: CaptureMode; label: string }[] = [];
  if (burnsFuel(p)) rows.push({ id: "fuel", label: "Fuel" });
  if (plugsIn(p)) rows.push({ id: "charge", label: "Charge" });
  rows.push({ id: "shop", label: "Shop" });
  return rows;
}

export const DEFAULT_SETTINGS: VehicleSettings = {
  vehicle: "2015 Toyota Highlander XLE",
  tankGal: 19.2,
  usableGal: 18.5,
  epaCity: 18,
  epaHwy: 24,
  epaComb: 20,
  activeVehicleId: "highlander",
  powertrain: "ice",
  ownedSince: "",
  purchaseOdo: null,
  vin: "",
};

export const FILL_TO_FULL: FillToFull[] = ["Yes", "Partial", "No"];
export const TRIP_TYPES: TripType[] = ["Mixed", "City", "Highway", "Towing", "Loaded family"];
export const GRADES = ["Regular 87", "Midgrade 89", "Premium 91", "Premium 93", "Diesel", "E85"];
export const CHARGE_LOCATIONS: ChargeLocation[] = ["Home", "Supercharger", "Destination", "Work", "Other"];
export const SERVICE_CATEGORIES: { id: ServiceCategory; label: string }[] = [
  { id: "oil", label: "Oil change" },
  { id: "rotation", label: "Tire rotation" },
  { id: "tires", label: "Tires" },
  { id: "brakes", label: "Brakes" },
  { id: "brake-fluid", label: "Brake fluid" },
  { id: "cabin-filter", label: "Cabin filter" },
  { id: "air-filter", label: "Engine air filter" },
  { id: "transmission", label: "Transmission" },
  { id: "coolant", label: "Coolant" },
  { id: "spark-plugs", label: "Spark plugs" },
  { id: "battery", label: "Battery" },
  { id: "wipers", label: "Wipers" },
  { id: "alignment", label: "Alignment" },
  { id: "inspection", label: "Inspection" },
  { id: "other", label: "Other" },
];

export const SEED_FILL: Fill = {
  id: "seed-costco-2026-09-20",
  vehicleId: "highlander",
  date: "2026-09-20",
  time: "12:22",
  station: "Costco #483",
  city: "San Diego, CA",
  pump: "8",
  grade: "Regular 87",
  gallons: 14.418,
  pricePerGal: 5.799,
  total: 83.61,
  odometer: 112464,
  clusterRange: 309,
  clusterAvgMph: 26,
  outsideF: 81,
  fillToFull: "Yes",
  tripType: "City",
  notes:
    "Costco Gateway Center Dr, then 4.2 mi to Tous Les Jours, National City. Cluster at bakery: ODO 112468 / Range 309 / 26 mph / 81F.",
};

export const SAMPLE_RECEIPT = `Costco #483
844 Gateway Center Dr
San Diego, CA 92102
Date: 09/20/26
Time: 12:22
Pump 8
Gallons 14.418
Price $ 5.799
Product Regular
Amount $ 83.61
Total Sale $ 83.61`;

export const SAMPLE_CLUSTER = `Outside 81°F
P
Range
309 miles
After Reset
26 MPH
ODO 112468 miles`;

export const SAMPLE_SHOP = `Firestone Complete Auto Care
El Paso, TX 79925
Date: 08/12/26
RO 184422
Mileage 110210
Oil change 0W-20
Tire rotation
Cabin air filter
Labor 89.00
Parts 64.18
Total $ 153.18`;

export const SAMPLE_CHARGE = `Tesla Supercharger
6101 Gateway Blvd E
El Paso, TX 79905
Date: 09/18/26
Time: 18:40
42.812 kWh
$0.420 / kWh
Total $17.98`;

export function emptyDraft(partial: Partial<FillDraft> = {}): FillDraft {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: "",
    date: today,
    time: "",
    station: "",
    city: "",
    pump: "",
    grade: "Regular 87",
    gallons: "",
    pricePerGal: "",
    total: "",
    odometer: "",
    clusterRange: "",
    clusterAvgMph: "",
    outsideF: "",
    fillToFull: "Yes",
    tripType: "Mixed",
    notes: "",
    ...partial,
  };
}

export function emptyServiceDraft(partial: Partial<ServiceDraft> = {}): ServiceDraft {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: "",
    date: today,
    shop: "",
    city: "",
    odometer: "",
    total: "",
    category: "oil",
    summary: "",
    status: "done",
    dueDate: "",
    dueMiles: "",
    notes: "",
    ...partial,
  };
}

export function emptyChargeDraft(partial: Partial<ChargeDraft> = {}): ChargeDraft {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: "",
    date: today,
    time: "",
    location: "Supercharger",
    city: "",
    kwh: "",
    pricePerKwh: "",
    total: "",
    odometer: "",
    notes: "",
    ...partial,
  };
}

export function fillToDraft(fill: Fill): FillDraft {
  const str = (n: number | null | undefined) => (n == null || Number.isNaN(n) ? "" : String(n));
  return {
    id: fill.id,
    date: fill.date || "",
    time: fill.time || "",
    station: fill.station || "",
    city: fill.city || "",
    pump: fill.pump || "",
    grade: fill.grade || "Regular 87",
    gallons: str(fill.gallons),
    pricePerGal: str(fill.pricePerGal),
    total: str(fill.total),
    odometer: str(fill.odometer),
    clusterRange: str(fill.clusterRange),
    clusterAvgMph: str(fill.clusterAvgMph),
    outsideF: str(fill.outsideF),
    fillToFull: fill.fillToFull || "Yes",
    tripType: fill.tripType || "Mixed",
    notes: fill.notes || "",
  };
}

export function draftToFill(
  draft: FillDraft,
  extra: {
    receiptText?: string;
    clusterText?: string;
    receiptScan?: string;
    clusterScan?: string;
    vehicleId: string;
  },
): Fill {
  const num = (s: string): number | null => {
    if (s.trim() === "") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };
  return {
    id: draft.id,
    vehicleId: extra.vehicleId,
    date: draft.date,
    time: draft.time,
    station: draft.station,
    city: draft.city,
    pump: draft.pump,
    grade: draft.grade,
    gallons: num(draft.gallons),
    pricePerGal: num(draft.pricePerGal),
    total: num(draft.total),
    odometer: num(draft.odometer),
    clusterRange: num(draft.clusterRange),
    clusterAvgMph: num(draft.clusterAvgMph),
    outsideF: num(draft.outsideF),
    fillToFull: draft.fillToFull,
    tripType: draft.tripType,
    notes: draft.notes,
    receiptText: extra.receiptText || "",
    clusterText: extra.clusterText || "",
    receiptScan: extra.receiptScan || "",
    clusterScan: extra.clusterScan || "",
    updatedAt: new Date().toISOString(),
  };
}

export function jobToDraft(job: ServiceJob): ServiceDraft {
  const str = (n: number | null | undefined) => (n == null || Number.isNaN(n) ? "" : String(n));
  return {
    id: job.id,
    date: job.date || "",
    shop: job.shop || "",
    city: job.city || "",
    odometer: str(job.odometer),
    total: str(job.total),
    category: job.category || "other",
    summary: job.summary || "",
    status: job.status || "done",
    dueDate: job.dueDate || "",
    dueMiles: str(job.dueMiles),
    notes: job.notes || "",
  };
}

export function draftToJob(
  draft: ServiceDraft,
  extra: { receiptText?: string; receiptScan?: string; vehicleId: string },
): ServiceJob {
  const num = (s: string): number | null => {
    if (s.trim() === "") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };
  return {
    id: draft.id,
    vehicleId: extra.vehicleId,
    date: draft.date,
    shop: draft.shop,
    city: draft.city,
    odometer: num(draft.odometer),
    total: num(draft.total),
    category: draft.category,
    summary: draft.summary,
    status: draft.status,
    dueDate: draft.dueDate,
    dueMiles: num(draft.dueMiles),
    notes: draft.notes,
    receiptText: extra.receiptText || "",
    receiptScan: extra.receiptScan || "",
    updatedAt: new Date().toISOString(),
  };
}

export function chargeToDraft(charge: Charge): ChargeDraft {
  const str = (n: number | null | undefined) => (n == null || Number.isNaN(n) ? "" : String(n));
  return {
    id: charge.id,
    date: charge.date || "",
    time: charge.time || "",
    location: charge.location || "Other",
    city: charge.city || "",
    kwh: str(charge.kwh),
    pricePerKwh: str(charge.pricePerKwh),
    total: str(charge.total),
    odometer: str(charge.odometer),
    notes: charge.notes || "",
  };
}

export function draftToCharge(
  draft: ChargeDraft,
  extra: { receiptText?: string; receiptScan?: string; vehicleId: string },
): Charge {
  const num = (s: string): number | null => {
    if (s.trim() === "") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };
  return {
    id: draft.id,
    vehicleId: extra.vehicleId,
    date: draft.date,
    time: draft.time,
    location: draft.location,
    city: draft.city,
    kwh: num(draft.kwh),
    pricePerKwh: num(draft.pricePerKwh),
    total: num(draft.total),
    odometer: num(draft.odometer),
    notes: draft.notes,
    receiptText: extra.receiptText || "",
    receiptScan: extra.receiptScan || "",
    updatedAt: new Date().toISOString(),
  };
}

export function settingsFromVehicle(v: VehicleRecord): VehicleSettings {
  return {
    vehicle: v.name,
    tankGal: v.tankGal,
    usableGal: v.usableGal,
    epaCity: v.epaCity,
    epaHwy: v.epaHwy,
    epaComb: v.epaComb,
    activeVehicleId: v.id,
    powertrain: v.powertrain,
    ownedSince: v.ownedSince || "",
    purchaseOdo: v.purchaseOdo ?? null,
    vin: v.vin || "",
  };
}

export function vehicleFromSettings(s: VehicleSettings): VehicleRecord {
  return {
    id: s.activeVehicleId || "highlander",
    name: s.vehicle,
    powertrain: s.powertrain,
    vin: s.vin || "",
    tankGal: s.tankGal,
    usableGal: s.usableGal,
    epaCity: s.epaCity,
    epaHwy: s.epaHwy,
    epaComb: s.epaComb,
    ownedSince: s.ownedSince || "",
    purchaseOdo: s.purchaseOdo ?? null,
  };
}

export function vehicleFromPreset(preset: VehiclePreset, extra: Partial<VehicleRecord> = {}): VehicleRecord {
  return {
    id: extra.id || preset.id,
    name: extra.name || preset.name,
    powertrain: extra.powertrain || preset.powertrain,
    vin: extra.vin || "",
    tankGal: extra.tankGal ?? preset.tankGal,
    usableGal: extra.usableGal ?? preset.usableGal,
    epaCity: extra.epaCity ?? preset.epaCity,
    epaHwy: extra.epaHwy ?? preset.epaHwy,
    epaComb: extra.epaComb ?? preset.epaComb,
    ownedSince: extra.ownedSince || "",
    purchaseOdo: extra.purchaseOdo ?? null,
  };
}

export function blankVehicle(extra: Partial<VehicleRecord> = {}): VehicleRecord {
  return {
    id: extra.id || "",
    name: extra.name || "New vehicle",
    powertrain: extra.powertrain || "ice",
    vin: extra.vin || "",
    tankGal: extra.tankGal ?? 15,
    usableGal: extra.usableGal ?? 14.5,
    epaCity: extra.epaCity ?? 22,
    epaHwy: extra.epaHwy ?? 28,
    epaComb: extra.epaComb ?? 24,
    ownedSince: extra.ownedSince || "",
    purchaseOdo: extra.purchaseOdo ?? null,
  };
}

export function presetToSettings(preset: VehiclePreset, extra: Partial<VehicleSettings> = {}): VehicleSettings {
  return settingsFromVehicle(
    vehicleFromPreset(preset, {
      name: extra.vehicle,
      vin: extra.vin,
      ownedSince: extra.ownedSince,
      purchaseOdo: extra.purchaseOdo,
      tankGal: extra.tankGal,
      usableGal: extra.usableGal,
      epaCity: extra.epaCity,
      epaHwy: extra.epaHwy,
      epaComb: extra.epaComb,
    }),
  );
}
