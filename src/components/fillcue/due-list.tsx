import { Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { Recommendation, RecStatus } from "@/lib/fillcue/recommend";
import { DUE_DISCLAIMER_SHORT } from "@/lib/fillcue/recommend";
import { cn } from "@/lib/utils";

const STATUS: Record<RecStatus, { label: string; className: string }> = {
  overdue: { label: "Overdue", className: "bg-danger-soft text-danger border-transparent" },
  due: { label: "Due", className: "bg-gold/30 text-navy-deep border-transparent" },
  soon: { label: "Soon", className: "bg-ice/20 text-navy border-transparent" },
  ok: { label: "On track", className: "bg-ok-soft text-ok border-transparent" },
};

export function DueList({
  recs,
  onSchedule,
  limit,
}: {
  recs: Recommendation[];
  onSchedule: (rec: Recommendation) => void;
  limit?: number;
}) {
  const rows = limit ? recs.slice(0, limit) : recs;
  if (!rows.length) {
    return (
      <Card>
        <CardTitle>What’s due</CardTitle>
        <CardDescription>
          Based on this vehicle’s odometer and shop log. {DUE_DISCLAIMER_SHORT}
        </CardDescription>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <div className="px-4 pt-4 pb-1">
        <CardTitle className="mb-1">What’s due</CardTitle>
        <CardDescription className="mb-2">
          Based on this vehicle’s odometer and shop log. {DUE_DISCLAIMER_SHORT}
        </CardDescription>
      </div>
      <ul>
        {rows.map((r) => {
          const st = STATUS[r.status];
          return (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onSchedule(r)}
                className="flex w-full items-start justify-between gap-3 border-t border-line px-4 py-3.5 text-left"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Wrench className="size-3.5 shrink-0 text-navy" />
                    <span className="font-medium text-navy">{r.title}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-ink">{r.detail}</p>
                  <p className="text-xs text-muted-ink">{r.hint}</p>
                </div>
                <Badge className={cn("shrink-0", st.className)}>{st.label}</Badge>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
