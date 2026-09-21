import type { Charge, Fill, Powertrain, ServiceCategory, ServiceJob } from "./types";

export const DUE_DISCLAIMER_SHORT =
  "Not the manufacturer’s maintenance schedule. These are unofficial estimates from this log — confirm in the owner’s manual.";

export const DUE_DISCLAIMER_FULL =
  "GarageBook due dates and service hints are unofficial estimates. They use generic intervals by powertrain (gas, hybrid, plug-in, EV) plus the odometer and shop jobs you log on this device. They are not Toyota’s, Tesla’s, Honda’s, or any other manufacturer’s recommended maintenance schedule, warranty requirement, or a substitute for the owner’s manual, a dealer, or a qualified technician. Severe use (towing, heat, dust, short trips) can come due sooner. Follow the vehicle maker’s instructions.";

export type RecStatus = "overdue" | "due" | "soon" | "ok";

export type Recommendation = {
  id: string;
  category: ServiceCategory;
  title: string;
  detail: string;
  hint: string;
  status: RecStatus;
  milesLeft: number | null;
  daysLeft: number | null;
  dueMiles: number | null;
  dueDate: string | null;
  lastDate: string | null;
  lastOdo: number | null;
  scheduled: boolean;
};

type Interval = {
  category: ServiceCategory;
  title: string;
  miles: number | null;
  months: number | null;
  hint: string;
};

const ICE: Interval[] = [
  { category: "oil", title: "Oil change", miles: 5000, months: 6, hint: "0W-20, 5k miles or 6 months" },
  { category: "rotation", title: "Tire rotation", miles: 7500, months: 6, hint: "Every 7,500 miles" },
  { category: "cabin-filter", title: "Cabin air filter", miles: 15000, months: 12, hint: "Dusty El Paso air clogs these fast" },
  { category: "air-filter", title: "Engine air filter", miles: 30000, months: 24, hint: "Inspect at 15k in desert dust" },
  { category: "brakes", title: "Brake inspection", miles: 15000, months: 12, hint: "Pads and rotors" },
  { category: "brake-fluid", title: "Brake fluid", miles: 30000, months: 36, hint: "Toyota 3-year flush" },
  { category: "transmission", title: "ATF service", miles: 100000, months: 60, hint: "Highlander WS fluid" },
  { category: "coolant", title: "Coolant", miles: 100000, months: 120, hint: "SLLC, 100k / 10 years" },
  { category: "spark-plugs", title: "Spark plugs", miles: 120000, months: null, hint: "Iridium, 120k" },
  { category: "inspection", title: "State inspection", miles: null, months: 12, hint: "Texas safety / emissions" },
];

const EV: Interval[] = [
  { category: "rotation", title: "Tire rotation", miles: 6250, months: 6, hint: "Model 3 eats rear tires" },
  { category: "cabin-filter", title: "Cabin filter", miles: 20000, months: 24, hint: "HEPA / carbon, 2 years" },
  { category: "brake-fluid", title: "Brake fluid", miles: null, months: 24, hint: "Tesla 2-year flush" },
  { category: "tires", title: "Tire wear check", miles: 25000, months: 12, hint: "Heavy EV, watch inner shoulders" },
  { category: "inspection", title: "Annual check", miles: null, months: 12, hint: "Coolant, brakes, alignment" },
];

const HYBRID: Interval[] = ICE.map((iv) => {
  if (iv.category === "oil") {
    return { ...iv, hint: "0W-16 / 0W-20 — 10k on many hybrids, 5k in desert heat or towing" };
  }
  if (iv.category === "coolant") {
    return { ...iv, hint: "Engine + inverter coolant" };
  }
  return iv;
});

export function intervalsFor(powertrain: Powertrain): Interval[] {
  if (powertrain === "ev") return EV;
  if (powertrain === "hybrid" || powertrain === "phev") return HYBRID;
  return ICE;
}

export function currentOdometer(fills: Fill[], jobs: ServiceJob[], charges: Charge[] = []): number | null {
  const nums = [
    ...fills.map((f) => f.odometer),
    ...jobs.map((j) => j.odometer),
    ...charges.map((c) => c.odometer),
  ].filter((n): n is number => n != null && Number.isFinite(n) && n > 0);
  return nums.length ? Math.max(...nums) : null;
}

