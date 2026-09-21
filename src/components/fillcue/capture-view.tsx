import { Camera, Receipt, Wrench, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Segmented } from "@/components/fillcue/segmented";
import { ScanTile } from "@/components/fillcue/scan-peek";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  CHARGE_LOCATIONS,
  FILL_TO_FULL,
  GRADES,
  SAMPLE_CHARGE,
  SAMPLE_CLUSTER,
  SAMPLE_RECEIPT,
  SAMPLE_SHOP,
  SERVICE_CATEGORIES,
  TRIP_TYPES,
  captureModesFor,
  coerceCaptureMode,
  type ChargeLocation,
  type CaptureMode,
  type ServiceCategory,
  type ServiceStatus,
} from "@/lib/fillcue/types";
import { useFillcue, type TabId } from "@/store/fillcue-store";

export function CaptureView({ onTab }: { onTab: (t: TabId) => void }) {
  const captureMode = useFillcue((s) => s.captureMode);
  const setCaptureMode = useFillcue((s) => s.setCaptureMode);
  const powertrain = useFillcue((s) => s.settings.powertrain);
  const mode = coerceCaptureMode(powertrain, captureMode);
  const modes = captureModesFor(powertrain);

  return (
    <div className="space-y-4">
      <Segmented
        value={mode}
        onChange={setCaptureMode}
        options={modes}
      />
      {mode === "shop" ? (
        <ShopForm onTab={onTab} />
      ) : mode === "charge" ? (
        <ChargeForm onTab={onTab} />
      ) : (
        <FuelForm onTab={onTab} />
      )}
    </div>
  );
}


