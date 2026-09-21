import type { Powertrain } from "./types.ts";
import { tankFor } from "./tank-specs.ts";
import { isCompleteVin } from "./vin.ts";

const EPA_BASE = "https://www.fueleconomy.gov/ws/rest";
const VPIC = "https://vpic.nhtsa.dot.gov/api/vehicles";

export type EpaMatch = {
  id: string;
  year: number;
  make: string;
  model: string;
  option: string;
  city: number;
  hwy: number;
  comb: number;
  fuel: string;
  powertrain: Powertrain;
  drive: string;
  name: string;
  tankGal: number | null;
  usableGal: number | null;
};

export type VinDecode = {
  year: string;
  make: string;
  model: string;
  fuel: string;
  drive: string;
  displ: string;
  electrification: string;
};

export type LookupResult = {
  decoded: VinDecode | null;
  matches: EpaMatch[];
};

type MenuItem = { text: string; value: string };

function asList<T>(x: T | T[] | null | undefined): T[] {
  if (x == null) return [];
  return Array.isArray(x) ? x : [x];
}

export function menuItems(data: unknown): MenuItem[] {
  const root = data as { menuItem?: MenuItem | MenuItem[] } | null;
  return asList(root?.menuItem)
    .filter((i) => i && (i.text || i.value))
    .map((i) => ({ text: String(i.text ?? i.value), value: String(i.value ?? i.text) }));
}

export function parseYearMakeModel(name: string): { year: number; rest: string } | null {
  const m = String(name || "").trim().match(/^((?:19|20)\d{2})\s+(.+)$/);
  if (!m) return null;
  const year = Number(m[1]);
  if (year < 1984 || year > 2030) return null;
  return { year, rest: m[2].trim() };
}

export function pickMake(rest: string, makes: string[]): { make: string; model: string } | null {
  const lower = rest.trim().toLowerCase();
  const ranked = [...makes].sort((a, b) => b.length - a.length);
  for (const make of ranked) {
    const m = make.toLowerCase();
    if (lower === m) return { make, model: "" };
    if (lower.startsWith(`${m} `)) return { make, model: rest.slice(make.length).trim() };
  }
  return null;
}

export function modelCore(s: string): string {
  return String(s || "")
    .toLowerCase()
    .replace(/\b(2wd|4wd|awd|fwd|rwd|4x4|4x2|hybrid|phev|plugin|plug-in)\b/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function rankModels(query: string, models: string[]): string[] {
  const qCore = modelCore(query);
  if (!qCore) return [];
  const qTokens = qCore.split(/\s+/).filter((t) => t.length > 1 || /^\d+$/.test(t));
  const scored = models
    .map((model) => {
      const core = modelCore(model);
      if (!core) return { model, score: 0 };
      if (core === qCore) return { model, score: 100 };
      if (core.startsWith(`${qCore} `) || core === qCore || qCore.startsWith(`${core} `)) return { model, score: 80 };
      const hits = qTokens.filter((t) => core.includes(t)).length;
      const need = qTokens.length || 1;
      if (hits === 0 || hits < need) return { model, score: 0 };
      return { model, score: Math.round((hits / need) * 60) };
    })
    .filter((x) => x.score >= 50)
    .sort((a, b) => b.score - a.score || a.model.length - b.model.length);
  const top = scored[0]?.score ?? 0;
  return scored.filter((x) => x.score >= top - 20).map((x) => x.model);
}

export function isElectricFuel(fuel: string, atv = "", electrification = ""): boolean {
  const blob = `${fuel} ${atv} ${electrification}`.toLowerCase();
  if (/\b(phev|plug-?in hybrid)\b/.test(blob)) return false;
  return /\b(electricity|electric|\bev\b|bev)\b/.test(blob);
}

export function detectPowertrain(fuel: string, atv = "", electrification = "", model = ""): Powertrain {
  const blob = `${fuel} ${atv} ${electrification} ${model}`.toLowerCase();
  if (/\b(phev|plug-?in)\b/.test(blob)) return "phev";
  if (isElectricFuel(fuel, atv, electrification)) return "ev";
  if (/\bhybrid\b/.test(blob)) return "hybrid";
  return "ice";
}

function num(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function getJson(url: string): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: ctrl.signal });
    if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
    return await res.json();
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") throw new Error("EPA lookup timed out.");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function epaMenu(path: string): Promise<MenuItem[]> {
  return menuItems(await getJson(`${EPA_BASE}/vehicle/menu/${path}`));
}

