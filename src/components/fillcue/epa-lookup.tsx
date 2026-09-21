import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatEpa, lookupVehicle, type EpaMatch } from "@/lib/fillcue/epa";
import { isCompleteVin } from "@/lib/fillcue/vin";
import { cn } from "@/lib/utils";

export function EpaLookup({
  vin,
  name,
  autoVin,
  onApply,
}: {
  vin: string;
  name: string;
  autoVin?: boolean;
  onApply: (match: EpaMatch) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<EpaMatch[]>([]);
  const [picked, setPicked] = useState<string>("");
  const lastVin = useRef("");

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const result = await lookupVehicle({ vin, name });
      setMatches(result.matches);
      if (!result.matches.length) {
        setError("EPA has no ratings for that vehicle. Enter city and highway by hand.");
        return;
      }
      if (result.matches.length === 1) {
        const only = result.matches[0];
        setPicked(only.id);
        onApply(only);
        toast.success(`EPA ${formatEpa(only)}`);
      }
    } catch (err) {
      setMatches([]);
      setError(err instanceof Error ? err.message : "EPA lookup failed.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!autoVin) return;
    if (!isCompleteVin(vin)) return;
    if (lastVin.current === vin) return;
    lastVin.current = vin;
    void run();
    // VIN complete is the trigger; name is only a fallback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoVin, vin]);

  const canRun = isCompleteVin(vin) || /^\s*(?:19|20)\d{2}\s+\S+/.test(name);

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" className="w-full" disabled={busy || !canRun} onClick={() => void run()}>
        {busy ? "Looking up EPA…" : "Look up EPA city / hwy"}
      </Button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
      {matches.length > 1 ? (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-ink">Pick the trim that matches your car.</p>
          {matches.map((m) => {
            const active = picked === m.id;
            return (
              <button
                key={m.id}
                type="button"
                className={cn(
                  "flex min-h-11 w-full flex-col items-start rounded-md border px-3 py-2 text-left",
                  active ? "border-navy bg-navy text-cream" : "border-line bg-card text-ink",
                )}
                onClick={() => {
                  setPicked(m.id);
                  onApply(m);
                  toast.success(`EPA ${formatEpa(m)}`);
                }}
              >
                <span className="text-sm font-medium">{m.name}</span>
                <span className={cn("text-xs", active ? "text-ice" : "text-muted-ink")}>
                  {m.option ? `${m.option} · ` : ""}
                  {formatEpa(m)}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
      {matches.length === 1 && picked ? (
        <p className="text-xs text-ok">
          {matches[0].name} · {formatEpa(matches[0])}
        </p>
      ) : null}
      <p className="text-xs text-muted-ink">
        EPA city/hwy from FuelEconomy.gov. Tank size is the manufacturer figure (not EPA). Usable is ~96% of that — the pump clicks off early.
      </p>
    </div>
  );
}