function FuelForm({ onTab }: { onTab: (t: TabId) => void }) {
  const draft = useFillcue((s) => s.draft);
  const setDraft = useFillcue((s) => s.setDraft);
  const receipt = useFillcue((s) => s.receipt);
  const cluster = useFillcue((s) => s.cluster);
  const ocrProgress = useFillcue((s) => s.ocrProgress);
  const ocrStatus = useFillcue((s) => s.ocrStatus);
  const ocrBusy = useFillcue((s) => s.ocrBusy);
  const handlePhoto = useFillcue((s) => s.handlePhoto);
  const applyOcrText = useFillcue((s) => s.applyOcrText);
  const saveDraft = useFillcue((s) => s.saveDraft);
  const resetDraft = useFillcue((s) => s.resetDraft);
  const removeFill = useFillcue((s) => s.removeFill);

  async function onPick(slot: "receipt" | "cluster" | "auto", file: File) {
    try {
      await handlePhoto(file, slot);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read that photo");
    }
  }

  async function onSave() {
    try {
      await saveDraft();
      toast.success("Fill saved on this device");
      onTab("home");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    }
  }

  return (
    <>
      <Card>
        <CardTitle>Review before save</CardTitle>
        <CardDescription className="mb-3">
          OCR is a draft. Check gallons, price, and odometer. Photos are stored as a small B&W scan on this device.
        </CardDescription>
        <div className="grid grid-cols-2 gap-2">
          <ScanTile src={receipt.preview} caption="Receipt" />
          <ScanTile src={cluster.preview} caption="Cluster" />
        </div>
        <Progress value={ocrProgress} className="mt-3" />
        <p className="mt-2 text-sm text-muted-ink">{ocrBusy ? "Working…" : ocrStatus}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <FileChip label="Receipt" onFile={(f) => onPick("receipt", f)} icon={<Receipt className="size-4" />} />
          <FileChip label="Cluster" gold onFile={(f) => onPick("cluster", f)} icon={<Camera className="size-4" />} />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => applyOcrText(SAMPLE_RECEIPT, "receipt")}>
            Sample receipt
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => applyOcrText(SAMPLE_CLUSTER, "cluster")}>
            Sample cluster
          </Button>
        </div>
      </Card>

      <Card>
        <form
          className="grid grid-cols-2 gap-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            void onSave();
          }}
        >
          <Field label="Date">
            <Input type="date" required value={draft.date} onChange={(e) => setDraft({ date: e.target.value })} />
          </Field>
          <Field label="Time">
            <Input type="time" value={draft.time} onChange={(e) => setDraft({ time: e.target.value })} />
          </Field>
          <Field label="Station">
            <Input value={draft.station} onChange={(e) => setDraft({ station: e.target.value })} />
          </Field>
          <Field label="City / State">
            <Input value={draft.city} onChange={(e) => setDraft({ city: e.target.value })} />
          </Field>
          <Field label="Pump">
            <Input inputMode="numeric" value={draft.pump} onChange={(e) => setDraft({ pump: e.target.value })} />
          </Field>
          <Field label="Grade">
            <NativeSelect value={draft.grade} onChange={(v) => setDraft({ grade: v })} options={GRADES} />
          </Field>
          <Field label="Gallons">
            <Input inputMode="decimal" value={draft.gallons} onChange={(e) => setDraft({ gallons: e.target.value })} />
          </Field>
          <Field label="Price / gal">
            <Input
              inputMode="decimal"
              value={draft.pricePerGal}
              onChange={(e) => setDraft({ pricePerGal: e.target.value })}
            />
          </Field>
          <Field label="Total $">
            <Input inputMode="decimal" value={draft.total} onChange={(e) => setDraft({ total: e.target.value })} />
          </Field>
          <Field label="Odometer">
            <Input inputMode="numeric" value={draft.odometer} onChange={(e) => setDraft({ odometer: e.target.value })} />
          </Field>
          <Field label="Cluster range">
            <Input
              inputMode="numeric"
              value={draft.clusterRange}
              onChange={(e) => setDraft({ clusterRange: e.target.value })}
            />
          </Field>
          <Field label="After reset mph">
            <Input
              inputMode="numeric"
              value={draft.clusterAvgMph}
              onChange={(e) => setDraft({ clusterAvgMph: e.target.value })}
            />
          </Field>
          <Field label="Outside F">
            <Input inputMode="numeric" value={draft.outsideF} onChange={(e) => setDraft({ outsideF: e.target.value })} />
          </Field>
          <Field label="Fill to full?">
            <NativeSelect
              value={draft.fillToFull}
              onChange={(v) => setDraft({ fillToFull: v as typeof draft.fillToFull })}
              options={FILL_TO_FULL}
            />
          </Field>
          <Field label="Trip type" className="col-span-2">
            <NativeSelect
              value={draft.tripType}
              onChange={(v) => setDraft({ tripType: v as typeof draft.tripType })}
              options={TRIP_TYPES}
            />
          </Field>
          <Field label="Notes" className="col-span-2">
            <Textarea value={draft.notes} onChange={(e) => setDraft({ notes: e.target.value })} />
          </Field>
          <div className="col-span-2 grid gap-2">
            <Button type="submit" disabled={ocrBusy}>
              Save fill
            </Button>
            <Button type="button" variant="outline" onClick={resetDraft}>
              Reset form
            </Button>
            {draft.id ? (
              <DeleteDialog
                title="Delete this fill?"
                onConfirm={async () => {
                  await removeFill(draft.id);
                  toast.success("Fill deleted");
                  onTab("log");
                }}
              />
            ) : null}
          </div>
        </form>
      </Card>

      {(receipt.text || cluster.text) && (
        <Card>
          <CardTitle>Raw OCR</CardTitle>
          {receipt.text ? <pre className="ocr-box mb-2">{receipt.text.trim()}</pre> : null}
          {cluster.text ? <pre className="ocr-box">{cluster.text.trim()}</pre> : null}
        </Card>
      )}
    </>
  );
}

