import type { Powertrain } from "./types.ts";

/**
 * Manufacturer published tank size (US gallons). EPA does not ship tank capacity.
 * Usable is listed when we have a working figure; otherwise 96% of published tank
 * (pump clicks off early, filler neck, and a little unusable reserve).
 */
type TankSpec = {
  make: string;
  model: string;
  from: number;
  to: number;
  tankGal: number;
  usableGal?: number;
  kind?: "gas" | "hybrid" | "ev";
};

const SPECS: TankSpec[] = [
  // Toyota — Highlander XU50 owner's manual: 19.2 gal (72.5 L). Hybrid is smaller.
  { make: "Toyota", model: "Highlander", from: 2014, to: 2019, tankGal: 19.2, usableGal: 18.5, kind: "gas" },
  { make: "Toyota", model: "Highlander", from: 2014, to: 2019, tankGal: 17.2, usableGal: 16.5, kind: "hybrid" },
  { make: "Toyota", model: "Highlander", from: 2020, to: 2025, tankGal: 17.9, kind: "gas" },
  { make: "Toyota", model: "Highlander", from: 2020, to: 2025, tankGal: 17.1, kind: "hybrid" },
  { make: "Toyota", model: "Camry", from: 2012, to: 2017, tankGal: 17.0 },
  { make: "Toyota", model: "Camry", from: 2018, to: 2024, tankGal: 16.0, kind: "gas" },
  { make: "Toyota", model: "Camry", from: 2018, to: 2024, tankGal: 13.0, kind: "hybrid" },
  { make: "Toyota", model: "Corolla", from: 2014, to: 2025, tankGal: 13.2 },
  { make: "Toyota", model: "RAV4", from: 2013, to: 2018, tankGal: 15.9 },
  { make: "Toyota", model: "RAV4", from: 2019, to: 2025, tankGal: 14.5 },
  { make: "Toyota", model: "Sienna", from: 2011, to: 2020, tankGal: 20.0 },
  { make: "Toyota", model: "Sienna", from: 2021, to: 2026, tankGal: 18.0 },
  { make: "Toyota", model: "Tacoma", from: 2016, to: 2023, tankGal: 21.1 },
  { make: "Toyota", model: "4Runner", from: 2010, to: 2024, tankGal: 23.0 },
  { make: "Toyota", model: "Prius", from: 2010, to: 2015, tankGal: 11.9, kind: "hybrid" },
  { make: "Toyota", model: "Prius", from: 2016, to: 2022, tankGal: 11.3, kind: "hybrid" },
  { make: "Toyota", model: "Tundra", from: 2014, to: 2021, tankGal: 26.4 },
  { make: "Lexus", model: "RX", from: 2016, to: 2022, tankGal: 19.2 },

  { make: "Honda", model: "Civic", from: 2012, to: 2015, tankGal: 13.2, usableGal: 12.7 },
  { make: "Honda", model: "Civic", from: 2016, to: 2021, tankGal: 12.4 },
  { make: "Honda", model: "Civic", from: 2022, to: 2026, tankGal: 12.4 },
  { make: "Honda", model: "Accord", from: 2013, to: 2017, tankGal: 17.2 },
  { make: "Honda", model: "Accord", from: 2018, to: 2022, tankGal: 14.8 },
  { make: "Honda", model: "CR-V", from: 2012, to: 2016, tankGal: 15.3 },
  { make: "Honda", model: "CR-V", from: 2017, to: 2022, tankGal: 14.0 },
  { make: "Honda", model: "Odyssey", from: 2011, to: 2017, tankGal: 21.0 },
  { make: "Honda", model: "Odyssey", from: 2018, to: 2026, tankGal: 19.5 },
  { make: "Honda", model: "Pilot", from: 2016, to: 2022, tankGal: 19.5 },
  { make: "Honda", model: "Ridgeline", from: 2017, to: 2026, tankGal: 19.5 },
  { make: "Honda", model: "Fit", from: 2015, to: 2020, tankGal: 10.6 },

  { make: "Ford", model: "Escape", from: 2013, to: 2019, tankGal: 15.1 },
  { make: "Ford", model: "Escape", from: 2020, to: 2025, tankGal: 14.7 },
  { make: "Ford", model: "Explorer", from: 2016, to: 2019, tankGal: 18.6 },
  { make: "Ford", model: "Explorer", from: 2020, to: 2025, tankGal: 17.9 },
  { make: "Ford", model: "F-150", from: 2015, to: 2020, tankGal: 23.0 },
  { make: "Ford", model: "Mustang", from: 2015, to: 2023, tankGal: 16.0 },
  { make: "Ford", model: "Edge", from: 2015, to: 2024, tankGal: 18.0 },

  { make: "Chevrolet", model: "Equinox", from: 2018, to: 2024, tankGal: 14.9 },
  { make: "Chevrolet", model: "Malibu", from: 2016, to: 2023, tankGal: 15.8 },
  { make: "Chevrolet", model: "Silverado", from: 2014, to: 2018, tankGal: 26.0 },
  { make: "Chevrolet", model: "Tahoe", from: 2015, to: 2020, tankGal: 26.0 },

  { make: "Nissan", model: "Altima", from: 2013, to: 2018, tankGal: 18.0 },
  { make: "Nissan", model: "Altima", from: 2019, to: 2025, tankGal: 16.2 },
  { make: "Nissan", model: "Rogue", from: 2014, to: 2020, tankGal: 14.5 },
  { make: "Nissan", model: "Rogue", from: 2021, to: 2025, tankGal: 14.5 },

  { make: "Subaru", model: "Outback", from: 2015, to: 2025, tankGal: 18.5 },
  { make: "Subaru", model: "Forester", from: 2014, to: 2018, tankGal: 15.9 },
  { make: "Subaru", model: "Forester", from: 2019, to: 2024, tankGal: 16.6 },
  { make: "Subaru", model: "Crosstrek", from: 2018, to: 2023, tankGal: 16.6 },

  { make: "Jeep", model: "Wrangler", from: 2012, to: 2017, tankGal: 18.6 },
  { make: "Jeep", model: "Wrangler", from: 2018, to: 2024, tankGal: 21.5 },
  { make: "Jeep", model: "Grand Cherokee", from: 2011, to: 2021, tankGal: 24.6 },
  { make: "Jeep", model: "Cherokee", from: 2014, to: 2023, tankGal: 15.8 },

  { make: "Hyundai", model: "Elantra", from: 2017, to: 2020, tankGal: 14.0 },
  { make: "Hyundai", model: "Tucson", from: 2016, to: 2021, tankGal: 16.4 },
  { make: "Hyundai", model: "Santa Fe", from: 2013, to: 2018, tankGal: 17.4 },
  { make: "Kia", model: "Sportage", from: 2017, to: 2022, tankGal: 16.4 },
  { make: "Kia", model: "Telluride", from: 2020, to: 2025, tankGal: 18.8 },

  { make: "Mazda", model: "CX-5", from: 2017, to: 2025, tankGal: 15.3 },
  { make: "Mazda", model: "Mazda3", from: 2014, to: 2018, tankGal: 13.2 },
  { make: "Volkswagen", model: "Jetta", from: 2019, to: 2024, tankGal: 13.2 },
  { make: "BMW", model: "3 Series", from: 2012, to: 2018, tankGal: 15.8 },
  { make: "Mercedes-Benz", model: "C-Class", from: 2015, to: 2021, tankGal: 17.4 },

  { make: "Tesla", model: "Model 3", from: 2017, to: 2026, tankGal: 0, usableGal: 0, kind: "ev" },
  { make: "Tesla", model: "Model Y", from: 2020, to: 2026, tankGal: 0, usableGal: 0, kind: "ev" },
  { make: "Tesla", model: "Model S", from: 2012, to: 2026, tankGal: 0, usableGal: 0, kind: "ev" },
  { make: "Tesla", model: "Model X", from: 2016, to: 2026, tankGal: 0, usableGal: 0, kind: "ev" },
];

