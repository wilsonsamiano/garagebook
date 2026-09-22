import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EpaLookup } from "@/components/fillcue/epa-lookup";
import { InstallCard } from "@/components/fillcue/install-card";
import { Segmented } from "@/components/fillcue/segmented";
import { SupportLinks } from "@/components/fillcue/support-links";
import { DUE_DISCLAIMER_FULL } from "@/lib/fillcue/recommend";
import {
  POWERTRAIN_OPTIONS,
  VEHICLE_PRESETS,
  burnsFuel,
  powertrainLabel,
  type Powertrain,
  type VehicleSettings,
} from "@/lib/fillcue/types";
import { isCompleteVin, normalizeVin, vinHint, vinTail } from "@/lib/fillcue/vin";
import { cn } from "@/lib/utils";
import { useFillcue } from "@/store/fillcue-store";

export function SettingsView() {
  const settings = useFillcue((s) => s.settings);
  const vehicles = useFillcue((s) => s.vehicles);
  const saveSettings = useFillcue((s) => s.saveSettings);
  const selectVehicle = useFillcue((s) => s.selectVehicle);
  const addVehicle = useFillcue((s) => s.addVehicle);
  const removeVehicle = useFillcue((s) => s.removeVehicle);
  const exportJson = useFillcue((s) => s.exportJson);
  const exportSpreadsheet = useFillcue((s) => s.exportSpreadsheet);
  const importJson = useFillcue((s) => s.importJson);
  const [form, setForm] = useState<VehicleSettings>(settings);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPower, setNewPower] = useState<Powertrain>("ice");
  const [newVin, setNewVin] = useState("");
  const [fromPreset, setFromPreset] = useState<string>("");
  const [epaDraft, setEpaDraft] = useState<{
    epaCity: number;
    epaHwy: number;
    epaComb: number;
    tankGal: number | null;
    usableGal: number | null;
  } | null>(null);
  const ev = !burnsFuel(form.powertrain);
  const hint = vinHint(form.vin);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  function patch<K extends keyof VehicleSettings>(key: K, value: VehicleSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>Garage</CardTitle>
        <CardDescription className="mb-3">
          Each vehicle keeps its own fuel, charge, and shop log. VIN is optional.
        </CardDescription>
        <div className="space-y-2">
          {vehicles.map((v) => {
            const active = settings.activeVehicleId === v.id;
            return (
              <button
                key={v.id}
                type="button"
                className={cn(
                  "flex min-h-11 w-full flex-col items-start rounded-md border px-3 py-2 text-left",
                  active ? "border-navy bg-navy text-cream" : "border-line bg-card text-ink",
                )}
                onClick={() => void selectVehicle(v.id)}
              >
                <span className="text-sm font-medium">{v.name}</span>
                <span className={cn("text-xs", active ? "text-ice" : "text-muted-ink")}>
                  {powertrainLabel(v.powertrain)}
                  {v.vin ? ` · VIN …${vinTail(v.vin)}` : " · no VIN"}
                </span>
              </button>
            );
          })}
        </div>
        {adding ? (
          <form
            className="mt-3 space-y-2.5 rounded-md border border-line bg-paper p-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const preset = VEHICLE_PRESETS.find((p) => p.id === fromPreset);
              const record = await addVehicle({
                name: newName.trim() || preset?.name || "New vehicle",
                powertrain: preset?.powertrain || newPower,
                vin: normalizeVin(newVin),
                fromPresetId: fromPreset || undefined,
                epaCity: epaDraft?.epaCity,
                epaHwy: epaDraft?.epaHwy,
                epaComb: epaDraft?.epaComb,
                tankGal:
                  epaDraft?.tankGal ?? ((preset?.powertrain || newPower) === "ev" ? 0 : undefined),
                usableGal:
                  epaDraft?.usableGal ?? ((preset?.powertrain || newPower) === "ev" ? 0 : undefined),
              });
              toast.success(`Added ${record.name}`);
              setAdding(false);
              setNewName("");
              setNewVin("");
              setFromPreset("");
              setNewPower("ice");
              setEpaDraft(null);
            }}
          >
            <p className="text-sm font-medium text-navy">Add vehicle</p>
            <label className="flex flex-col gap-1">
              <Label>Name</Label>
              <Input
                value={newName}
                placeholder="2012 Honda Civic"
                onChange={(e) => setNewName(e.target.value)}
              />
            </label>
            <Segmented
              value={fromPreset === "tesla" ? "ev" : fromPreset === "highlander" ? "ice" : newPower}
              onChange={(v) => {
                setFromPreset("");
                setNewPower(v);
              }}
              options={POWERTRAIN_OPTIONS}
            />
            <label className="flex flex-col gap-1">
              <Label>VIN (optional)</Label>
              <Input
                value={newVin}
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="17 characters"
                onChange={(e) => setNewVin(normalizeVin(e.target.value))}
              />
            </label>
            <EpaLookup
              vin={newVin}
              name={newName}
              autoVin
              onApply={(m) => {
                setFromPreset("");
                setNewPower(m.powertrain);
                if (!newName.trim()) setNewName(m.name);
                setEpaDraft({
                  epaCity: m.city,
                  epaHwy: m.hwy,
                  epaComb: m.comb,
                  tankGal: m.tankGal,
                  usableGal: m.usableGal,
                });
              }}
            />
            {epaDraft ? (
              <p className="text-xs text-ok">
                Will save EPA {epaDraft.epaCity}/{epaDraft.epaHwy}/{epaDraft.epaComb}
                {newPower === "ev" ? " MPGe" : " MPG"}
                {epaDraft.tankGal != null && newPower !== "ev"
                  ? ` · tank ${epaDraft.tankGal} gal (usable ${epaDraft.usableGal})`
                  : ""}
              </p>
            ) : null}
            <div className="grid grid-cols-2 gap-2">
              {VEHICLE_PRESETS.map((p) => (
                <Button
                  key={p.id}
                  type="button"
                  variant={fromPreset === p.id ? "default" : "outline"}
                  className="h-auto min-h-11 whitespace-normal py-2 text-left"
                  onClick={() => {
                    setFromPreset(p.id);
                    setNewPower(p.powertrain);
                    if (!newName.trim()) setNewName(p.name);
                  }}
                >
                  Copy {p.id === "highlander" ? "Highlander" : "Model 3"}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button type="submit">Add to garage</Button>
            </div>
          </form>
        ) : (
          <Button type="button" variant="outline" className="mt-3 w-full" onClick={() => setAdding(true)}>
            Add vehicle
          </Button>
        )}
      </Card>

      <Card>
        <CardTitle>This vehicle</CardTitle>
        <CardDescription className="mb-3">Name, VIN, tank, and the dates used for lifetime cost.</CardDescription>
        <form
          className="grid grid-cols-2 gap-2.5 [&>*]:min-w-0"
          onSubmit={async (e) => {
            e.preventDefault();
            await saveSettings(form);
            toast.success("Vehicle saved on this device");
          }}
        >
          <label className="col-span-2 flex flex-col gap-1">
            <Label>Name</Label>
            <Input required value={form.vehicle} onChange={(e) => patch("vehicle", e.target.value)} />
          </label>
          <div className="col-span-2">
            <Segmented
              value={form.powertrain}
              onChange={(v) => patch("powertrain", v)}
              options={POWERTRAIN_OPTIONS}
            />
          </div>
          <label className="col-span-2 flex flex-col gap-1">
            <Label>VIN (optional)</Label>
            <Input
              value={form.vin}
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="17 characters, no I O Q"
              onChange={(e) => patch("vin", normalizeVin(e.target.value))}
            />
            <span className={cn("text-xs", isCompleteVin(form.vin) ? "text-ok" : "text-muted-ink")}>
              {form.vin
                ? isCompleteVin(form.vin)
                  ? "Looks like a complete VIN"
                  : hint
                : "Leave blank if you don’t have it yet"}
            </span>
          </label>
          <div className="col-span-2">
            <EpaLookup
              key={settings.activeVehicleId}
              vin={form.vin}
              name={form.vehicle}
              onApply={(m) => {
                setForm((f) => ({
                  ...f,
                  vehicle: f.vehicle.trim() ? f.vehicle : m.name,
                  powertrain: m.powertrain,
                  epaCity: m.city,
                  epaHwy: m.hwy,
                  epaComb: m.comb,
                  tankGal: m.tankGal ?? (m.powertrain === "ev" ? 0 : f.tankGal),
                  usableGal: m.usableGal ?? (m.powertrain === "ev" ? 0 : f.usableGal),
                }));
              }}
            />
          </div>
          {!ev ? (
            <>
              <NumField label="Tank (gal)" value={form.tankGal} onChange={(n) => patch("tankGal", n)} />
              <NumField label="Usable tank" value={form.usableGal} onChange={(n) => patch("usableGal", n)} />
              <NumField label="EPA city" value={form.epaCity} onChange={(n) => patch("epaCity", n)} />
              <NumField label="EPA hwy" value={form.epaHwy} onChange={(n) => patch("epaHwy", n)} />
              <NumField label="EPA combined" value={form.epaComb} onChange={(n) => patch("epaComb", n)} className="col-span-2" />
            </>
          ) : (
            <p className="col-span-2 text-sm text-muted-ink">
              EV has no tank or MPG. Log Supercharger and home charging for kWh, and shop visits for tires and brakes.
            </p>
          )}
          <label className="col-span-2 flex min-w-0 flex-col gap-1">
            <Label>Owned since</Label>
            <Input type="date" value={form.ownedSince} onChange={(e) => patch("ownedSince", e.target.value)} />
          </label>
          <label className="col-span-2 flex min-w-0 flex-col gap-1">
            <Label>Odo at purchase</Label>
            <Input
              inputMode="numeric"
              value={form.purchaseOdo == null ? "" : String(form.purchaseOdo)}
              onChange={(e) => patch("purchaseOdo", e.target.value === "" ? null : Number(e.target.value))}
            />
          </label>
          <Button type="submit" className="col-span-2">
            Save vehicle
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="col-span-2"
            disabled={vehicles.length <= 1}
            onClick={async () => {
              if (
                !window.confirm(
                  "Remove this vehicle from the garage? Fuel, charge, and shop logs stay on this device.",
                )
              ) {
                return;
              }
              try {
                await removeVehicle(settings.activeVehicleId);
                toast.success("Removed from garage. Logs stay on this device.");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not remove");
              }
            }}
          >
            Remove from garage
          </Button>
        </form>
      </Card>

      <InstallCard />

      <Card>
        <CardTitle>Ownership spreadsheet</CardTitle>
        <CardDescription className="mb-3">
          Excel workbook for the active vehicle: lifetime fuel or kWh, shop spend, and cost per mile.
        </CardDescription>
        <div className="grid grid-cols-2 gap-2.5">
          <Button type="button" className="col-span-2" onClick={exportSpreadsheet}>
            Download spreadsheet
          </Button>
          <Button type="button" variant="outline" onClick={exportJson}>
            Export JSON
          </Button>
          <label>
            <input
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                try {
                  const n = await importJson(file);
                  toast.success(`Imported ${n} record${n === 1 ? "" : "s"}`);
                } catch {
                  toast.error("That file is not a GarageBook backup");
                }
              }}
            />
            <span className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-md bg-gold text-sm font-medium text-navy-deep">
              Import JSON
            </span>
          </label>
        </div>
      </Card>

      <Card>
        <CardTitle>Maintenance estimates</CardTitle>
        <CardDescription>{DUE_DISCLAIMER_FULL}</CardDescription>
      </Card>

      <Card>
        <CardTitle>Privacy</CardTitle>
        <CardDescription>
          Photos are read on this device. A small black-and-white scan is saved with the log so you can
          check the original later. Nothing is uploaded. There is no account. Tesseract.js loads once from
          a CDN, then the engine can run offline.
        </CardDescription>
      </Card>

      <SupportLinks />
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  className?: string;
}) {
  return (
    <label className={`flex min-w-0 flex-col gap-1 ${className ?? ""}`}>
      <Label>{label}</Label>
      <Input
        type="number"
        step="0.1"
        value={Number.isFinite(value) ? value.toFixed(1) : ""}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