function ShopForm({ onTab }: { onTab: (t: TabId) => void }) {
  const draft = useFillcue((s) => s.serviceDraft);
  const setDraft = useFillcue((s) => s.setServiceDraft);
  const receipt = useFillcue((s) => s.receipt);
  const shopPreview = useFillcue((s) => s.shopPreview);
  const ocrProgress = useFillcue((s) => s.ocrProgress);
  const ocrStatus = useFillcue((s) => s.ocrStatus);
  const ocrBusy = useFillcue((s) => s.ocrBusy);
  const handlePhoto = useFillcue((s) => s.handlePhoto);
  const applyOcrText = useFillcue((s) => s.applyOcrText);
  const saveServiceDraft = useFillcue((s) => s.saveServiceDraft);
  const resetServiceDraft = useFillcue((s) => s.resetServiceDraft);
  const removeJob = useFillcue((s) => s.removeJob);
  const preview = shopPreview || receipt.preview;

  async function onPick(file: File) {
    try {
      await handlePhoto(file, "shop");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read that photo");
    }
  }

  async function onSave() {
    try {
      await saveServiceDraft();
      toast.success(draft.status === "scheduled" ? "Service scheduled" : "Shop visit saved on this device");
      onTab("home");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    }
  }

  return (
    <>
      <Card>
        <CardTitle>Shop receipt</CardTitle>
        <CardDescription className="mb-3">
          Snap the invoice. OCR drafts shop, miles, total, and the work done. A B&W scan is kept with the log.
        </CardDescription>
        <ScanTile src={preview} caption="Shop receipt" />
        <Progress value={ocrProgress} className="mt-3" />
        <p className="mt-2 text-sm text-muted-ink">{ocrBusy ? "Working…" : ocrStatus}</p>
        <div className="mt-3">
          <FileChip label="Shop receipt" gold onFile={onPick} icon={<Wrench className="size-4" />} />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => applyOcrText(SAMPLE_SHOP, "shop")}>
            Sample shop
          </Button>
        </div>
      </Card>

      <Card>
        <form
          className="grid grid-cols-2 gap-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            void onSave();
          }}
        >
          <Field label="Date">
            <Input type="date" required value={draft.date} onChange={(e) => setDraft({ date: e.target.value })} />
          </Field>
          <Field label="Status">
            <NativeSelect
              value={draft.status}
              onChange={(v) => setDraft({ status: v as ServiceStatus })}
              options={[
                { id: "done", label: "Done" },
                { id: "scheduled", label: "Scheduled" },
              ]}
            />
          </Field>
          <Field label="Shop">
            <Input value={draft.shop} onChange={(e) => setDraft({ shop: e.target.value })} />
          </Field>
          <Field label="City / State">
            <Input value={draft.city} onChange={(e) => setDraft({ city: e.target.value })} />
          </Field>
          <Field label="Odometer">
            <Input inputMode="numeric" value={draft.odometer} onChange={(e) => setDraft({ odometer: e.target.value })} />
          </Field>
          <Field label="Total $">
            <Input inputMode="decimal" value={draft.total} onChange={(e) => setDraft({ total: e.target.value })} />
          </Field>
          <Field label="Category" className="col-span-2">
            <NativeSelect
              value={draft.category}
              onChange={(v) => setDraft({ category: v as ServiceCategory })}
              options={SERVICE_CATEGORIES}
            />
          </Field>
          <Field label="What was done" className="col-span-2">
            <Input value={draft.summary} onChange={(e) => setDraft({ summary: e.target.value })} />
          </Field>
          <Field label="Due date">
            <Input type="date" value={draft.dueDate} onChange={(e) => setDraft({ dueDate: e.target.value })} />
          </Field>
          <Field label="Due miles">
            <Input inputMode="numeric" value={draft.dueMiles} onChange={(e) => setDraft({ dueMiles: e.target.value })} />
          </Field>
          <Field label="Notes" className="col-span-2">
            <Textarea value={draft.notes} onChange={(e) => setDraft({ notes: e.target.value })} />
          </Field>
          <div className="col-span-2 grid gap-2">
            <Button type="submit" disabled={ocrBusy}>
              {draft.status === "scheduled" ? "Save schedule" : "Save shop visit"}
            </Button>
            <Button type="button" variant="outline" onClick={resetServiceDraft}>
              Reset form
            </Button>
            {draft.id ? (
              <DeleteDialog
                title="Delete this shop visit?"
                onConfirm={async () => {
                  await removeJob(draft.id);
                  toast.success("Shop visit deleted");
                  onTab("log");
                }}
              />
            ) : null}
          </div>
        </form>
      </Card>

      {receipt.text ? (
        <Card>
          <CardTitle>Raw OCR</CardTitle>
          <pre className="ocr-box">{receipt.text.trim()}</pre>
        </Card>
      ) : null}
    </>
  );
}

