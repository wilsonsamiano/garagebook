import { fmt } from "@/lib/fillcue/stats";
import type { FillStats } from "@/lib/fillcue/stats";
import type { Recommendation } from "@/lib/fillcue/recommend";
import type { VehicleSettings } from "@/lib/fillcue/types";
import { vinTail } from "@/lib/fillcue/vin";

export function ClusterFace({
  stats,
  nextDue,
}: {
  stats: FillStats;
  nextDue: Recommendation | null;
}) {
  const ev = stats.settings.powertrain === "ev";
  const last = stats.last;
  const range = last?.clusterRange ?? stats.rangeEst;
  const odo = last?.odometer;
  const settings: VehicleSettings = stats.settings;
  const vinBit = settings.vin ? ` · ${vinTail(settings.vin)}` : "";

  if (ev) {
    const miles = nextDue?.milesLeft;
    const hasMiles = miles != null && Number.isFinite(miles);
    const headline = hasMiles
      ? fmt(Math.abs(miles), 0)
      : odo
        ? fmt(odo, 0)
        : nextDue
          ? nextDue.status === "overdue"
            ? "OVER"
            : "DUE"
          : "—";
    const unit = hasMiles ? (miles < 0 ? "MI OVER" : "MI") : odo ? "MI" : "";
    return (
      <section className="rounded-xl bg-cluster px-4 py-5 text-cream shadow-panel">
        <div className="flex items-center justify-between text-xs tracking-[0.12em] text-ice/80 uppercase">
          <span className="truncate">
            {settings.vehicle}
            {vinBit}
          </span>
          <span>EV</span>
        </div>
        <div className="py-3 text-center">
          <div className="text-xs tracking-[0.18em] text-ice/70 uppercase">
            {nextDue ? nextDue.title : "Odometer"}
          </div>
          <div className="font-display leading-none tabular-nums">
            <span className="text-cluster font-semibold tracking-tight">{headline}</span>
            {unit ? <span className="ml-1 align-super text-sm text-ice">{unit}</span> : null}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Pill label="Odo" value={odo ? Number(odo).toLocaleString("en-US") : "—"} />
          <Pill label="Next" value={nextDue?.status ?? "—"} />
          <Pill label="When" value={nextDue?.dueDate ? nextDue.dueDate.slice(5) : "—"} />
        </div>
      </section>
    );
  }

  const epa = `EPA ${settings.epaCity}/${settings.epaHwy}/${settings.epaComb}`;

  return (
    <section className="rounded-xl bg-cluster px-4 py-5 text-cream shadow-panel">
      <div className="flex items-center justify-between gap-2 text-xs tracking-[0.12em] text-ice/80 uppercase">
        <span className="truncate">
          {settings.vehicle}
          {vinBit}
        </span>
        <span className="shrink-0">{epa}</span>
      </div>
      <div className="py-3 text-center">
        <div className="text-xs tracking-[0.18em] text-ice/70 uppercase">Range</div>
        <div className="font-display leading-none tabular-nums">
          <span className="text-cluster font-semibold tracking-tight">{fmt(range, 0)}</span>
          <span className="ml-1 align-super text-sm text-ice">MI</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Pill label="Odo" value={odo ? Number(odo).toLocaleString("en-US") : "—"} />
        <Pill
          label="After reset"
          value={last?.clusterAvgMph != null ? `${last.clusterAvgMph} mph` : "—"}
        />
        <Pill label="Outside" value={last?.outsideF != null ? `${last.outsideF}°F` : "—"} />
      </div>
    </section>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-cluster-face px-2 py-2 text-center">
      <span className="block text-xs tracking-[0.12em] text-ice/70 uppercase">{label}</span>
      <span className="block text-sm font-medium tabular-nums text-cream">{value}</span>
    </div>
  );
}