function addMonths(iso: string, months: number): string {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T12:00:00`).getTime();
  const b = new Date(`${to}T12:00:00`).getTime();
  return Math.round((b - a) / 86400000);
}

function rank(status: RecStatus): number {
  if (status === "overdue") return 0;
  if (status === "due") return 1;
  if (status === "soon") return 2;
  return 3;
}

export function recommend(
  powertrain: Powertrain,
  fills: Fill[],
  jobs: ServiceJob[],
  today = new Date().toISOString().slice(0, 10),
  charges: Charge[] = [],
): Recommendation[] {
  const odo = currentOdometer(fills, jobs, charges);
  const intervals = intervalsFor(powertrain);
  const done = jobs.filter((j) => j.status === "done");
  const scheduled = jobs.filter((j) => j.status === "scheduled");

  const rows: Recommendation[] = intervals.map((iv) => {
    const last = [...done].reverse().find((j) => j.category === iv.category) ?? null;
    const plan = [...scheduled].reverse().find((j) => j.category === iv.category) ?? null;

    let dueMiles: number | null = null;
    let dueDate: string | null = null;
    if (plan?.dueMiles != null) dueMiles = plan.dueMiles;
    else if (last?.odometer != null && iv.miles != null) dueMiles = last.odometer + iv.miles;
    else if (odo != null && iv.miles != null && !last) dueMiles = iv.miles;

    if (plan?.dueDate) dueDate = plan.dueDate;
    else if (last?.date && iv.months != null) dueDate = addMonths(last.date, iv.months);
    else if (!last && iv.months != null) dueDate = today;

    const milesLeft = dueMiles != null && odo != null ? dueMiles - odo : null;
    const daysLeft = dueDate ? daysBetween(today, dueDate) : null;

    let status: RecStatus = "ok";
    if ((milesLeft != null && milesLeft < 0) || (daysLeft != null && daysLeft < 0)) status = "overdue";
    else if ((milesLeft != null && milesLeft <= 500) || (daysLeft != null && daysLeft <= 14)) status = "due";
    else if ((milesLeft != null && milesLeft <= 1500) || (daysLeft != null && daysLeft <= 45)) status = "soon";

    if (!last && !plan) {
      if (iv.miles != null && odo != null && odo >= iv.miles) status = "overdue";
      else if (iv.months != null) status = status === "ok" ? "due" : status;
    }

    const detailParts: string[] = [];
    if (!last) detailParts.push("Nothing in the log yet");
    else detailParts.push(`Last ${last.date}${last.odometer ? ` @ ${last.odometer.toLocaleString("en-US")} mi` : ""}`);
    if (milesLeft != null) {
      detailParts.push(milesLeft >= 0 ? `${milesLeft.toLocaleString("en-US")} mi left` : `${Math.abs(milesLeft).toLocaleString("en-US")} mi overdue`);
    }
    if (daysLeft != null) {
      detailParts.push(daysLeft >= 0 ? `${daysLeft} days` : `${Math.abs(daysLeft)} days overdue`);
    }

    return {
      id: iv.category,
      category: iv.category,
      title: iv.title,
      detail: detailParts.join(" · "),
      hint: iv.hint,
      status,
      milesLeft,
      daysLeft,
      dueMiles,
      dueDate,
      lastDate: last?.date ?? null,
      lastOdo: last?.odometer ?? null,
      scheduled: Boolean(plan),
    };
  });

  const extras = scheduled.filter((j) => !intervals.some((iv) => iv.category === j.category));
  for (const plan of extras) {
    const milesLeft = plan.dueMiles != null && odo != null ? plan.dueMiles - odo : null;
    const daysLeft = plan.dueDate ? daysBetween(today, plan.dueDate) : null;
    let status: RecStatus = "soon";
    if ((milesLeft != null && milesLeft < 0) || (daysLeft != null && daysLeft < 0)) status = "overdue";
    else if ((milesLeft != null && milesLeft <= 500) || (daysLeft != null && daysLeft <= 14)) status = "due";
    rows.push({
      id: plan.id,
      category: plan.category,
      title: plan.summary || plan.category,
      detail: [plan.shop, plan.dueDate, plan.dueMiles ? `${plan.dueMiles.toLocaleString("en-US")} mi` : ""]
        .filter(Boolean)
        .join(" · "),
      hint: "You scheduled this",
      status,
      milesLeft,
      daysLeft,
      dueMiles: plan.dueMiles,
      dueDate: plan.dueDate || null,
      lastDate: null,
      lastOdo: null,
      scheduled: true,
    });
  }

  return rows.sort((a, b) => rank(a.status) - rank(b.status) || (a.milesLeft ?? 9e9) - (b.milesLeft ?? 9e9));
}

export function upcoming(recs: Recommendation[]): Recommendation[] {
  return recs.filter((r) => r.status !== "ok");
}