async function epaVehicle(id: string): Promise<EpaMatch | null> {
  const raw = (await getJson(`${EPA_BASE}/vehicle/${encodeURIComponent(id)}`)) as Record<string, unknown>;
  const city = num(raw.city08);
  const hwy = num(raw.highway08);
  const comb = num(raw.comb08);
  if (city == null || hwy == null) return null;
  const year = num(raw.year) || 0;
  const make = String(raw.make || "");
  const model = String(raw.model || "");
  const fuel = String(raw.fuelType1 || raw.fuelType || "");
  const atv = String(raw.atvType || "");
  const option = String(raw.trany || raw.engId || "");
  const drive = String(raw.drive || "");
  const powertrain = detectPowertrain(fuel, atv, "", model);
  const tank = tankFor(year, make, model, powertrain, `${fuel} ${atv} ${model}`);
  const name = [year, make, model].filter(Boolean).join(" ");
  return {
    id: String(raw.id || id),
    year,
    make,
    model,
    option,
    city,
    hwy,
    comb: comb ?? Math.round(city * 0.55 + hwy * 0.45),
    fuel,
    powertrain,
    drive,
    name,
    tankGal: tank?.tankGal ?? null,
    usableGal: tank?.usableGal ?? null,
  };
}

export async function decodeVin(vin: string): Promise<VinDecode | null> {
  if (!isCompleteVin(vin)) return null;
  const data = (await getJson(`${VPIC}/DecodeVinValues/${encodeURIComponent(vin)}?format=json`)) as {
    Results?: Array<Record<string, string>>;
  };
  const row = data.Results?.[0];
  if (!row) return null;
  const make = (row.Make || "").trim();
  const model = (row.Model || "").trim();
  const year = (row.ModelYear || "").trim();
  if (!make || !model || !year) return null;
  return {
    year,
    make,
    model,
    fuel: (row.FuelTypePrimary || "").trim(),
    drive: (row.DriveType || "").trim(),
    displ: (row.DisplacementL || "").trim(),
    electrification: (row.ElectrificationLevel || "").trim(),
  };
}

function preferDrive(models: string[], drive: string): string[] {
  if (!drive) return models;
  const wantAwd = /\b(awd|4wd|4x4|all-wheel|4-wheel)\b/i.test(drive);
  const want2 = /\b(2wd|4x2|fwd|rwd|2-wheel)\b/i.test(drive);
  const tagged = models.filter((m) => {
    const awd = /\b(awd|4wd|4x4)\b/i.test(m);
    const twod = /\b(2wd|fwd|rwd)\b/i.test(m);
    if (wantAwd) return awd || !twod;
    if (want2) return twod || !awd;
    return true;
  });
  return tagged.length ? tagged : models;
}

export async function lookupByYearMakeModel(
  year: number,
  make: string,
  modelQuery: string,
  drive = "",
): Promise<EpaMatch[]> {
  const models = (await epaMenu(`model?year=${year}&make=${encodeURIComponent(make)}`)).map((i) => i.text);
  let picked = rankModels(modelQuery || make, models);
  picked = preferDrive(picked, drive).slice(0, 4);
  const matches: EpaMatch[] = [];
  for (const model of picked) {
    const options = await epaMenu(
      `options?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`,
    );
    for (const opt of options.slice(0, 6)) {
      const rec = await epaVehicle(opt.value);
      if (rec) {
        rec.option = opt.text || rec.option;
        matches.push(rec);
      }
      if (matches.length >= 8) return matches;
    }
  }
  return matches;
}

export async function lookupVehicle(input: { vin?: string; name?: string }): Promise<LookupResult> {
  const vin = (input.vin || "").trim();
  const name = (input.name || "").trim();
  let decoded: VinDecode | null = null;

  if (isCompleteVin(vin)) {
    decoded = await decodeVin(vin);
    if (decoded) {
      const matches = await lookupByYearMakeModel(
        Number(decoded.year),
        titleCaseMake(decoded.make),
        decoded.model,
        decoded.drive,
      );
      if (matches.length) return { decoded, matches };
    }
  }

  const parsed = parseYearMakeModel(name);
  if (!parsed) {
    if (decoded) return { decoded, matches: [] };
    throw new Error("Add a 17-character VIN, or a name like 2015 Toyota Highlander.");
  }
  const makes = (await epaMenu(`make?year=${parsed.year}`)).map((i) => i.text);
  const picked = pickMake(parsed.rest, makes);
  if (!picked) throw new Error(`No EPA make matched “${parsed.rest}”.`);
  const matches = await lookupByYearMakeModel(parsed.year, picked.make, picked.model || picked.make);
  return { decoded, matches };
}

function titleCaseMake(make: string): string {
  if (make.toUpperCase() === "BMW" || make.toUpperCase() === "GMC" || make.toUpperCase() === "MINI") {
    return make.toUpperCase() === "MINI" ? "MINI" : make.toUpperCase();
  }
  return make
    .toLowerCase()
    .split(/[\s-]+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(make.includes("-") ? "-" : " ");
}

export function formatEpa(m: EpaMatch): string {
  const unit = m.powertrain === "ev" ? "MPGe" : "MPG";
  const mpg = `${m.city}/${m.hwy}/${m.comb} ${unit}`;
  if (m.powertrain === "ev") return mpg;
  if (m.tankGal != null) return `${mpg} · ${m.tankGal} gal`;
  return mpg;
}