function ChargeForm({ onTab }: { onTab: (t: TabId) => void }) {
  const draft = useFillcue((s) => s.chargeDraft);
  const setDraft = useFillcue((s) => s.setChargeDraft);
  const receipt = useFillcue((s) => s.receipt);
  const shopPreview = useFillcue((s) => s.shopPreview);
  const ocrProgress = useFillcue((s) => s.ocrProgress);
  const ocrStatus = useFillcue((s) => s.ocrStatus);
  const ocrBusy = useFillcue((s) => s.ocrBusy);
  const handlePhoto = useFillcue((s) => s.handlePhoto);
  const applyOcrText = useFillcue((s) => s.applyOcrText);
  const saveChargeDraft = useFillcue((s) => s.saveChargeDraft);
  const resetChargeDraft = useFillcue((s) => s.resetChargeDraft);
  const removeCharge = useFillcue((s) => s.removeCharge);
  const preview = shopPreview || receipt.preview;

  async function onPick(file: File) {
    try {
      await handlePhoto(file, "charge");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read that photo");
    }
  }

  async function onSave() {
    try {
      await saveChargeDraft();
      toast.success("Charge saved on this device");
      onTab("home");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    }
  }

  return (
    <>
      <Card>
        <CardTitle>Charge receipt</CardTitle>
        <CardDescription className="mb-3">
          Snap a Supercharger or wall-connector receipt. A B&W scan is kept with the log. Nothing is uploaded.
        </CardDescription>
        <ScanTile src={preview} caption="Charge receipt" />
        <Progress value={ocrProgress} className="mt-3" />
        <p className="mt-2 text-sm text-muted-ink">{ocrBusy ? "Working…" : ocrStatus}</p>
        <div className="mt-3">
          <FileChip label="Charge receipt" gold onFile={onPick} icon={<Zap className="size-4" />} />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => applyOcrText(SAMPLE_CHARGE, "charge")}>
            Sample Supercharger
          </Button>
        </div>
      </Card>

      <Card>
        <form
          className="grid grid-cols-2 gap-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            void onSave();
          }}
        >
          <Field label="Date">
            <Input type="date" required value={draft.date} onChange={(e) => setDraft({ date: e.target.value })} />
          </Field>
          <Field label="Time">
            <Input type="time" value={draft.time} onChange={(e) => setDraft({ time: e.target.value })} />
          </Field>
          <Field label="Where">
            <NativeSelect
              value={draft.location}
              onChange={(v) => setDraft({ location: v as ChargeLocation })}
              options={CHARGE_LOCATIONS}
            />
          </Field>
          <Field label="City / State">
            <Input value={draft.city} onChange={(e) => setDraft({ city: e.target.value })} />
          </Field>
          <Field label="kWh">
            <Input inputMode="decimal" value={draft.kwh} onChange={(e) => setDraft({ kwh: e.target.value })} />
          </Field>
          <Field label="$ / kWh">
            <Input
              inputMode="decimal"
              value={draft.pricePerKwh}
              onChange={(e) => setDraft({ pricePerKwh: e.target.value })}
            />
          </Field>
          <Field label="Total $">
            <Input inputMode="decimal" value={draft.total} onChange={(e) => setDraft({ total: e.target.value })} />
          </Field>
          <Field label="Odometer">
            <Input inputMode="numeric" value={draft.odometer} onChange={(e) => setDraft({ odometer: e.target.value })} />
          </Field>
          <Field label="Notes" className="col-span-2">
            <Textarea value={draft.notes} onChange={(e) => setDraft({ notes: e.target.value })} />
          </Field>
          <div className="col-span-2 grid gap-2">
            <Button type="submit" disabled={ocrBusy}>
              Save charge
            </Button>
            <Button type="button" variant="outline" onClick={resetChargeDraft}>
              Reset form
            </Button>
            {draft.id ? (
              <DeleteDialog
                title="Delete this charge?"
                onConfirm={async () => {
                  await removeCharge(draft.id);
                  toast.success("Charge deleted");
                  onTab("log");
                }}
              />
            ) : null}
          </div>
        </form>
      </Card>

      {receipt.text ? (
        <Card>
          <CardTitle>Raw OCR</CardTitle>
          <pre className="ocr-box">{receipt.text.trim()}</pre>
        </Card>
      ) : null}
    </>
  );
}

function DeleteDialog({ title, onConfirm }: { title: string; onConfirm: () => Promise<void> }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive">
          {title.replace("?", "")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            Removed from this device only. Export first if you want a backup.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction className="bg-danger text-cream hover:bg-danger" onClick={() => void onConfirm()}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </label>
  );
}

function NativeSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[] | readonly { id: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-11 w-full rounded-md border border-line bg-card px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice/70"
    >
      {options.map((o) => {
        const id = typeof o === "string" ? o : o.id;
        const label = typeof o === "string" ? o : o.label;
        return (
          <option key={id} value={id}>
            {label}
          </option>
        );
      })}
    </select>
  );
}

function FileChip({
  label,
  gold,
  icon,
  onFile,
}: {
  label: string;
  gold?: boolean;
  icon: ReactNode;
  onFile: (file: File) => void;
}) {
  return (
    <label>
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
