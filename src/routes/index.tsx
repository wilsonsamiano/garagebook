import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";
import { BrandMark } from "@/components/fillcue/brand-mark";
import { CaptureView } from "@/components/fillcue/capture-view";
import { HomeView } from "@/components/fillcue/home-view";
import { LogView } from "@/components/fillcue/log-view";
import { SettingsView } from "@/components/fillcue/settings-view";
import { TabBar } from "@/components/fillcue/tab-bar";
import { VehicleSwitcher } from "@/components/fillcue/vehicle-switcher";
import { Button } from "@/components/ui/button";
import type { Recommendation } from "@/lib/fillcue/recommend";
import { recommend } from "@/lib/fillcue/recommend";
import { summarizeOwnership } from "@/lib/fillcue/ownership";
import { enrich } from "@/lib/fillcue/stats";
import { burnsFuel, plugsIn } from "@/lib/fillcue/types";
import { useFillcue, type TabId } from "@/store/fillcue-store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const hydrate = useFillcue((s) => s.hydrate);
  const ready = useFillcue((s) => s.ready);
  const error = useFillcue((s) => s.error);
  const fills = useFillcue((s) => s.fills);
  const jobs = useFillcue((s) => s.jobs);
  const charges = useFillcue((s) => s.charges);
  const settings = useFillcue((s) => s.settings);
  const resetDraft = useFillcue((s) => s.resetDraft);
  const resetServiceDraft = useFillcue((s) => s.resetServiceDraft);
  const resetChargeDraft = useFillcue((s) => s.resetChargeDraft);
  const openFill = useFillcue((s) => s.openFill);
  const openJob = useFillcue((s) => s.openJob);
  const openCharge = useFillcue((s) => s.openCharge);
  const scheduleFrom = useFillcue((s) => s.scheduleFrom);
  const handlePhoto = useFillcue((s) => s.handlePhoto);
  const exportSpreadsheet = useFillcue((s) => s.exportSpreadsheet);
  const [tab, setTab] = useState<TabId>("home");

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const activeId = settings.activeVehicleId || "highlander";
  const activeFills = useMemo(
    () => fills.filter((f) => (f.vehicleId || "highlander") === activeId),
    [fills, activeId],
  );
  const activeJobs = useMemo(
    () => jobs.filter((j) => (j.vehicleId || "highlander") === activeId),
    [jobs, activeId],
  );
  const activeCharges = useMemo(
    () => charges.filter((c) => (c.vehicleId || "tesla") === activeId),
    [charges, activeId],
  );
  const snapshot = ready ? enrich(activeFills, settings) : null;
  const recs = ready ? recommend(settings.powertrain, activeFills, activeJobs, undefined, activeCharges) : [];
  const ownership = ready ? summarizeOwnership(settings, activeFills, activeJobs, activeCharges) : null;

  function goCaptureNew() {
    if (plugsIn(settings.powertrain) && !burnsFuel(settings.powertrain)) resetChargeDraft();
    else resetDraft();
    setTab("capture");
  }

  function goShop() {
    resetServiceDraft();
    setTab("capture");
  }

  function onSchedule(rec: Recommendation) {
    scheduleFrom({
      category: rec.category,
      summary: rec.title,
      status: "scheduled",
      dueDate: rec.dueDate || "",
      dueMiles: rec.dueMiles != null ? String(rec.dueMiles) : "",
    });
    setTab("capture");
  }

  async function onPick(slot: "receipt" | "cluster" | "auto" | "shop" | "charge", file: File) {
    setTab("capture");
    try {
      await handlePhoto(file, slot);
    } catch {
      /* capture view shows the OCR status */
    }
  }

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="sticky top-0 z-20 flex items-center justify-between bg-linear-to-b from-navy-deep to-navy px-4 py-3 text-cream">
        <div className="flex items-center gap-2.5">
          <BrandMark className="size-9 text-gold" />
          <div>
            <h1 className="font-display text-lg leading-tight font-semibold">GarageBook</h1>
            <VehicleSwitcher />
          </div>
        </div>
        <Button
          type="button"
          variant="cream"
          size="sm"
          className="h-10 border border-cream/35 bg-transparent text-cream hover:bg-cream/10"
          onClick={goCaptureNew}
        >
          <Plus className="size-4" />
          Add
        </Button>
      </header>

      <main className="mx-auto max-w-xl px-4 pt-4 pb-28">
        {!ready ? (
          <div className="space-y-3">
            <div className="h-48 animate-pulse rounded-xl bg-cluster/90" />
            <div className="grid grid-cols-2 gap-2.5">
              <div className="h-20 animate-pulse rounded-xl bg-card" />
              <div className="h-20 animate-pulse rounded-xl bg-card" />
            </div>
          </div>
        ) : error ? (
          <p className="rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">{error}</p>
        ) : (
          <>
            {tab === "home" && snapshot && ownership ? (
              <HomeView
                stats={snapshot}
                recs={recs}
                ownership={ownership}
                onTab={setTab}
                onPick={onPick}
                onShop={goShop}
                onSchedule={onSchedule}
                onExport={exportSpreadsheet}
              />
            ) : null}
            {tab === "capture" ? <CaptureView onTab={setTab} /> : null}
            {tab === "log" && snapshot ? (
              <LogView
                stats={snapshot}
                jobs={activeJobs}
                charges={activeCharges}
                recs={recs}
                onOpenFill={(id) => {
                  openFill(id);
                  setTab("capture");
                }}
                onOpenJob={(id) => {
                  openJob(id);
                  setTab("capture");
                }}
                onOpenCharge={(id) => {
                  openCharge(id);
                  setTab("capture");
                }}
                onSchedule={onSchedule}
              />
            ) : null}
            {tab === "settings" ? <SettingsView /> : null}
          </>
        )}
      </main>

      <TabBar tab={tab} onChange={setTab} />
      <Toaster position="top-center" richColors />
    </div>
  );
}