function core(s: string): string {
  return String(s || "")
    .toLowerCase()
    .replace(/\b(2wd|4wd|awd|fwd|rwd|4x4|4x2|hybrid|phev|plugin|plug-in)\b/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function usableFromTank(tankGal: number, listed?: number): number {
  if (listed != null && Number.isFinite(listed)) return listed;
  return Math.round(tankGal * 0.96 * 10) / 10;
}

function isHybrid(model: string, fuel: string): boolean {
  return /\bhybrid\b/i.test(`${model} ${fuel}`);
}

export function tankFor(
  year: number,
  make: string,
  model: string,
  powertrain: Powertrain,
  fuel = "",
): { tankGal: number; usableGal: number } | null {
  if (powertrain === "ev") return { tankGal: 0, usableGal: 0 };
  const mk = make.toLowerCase();
  const md = core(model);
  const hybrid = isHybrid(model, fuel);
  const hits = SPECS.filter((s) => {
    if (s.make.toLowerCase() !== mk) return false;
    if (year < s.from || year > s.to) return false;
    if (s.kind === "ev") return false;
    const specModel = core(s.model);
    const first = md.split(" ")[0] || md;
    if (!md.includes(specModel) && !specModel.includes(first)) return false;
    if (s.kind === "hybrid") return hybrid;
    if (s.kind === "gas") return !hybrid;
    return true;
  });
  if (!hits.length) return null;
  hits.sort((a, b) => core(b.model).length - core(a.model).length);
  const best = hits[0];
  return { tankGal: best.tankGal, usableGal: usableFromTank(best.tankGal, best.usableGal) };
}
