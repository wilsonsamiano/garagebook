import { DueList } from "@/components/fillcue/due-list";
import { ScanPeek } from "@/components/fillcue/scan-peek";
import { Segmented } from "@/components/fillcue/segmented";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { Recommendation } from "@/lib/fillcue/recommend";
import { fmt, money, type FillStats } from "@/lib/fillcue/stats";
import { SERVICE_CATEGORIES, burnsFuel, plugsIn, type Charge, type ServiceJob } from "@/lib/fillcue/types";
import { useFillcue, type LogFilter } from "@/store/fillcue-store";

const CATEGORY_LABEL = Object.fromEntries(SERVICE_CATEGORIES.map((c) => [c.id, c.label]));

export function LogView({
  stats,
  jobs,
  charges,
  recs,
  onOpenFill,
  onOpenJob,
  onOpenCharge,
  onSchedule,
}: {
  stats: FillStats;
  jobs: ServiceJob[];
  charges: Charge[];
  recs: Recommendation[];
  onOpenFill: (id: string) => void;
  onOpenJob: (id: string) => void;
  onOpenCharge: (id: string) => void;
  onSchedule: (rec: Recommendation) => void;
}) {
  const logFilter = useFillcue((s) => s.logFilter);
  const setLogFilter = useFillcue((s) => s.setLogFilter);
  const powertrain = stats.settings.powertrain;
  const logOptions = [
    ...(burnsFuel(powertrain) ? [{ id: "fuel" as const, label: "Fuel" }] : []),
    ...(plugsIn(powertrain) ? [{ id: "charge" as const, label: "Charge" }] : []),
    { id: "shop" as const, label: "Shop" },
    { id: "due" as const, label: "Due" },
  ];
  const filter: LogFilter = logOptions.some((o) => o.id === logFilter) ? logFilter : logOptions[0].id;
  const shopRows = [...jobs].sort((a, b) => `${b.date}${b.id}`.localeCompare(`${a.date}${a.id}`));
  const chargeRows = [...charges].sort((a, b) => `${b.date}${b.id}`.localeCompare(`${a.date}${a.id}`));

  return (
    <div className="space-y-4">
      <Segmented
        value={filter}
        onChange={setLogFilter}
        options={logOptions}
      />

      {filter === "fuel" ? <FuelLog stats={stats} onOpen={onOpenFill} /> : null}
      {filter === "charge" ? <ChargeLog charges={chargeRows} onOpen={onOpenCharge} /> : null}
      {filter === "shop" ? <ShopLog jobs={shopRows} onOpen={onOpenJob} /> : null}
      {filter === "due" ? <DueList recs={recs} onSchedule={onSchedule} /> : null}
    </div>
  );
}

function FuelLog({ stats, onOpen }: { stats: FillStats; onOpen: (id: string) => void }) {
  if (!stats.rows.length) {
    return (
      <Card>
        <CardTitle>Fuel log</CardTitle>
        <CardDescription>No fills yet. Capture a receipt or enter one by hand.</CardDescription>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <div className="px-4 pt-4">
        <CardTitle>Fuel log</CardTitle>
      </div>
      <ul>
        {[...stats.rows].reverse().map((r) => (
          <li key={r.id}>
            <div className="flex w-full items-center gap-3 border-t border-line px-4 py-3.5">
              {r.receiptScan || r.clusterScan ? (
                <ScanPeek src={r.receiptScan || r.clusterScan || ""} alt="Receipt scan" size="thumb" />
              ) : null}
              <button
                type="button"
                onClick={() => onOpen(r.id)}
                className="flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 text-left"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-navy">
                    {r.station || "Fill"} · {r.date || ""}
                  </div>
                  <div className="text-sm text-muted-ink">
                    {r.gallons ?? "—"} gal @ {r.pricePerGal != null ? money(r.pricePerGal, 3) : "—"} · {money(r.total)}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-display text-lg font-semibold tabular-nums text-navy">
                    {r.mpg ? fmt(r.mpg, 1) : "—"}
                  </div>
                  <div className="text-xs tracking-wide text-muted-ink uppercase">mpg</div>
                </div>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ChargeLog({ charges, onOpen }: { charges: Charge[]; onOpen: (id: string) => void }) {
  if (!charges.length) {
    return (
      <Card>
        <CardTitle>Charge log</CardTitle>
        <CardDescription>No charging sessions yet. Snap a Supercharger receipt or enter kWh by hand.</CardDescription>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <div className="px-4 pt-4">
        <CardTitle>Charge log</CardTitle>
      </div>
      <ul>
        {charges.map((c) => (
          <li key={c.id}>
            <div className="flex w-full items-center gap-3 border-t border-line px-4 py-3.5">
              {c.receiptScan ? <ScanPeek src={c.receiptScan} alt="Charge scan" size="thumb" /> : null}
              <button
                type="button"
                onClick={() => onOpen(c.id)}
                className="flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 text-left"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-navy">
                    {c.location || "Charge"} · {c.date || ""}
                  </div>
                  <div className="text-sm text-muted-ink">
                    {c.kwh ?? "—"} kWh{c.city ? ` · ${c.city}` : ""}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-display text-lg font-semibold tabular-nums text-navy">{money(c.total)}</div>
                  <div className="text-xs tracking-wide text-muted-ink uppercase">kWh</div>
                </div>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ShopLog({ jobs, onOpen }: { jobs: ServiceJob[]; onOpen: (id: string) => void }) {
  if (!jobs.length) {
    return (
      <Card>
        <CardTitle>Shop log</CardTitle>
        <CardDescription>No shop visits yet. Snap a receipt or schedule the next service.</CardDescription>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <div className="px-4 pt-4">
        <CardTitle>Shop log</CardTitle>
      </div>
      <ul>
        {jobs.map((j) => (
          <li key={j.id}>
            <div className="flex w-full items-center gap-3 border-t border-line px-4 py-3.5">
              {j.receiptScan ? <ScanPeek src={j.receiptScan} alt="Shop scan" size="thumb" /> : null}
              <button
                type="button"
                onClick={() => onOpen(j.id)}
                className="flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 text-left"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-navy">
                    {j.shop || j.summary || "Shop visit"} · {j.date || ""}
                  </div>
                  <div className="text-sm text-muted-ink">
                    {CATEGORY_LABEL[j.category] || j.category}
                    {j.odometer ? ` · ${j.odometer.toLocaleString("en-US")} mi` : ""}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-display text-lg font-semibold tabular-nums text-navy">{money(j.total)}</div>
                  <Badge
                    className={
                      j.status === "scheduled"
                        ? "mt-1 border-transparent bg-gold/30 text-navy-deep"
                        : "mt-1 border-transparent bg-ok-soft text-ok"
                    }
                  >
                    {j.status === "scheduled" ? "Scheduled" : "Done"}
                  </Badge>
                </div>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
