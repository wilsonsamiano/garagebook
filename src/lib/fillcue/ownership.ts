import { enrich } from "./stats.ts";
import { SERVICE_CATEGORIES, type Charge, type Fill, type ServiceJob, type VehicleSettings } from "./types.ts";


export type ShopCategorySpend = {
  category: string;
  label: string;
  spend: number;
  count: number;
};

export type OwnershipSummary = {
  vehicle: string;
  vehicleId: string;
  vin: string;
  powertrain: VehicleSettings["powertrain"];
  ownedSince: string;
  purchaseOdo: number | null;
  currentOdo: number | null;
  milesOwned: number | null;
  periodStart: string;
  periodEnd: string;
  gallons: number;
  fuelSpend: number;
  fillCount: number;
  avgMpg: number | null;
  kwh: number;
  energySpend: number;
  chargeCount: number;
  miPerKwh: number | null;
  shopSpend: number;
  jobCount: number;
  shopByCategory: ShopCategorySpend[];
  operatingTotal: number;
  costPerMile: number | null;
};

function inPeriod(date: string, since: string): boolean {
  if (!since) return true;
  return String(date || "") >= since;
}

export function summarizeOwnership(
  settings: VehicleSettings,
  fills: Fill[],
  jobs: ServiceJob[],
  charges: Charge[],
  today = new Date().toISOString().slice(0, 10),
): OwnershipSummary {
  const since = settings.ownedSince || "";
  const fuel = fills.filter((f) => inPeriod(f.date, since));
  const shop = jobs.filter((j) => j.status === "done" && inPeriod(j.date, since));
  const energy = charges.filter((c) => inPeriod(c.date, since));
  const stats = enrich(fuel, settings);

  const odoNums = [
    ...fuel.map((f) => f.odometer),
    ...shop.map((j) => j.odometer),
    ...energy.map((c) => c.odometer),
  ].filter((n): n is number => n != null && Number.isFinite(n) && n > 0);
  const currentOdo = odoNums.length ? Math.max(...odoNums) : null;
  const firstOdo = odoNums.length ? Math.min(...odoNums) : null;
  const purchaseOdo = settings.purchaseOdo != null && Number.isFinite(settings.purchaseOdo) ? settings.purchaseOdo : null;
  const milesOwned =
    currentOdo != null && purchaseOdo != null && currentOdo > purchaseOdo
      ? currentOdo - purchaseOdo
      : currentOdo != null && firstOdo != null && currentOdo > firstOdo
        ? currentOdo - firstOdo
        : null;

  const dates = [...fuel.map((f) => f.date), ...shop.map((j) => j.date), ...energy.map((c) => c.date)].filter(Boolean);
  dates.sort();
  const periodStart = since || dates[0] || today;
  const periodEnd = dates[dates.length - 1] || today;

  const gallons = stats.gallons;
  const fuelSpend = stats.spent;
  const kwh = energy.reduce((s, c) => s + (Number(c.kwh) || 0), 0);
  const energySpend = energy.reduce((s, c) => s + (Number(c.total) || 0), 0);
  const shopSpend = shop.reduce((s, j) => s + (Number(j.total) || 0), 0);

  const byCat = new Map<string, ShopCategorySpend>();
  for (const j of shop) {
    const id = j.category || "other";
    const row = byCat.get(id) || {
      category: id,
      label: SERVICE_CATEGORIES.find((c) => c.id === id)?.label || id,
      spend: 0,
      count: 0,
    };
    row.spend += Number(j.total) || 0;
    row.count += 1;
    byCat.set(id, row);
  }
  const shopByCategory = [...byCat.values()].sort((a, b) => b.spend - a.spend);

  const operatingTotal = fuelSpend + energySpend + shopSpend;
  const costPerMile = milesOwned && milesOwned > 0 ? operatingTotal / milesOwned : null;

  const sortedCharges = [...energy]
    .filter((c) => c.odometer != null && Number.isFinite(c.odometer))
    .sort((a, b) => Number(a.odometer) - Number(b.odometer));
  let driveMiles = 0;
  let driveKwh = 0;
  for (let i = 1; i < sortedCharges.length; i++) {
    const miles = Number(sortedCharges[i].odometer) - Number(sortedCharges[i - 1].odometer);
    const k = Number(sortedCharges[i].kwh) || 0;
    if (miles > 0 && k > 0) {
      driveMiles += miles;
      driveKwh += k;
    }
  }
  const miPerKwh = driveKwh > 0 ? driveMiles / driveKwh : null;


  return {
    vehicle: settings.vehicle,
    vehicleId: settings.activeVehicleId,
    vin: settings.vin || "",
    powertrain: settings.powertrain,
    ownedSince: since,
    purchaseOdo,
    currentOdo,
    milesOwned,
    periodStart,
    periodEnd,
    gallons,
    fuelSpend,
    fillCount: fuel.length,
    avgMpg: stats.avgMpg,
    kwh,
    energySpend,
    chargeCount: energy.length,
    miPerKwh,
    shopSpend,
    jobCount: shop.length,
    shopByCategory,
    operatingTotal,
    costPerMile,
  };
}
