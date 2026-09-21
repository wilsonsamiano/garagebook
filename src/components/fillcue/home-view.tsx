import { Camera, Receipt, Wrench, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ClusterFace } from "@/components/fillcue/cluster-face";
import { DueList } from "@/components/fillcue/due-list";
import type { Recommendation } from "@/lib/fillcue/recommend";
import type { OwnershipSummary } from "@/lib/fillcue/ownership";
import { fmt, money, type FillStats } from "@/lib/fillcue/stats";
import { burnsFuel, plugsIn } from "@/lib/fillcue/types";
import type { TabId } from "@/store/fillcue-store";

export function HomeView({
  stats,
  recs,
  ownership,
  onTab,
  onPick,
  onShop,
  onSchedule,
  onExport,
}: {
  stats: FillStats;
  recs: Recommendation[];
  ownership: OwnershipSummary;
  onTab: (t: TabId) => void;
  onPick: (slot: "receipt" | "cluster" | "auto" | "shop" | "charge", file: File) => void;
  onShop: () => void;
  onSchedule: (rec: Recommendation) => void;
  onExport: () => void;
}) {
  const powertrain = stats.settings.powertrain;
  const ev = !burnsFuel(powertrain);
  const phev = plugsIn(powertrain) && burnsFuel(powertrain);
  const mpgLabel = stats.avgMpg != null ? fmt(stats.avgMpg, 2) : "Need 2nd fill";
  const mpgRows = stats.rows.filter((r) => r.mpg != null);
  const list = recs ?? [];
  const nextDue = list[0] ?? null;

  return (
    <div className="space-y-4">
      <ClusterFace stats={stats} nextDue={nextDue} />

      {ev ? (
        <div className="grid grid-cols-2 gap-2.5">
          <Kpi label="Charges" value={String(ownership.chargeCount)} />
          <Kpi label="kWh" value={fmt(ownership.kwh, 1)} />
          <Kpi label="Energy $" value={money(ownership.energySpend)} />
          <Kpi label="Shop $" value={money(ownership.shopSpend)} />
        </div>
      ) : phev ? (
        <div className="grid grid-cols-2 gap-2.5">
          <Kpi label="Fills" value={String(stats.rows.length)} />
          <Kpi label="Charges" value={String(ownership.chargeCount)} />
          <Kpi label="Fuel $" value={money(stats.spent)} />
          <Kpi label="Energy $" value={money(ownership.energySpend)} />
          <Kpi label="Avg MPG" value={mpgLabel} />
          <Kpi label="Shop $" value={money(ownership.shopSpend)} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          <Kpi label="Fills" value={String(stats.rows.length)} />
          <Kpi label="Gallons" value={fmt(stats.gallons, 3)} />
          <Kpi label="Fuel $" value={money(stats.spent)} />
          <Kpi label="Shop $" value={money(ownership.shopSpend)} />
          <Kpi label="Avg MPG" value={mpgLabel} />
          <Kpi label="Est. range" value={`${fmt(stats.rangeEst, 0)} mi`} />
        </div>
      )}

      <Card>
        <CardTitle>While owned</CardTitle>
        <CardDescription className="mb-3">
          {ownership.ownedSince
            ? `From ${ownership.ownedSince} through what’s in this log.`
            : "From the first log entry. Set owned-since and purchase odometer in Setup for a tighter number."}
        </CardDescription>
        <div className="grid grid-cols-2 gap-2.5">
          <Kpi label="Operating $" value={money(ownership.operatingTotal)} />
          <Kpi label="$ / mile" value={ownership.costPerMile != null ? money(ownership.costPerMile) : "—"} />
          <Kpi
            label="Miles"
            value={ownership.milesOwned != null ? ownership.milesOwned.toLocaleString("en-US") : "—"}
          />
          <Kpi
            label={ev ? "Energy + shop" : phev ? "Fuel + energy + shop" : "Fuel + shop"}
            value={`${ownership.fillCount + ownership.chargeCount + ownership.jobCount} logs`}
          />
        </div>
        <Button className="mt-3 w-full" onClick={onExport}>
          Download spreadsheet
        </Button>
      </Card>

      <DueList recs={list} onSchedule={onSchedule} limit={4} />

      {!ev && mpgRows.length > 0 ? (
        <Card>
          <CardTitle>MPG by tank</CardTitle>
          <div className="flex h-16 items-end gap-1.5">
            {mpgRows.slice(-8).map((r) => {
              const mpg = r.mpg ?? 0;
              const h = Math.max(8, Math.min(100, (mpg / 30) * 100));
              return (
                <div key={r.id} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-sm bg-navy"
                    style={{ height: `${h}%` }}
                    title={`${r.date}: ${fmt(mpg, 1)} mpg`}
                  />
                  <span className="text-xs tabular-nums text-muted-ink">{fmt(mpg, 0)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      {!ev && mpgRows.length === 0 ? (
        <Card>
          <CardTitle>MPG</CardTitle>
          <CardDescription>
            First fill is the baseline. Log a second full tank with odometer and MPG appears.
          </CardDescription>
        </Card>
      ) : null}

      <Card>
        <CardTitle>Capture</CardTitle>
        <CardDescription className="mb-3">
          Photos stay on this device as a small B&W scan. OCR is a draft — you own the save.
        </CardDescription>
        <div className="grid grid-cols-2 gap-2.5">
          {burnsFuel(powertrain) ? (
            <FileButton label="Fuel receipt" icon={<Receipt />} onFile={(f) => onPick("receipt", f)} />
          ) : null}
          {plugsIn(powertrain) ? (
            <FileButton label="Charge receipt" gold icon={<Zap />} onFile={(f) => onPick("charge", f)} />
          ) : null}
          {burnsFuel(powertrain) ? (
            <FileButton
              label="Cluster"
              gold={!plugsIn(powertrain)}
              icon={<Camera />}
              onFile={(f) => onPick("cluster", f)}
            />
          ) : null}
          <FileButton
            label="Shop receipt"
            icon={<Wrench />}
            onFile={(f) => onPick("shop", f)}
            className={burnsFuel(powertrain) && !plugsIn(powertrain) ? "col-span-2" : undefined}
          />
        </div>
        <Button variant="ghost" className="mt-2 w-full" onClick={() => onTab("capture")}>
          Enter by hand
        </Button>
        <Button variant="outline" className="w-full" onClick={onShop}>
          Schedule service
        </Button>
      </Card>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-card px-3.5 py-3 shadow-panel">
      <div className="text-xs tracking-[0.08em] text-muted-ink uppercase">{label}</div>
      <div className="font-display text-kpi font-semibold tabular-nums text-navy">{value}</div>
    </div>
  );
}

function FileButton({
  label,
  icon,
  gold,
  onFile,
  className,
}: {
  label: string;
  icon: ReactNode;
  gold?: boolean;
  onFile: (file: File) => void;
  className?: string;
}) {
  return (
    <label className={className}>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <span
        className={
          gold
            ? "inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-gold text-sm font-medium text-navy-deep"
            : "inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-navy text-sm font-medium text-cream"
        }
      >
        {icon}
        {label}
      </span>
    </label>
  );
}
