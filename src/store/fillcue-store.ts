import { create } from "zustand";
import {
  deleteCharge as dbDeleteCharge,
  deleteFill as dbDeleteFill,
  deleteJob as dbDeleteJob,
  deleteVehicle as dbDeleteVehicle,
  getAllCharges,
  getAllFills,
  getAllJobs,
  getAllVehicles,
  getSetting,
  saveCharge as dbSaveCharge,
  saveFill as dbSaveFill,
  saveJob as dbSaveJob,
  saveVehicle as dbSaveVehicle,
  setSetting,
  uid,
} from "@/lib/fillcue/db";
import {
  guessPhotoKind,
  mergeChargeParse,
  mergeParse,
  mergeShopParse,
  parseChargeReceipt,
  parseCluster,
  parseReceipt,
  parseShopReceipt,
} from "@/lib/fillcue/parse";
import { recognizeFile } from "@/lib/fillcue/ocr";
import { encodeScan } from "@/lib/fillcue/scan";
import { summarizeOwnership } from "@/lib/fillcue/ownership";
import { ownershipWorkbook } from "@/lib/fillcue/spreadsheet";
import { enrich, type FillStats } from "@/lib/fillcue/stats";
import { normalizeVin } from "@/lib/fillcue/vin";
import {
  DEFAULT_SETTINGS,
  SEED_FILL,
  VEHICLE_PRESETS,
  blankVehicle,
  chargeToDraft,
  coerceCaptureMode,
  draftToCharge,
  draftToFill,
  draftToJob,
  emptyChargeDraft,
  emptyDraft,
  emptyServiceDraft,
  fillToDraft,
  jobToDraft,
  settingsFromVehicle,
  vehicleFromPreset,
  vehicleFromSettings,
  type CaptureMode,
  type Charge,
  type ChargeDraft,
  type Fill,
  type FillDraft,
  type PhotoKind,
  type ServiceDraft,
  type ServiceJob,
  type VehiclePreset,
  type VehicleRecord,
  type VehicleSettings,
} from "@/lib/fillcue/types";

export type TabId = "home" | "capture" | "log" | "settings";
export type LogFilter = "fuel" | "charge" | "shop" | "due";

type PhotoSlot = {
  text: string;
  preview: string;
};

type GarageState = {
  ready: boolean;
  error: string | null;
  settings: VehicleSettings;
  vehicles: VehicleRecord[];
  fills: Fill[];
  jobs: ServiceJob[];
  charges: Charge[];
  draft: FillDraft;
  serviceDraft: ServiceDraft;
  chargeDraft: ChargeDraft;
  captureMode: CaptureMode;
  logFilter: LogFilter;
  receipt: PhotoSlot;
  cluster: PhotoSlot;
  shopPreview: string;
  ocrProgress: number;
  ocrStatus: string;
  ocrBusy: boolean;
  hydrate: () => Promise<void>;
  activeFills: () => Fill[];
  activeJobs: () => ServiceJob[];
  activeCharges: () => Charge[];
  stats: () => FillStats;
  ownership: () => ReturnType<typeof summarizeOwnership>;
  setDraft: (patch: Partial<FillDraft>) => void;
  setServiceDraft: (patch: Partial<ServiceDraft>) => void;
  setChargeDraft: (patch: Partial<ChargeDraft>) => void;
  setCaptureMode: (mode: CaptureMode) => void;
  setLogFilter: (f: LogFilter) => void;
  resetDraft: () => void;
  resetServiceDraft: () => void;
  resetChargeDraft: () => void;
  openFill: (id: string) => void;
  openJob: (id: string) => void;
  openCharge: (id: string) => void;
  scheduleFrom: (patch: Partial<ServiceDraft>) => void;
  saveDraft: () => Promise<void>;
  saveServiceDraft: () => Promise<void>;
  saveChargeDraft: () => Promise<void>;
  removeFill: (id: string) => Promise<void>;
  removeJob: (id: string) => Promise<void>;
  removeCharge: (id: string) => Promise<void>;
  saveSettings: (next: VehicleSettings) => Promise<void>;
  selectVehicle: (id: string) => Promise<void>;
  addVehicle: (input?: Partial<VehicleRecord> & { fromPresetId?: string }) => Promise<VehicleRecord>;
  removeVehicle: (id: string) => Promise<void>;
  applyPreset: (preset: VehiclePreset) => Promise<void>;
  handlePhoto: (file: File, slot: PhotoKind | "auto") => Promise<void>;
  applyOcrText: (text: string, slot: PhotoKind | "auto") => void;
  exportJson: () => void;
  exportSpreadsheet: () => void;
  importJson: (file: File) => Promise<number>;
};

function download(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

function normalizeSettings(saved: VehicleSettings | null): VehicleSettings {
  const base = saved ? { ...DEFAULT_SETTINGS, ...saved } : { ...DEFAULT_SETTINGS };
  if (!base.activeVehicleId) base.activeVehicleId = "highlander";
  if (!base.powertrain || !["ice", "hybrid", "phev", "ev"].includes(base.powertrain)) {
    base.powertrain = base.activeVehicleId === "tesla" ? "ev" : "ice";
  }
  if (!base.ownedSince) base.ownedSince = "";
  if (base.purchaseOdo != null && !Number.isFinite(Number(base.purchaseOdo))) base.purchaseOdo = null;
  base.vin = normalizeVin(base.vin || "");
  return base;
}

function defaultMode(powertrain: VehicleSettings["powertrain"]): CaptureMode {
  return coerceCaptureMode(powertrain, powertrain === "ev" ? "charge" : "fuel");
}

function captureFor(powertrain: VehicleSettings["powertrain"]): Pick<
  GarageState,
  "captureMode" | "logFilter" | "draft" | "serviceDraft" | "chargeDraft" | "receipt" | "cluster" | "shopPreview"
> {
  return {
    captureMode: defaultMode(powertrain),
    logFilter: defaultMode(powertrain) === "charge" ? "charge" : "fuel",
    draft: emptyDraft(),
    serviceDraft: emptyServiceDraft(),
    chargeDraft: emptyChargeDraft(),
    receipt: { text: "", preview: "" },
    cluster: { text: "", preview: "" },
    shopPreview: "",
  };
}

async function persistActive(settings: VehicleSettings): Promise<void> {
  await setSetting("vehicle", settings);
  await setSetting("activeVehicleId", settings.activeVehicleId);
}

async function seedVehiclesIfNeeded(saved: VehicleSettings): Promise<VehicleRecord[]> {
  const existing = await getAllVehicles();
  if (existing.length) return existing;

  const byId = new Map<string, VehicleRecord>();
  const current = vehicleFromSettings(saved);
  byId.set(current.id, current);

  for (const preset of VEHICLE_PRESETS) {
    if (byId.has(preset.id)) continue;
    const extra = await getSetting<VehicleSettings | null>(`vehicle:${preset.id}`, null);
    byId.set(
      preset.id,
      extra
        ? vehicleFromSettings(normalizeSettings({ ...presetToLoose(preset), ...extra, activeVehicleId: preset.id }))
        : vehicleFromPreset(preset),
    );
  }

  const seeded = [...byId.values()];
  for (const v of seeded) await dbSaveVehicle(v);
  return seeded;
}

function presetToLoose(preset: VehiclePreset): VehicleSettings {
  return {
    vehicle: preset.name,
    tankGal: preset.tankGal,
    usableGal: preset.usableGal,
    epaCity: preset.epaCity,
    epaHwy: preset.epaHwy,
    epaComb: preset.epaComb,
    activeVehicleId: preset.id,
    powertrain: preset.powertrain,
    ownedSince: "",
    purchaseOdo: null,
    vin: "",
  };
}

export const useFillcue = create<GarageState>((set, get) => ({
  ready: true,
  error: null,
  settings: { ...DEFAULT_SETTINGS },
  vehicles: [vehicleFromSettings(DEFAULT_SETTINGS), vehicleFromPreset(VEHICLE_PRESETS[1])],
  fills: [SEED_FILL],
  jobs: [],
  charges: [],
  draft: emptyDraft(),
  serviceDraft: emptyServiceDraft(),
  chargeDraft: emptyChargeDraft(),
  captureMode: "fuel",
  logFilter: "fuel",
  receipt: { text: "", preview: "" },
  cluster: { text: "", preview: "" },
  shopPreview: "",
  ocrProgress: 0,
  ocrStatus: "Waiting for a photo.",
  ocrBusy: false,

  activeFills: () => {
    const id = get().settings.activeVehicleId;
    return get().fills.filter((f) => (f.vehicleId || "highlander") === id);
  },
  activeJobs: () => {
    const id = get().settings.activeVehicleId;
    return get().jobs.filter((j) => (j.vehicleId || "highlander") === id);
  },
  activeCharges: () => {
    const id = get().settings.activeVehicleId;
    return get().charges.filter((c) => (c.vehicleId || "tesla") === id);
  },
  stats: () => enrich(get().activeFills(), get().settings),
  ownership: () =>
    summarizeOwnership(get().settings, get().activeFills(), get().activeJobs(), get().activeCharges()),

  hydrate: async () => {
    try {
      const saved = await getSetting<VehicleSettings | null>("vehicle", null);
      const snapshot = normalizeSettings(saved);
      const vehicles = await seedVehiclesIfNeeded(snapshot);
      const activeId = snapshot.activeVehicleId;
      const active = vehicles.find((v) => v.id === activeId) || vehicles[0] || vehicleFromSettings(snapshot);
      const settings = settingsFromVehicle(active);
      await persistActive(settings);

      let fills = await getAllFills();
      const seeded = await getSetting<boolean>("seeded", false);
      if (!fills.length && !seeded) {
        await dbSaveFill(SEED_FILL);
        await setSetting("seeded", true);
        fills = [SEED_FILL];
      }
      const jobs = await getAllJobs();
      const charges = await getAllCharges();
      set({
        settings,
        vehicles,
        fills,
        jobs,
        charges,
        ready: true,
        error: null,
        ...captureFor(settings.powertrain),
      });
    } catch (err) {
      set({
        ready: true,
        error: err instanceof Error ? err.message : "Could not open on-device storage.",
      });
    }
  },

  setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  setServiceDraft: (patch) => set((s) => ({ serviceDraft: { ...s.serviceDraft, ...patch } })),
  setChargeDraft: (patch) => set((s) => ({ chargeDraft: { ...s.chargeDraft, ...patch } })),
  setCaptureMode: (mode) => set({ captureMode: coerceCaptureMode(get().settings.powertrain, mode) }),
  setLogFilter: (f) => set({ logFilter: f }),

  resetDraft: () =>
    set({
      draft: emptyDraft(),
      receipt: { text: "", preview: "" },
      cluster: { text: "", preview: "" },
      ocrProgress: 0,
      ocrStatus: "Waiting for a photo.",
      captureMode: defaultMode(get().settings.powertrain),
    }),

  resetServiceDraft: () =>
    set({
      serviceDraft: emptyServiceDraft(),
      shopPreview: "",
      receipt: { text: "", preview: "" },
      ocrProgress: 0,
      ocrStatus: "Waiting for a shop receipt.",
      captureMode: "shop",
    }),

  resetChargeDraft: () =>
    set({
      chargeDraft: emptyChargeDraft(),
      receipt: { text: "", preview: "" },
      shopPreview: "",
      ocrProgress: 0,
      ocrStatus: "Waiting for a charge receipt.",
      captureMode: "charge",
    }),

  openFill: (id) => {
    const fill = get().fills.find((f) => f.id === id);
    if (!fill) return;
    set({
      captureMode: "fuel",
      draft: fillToDraft(fill),
      receipt: { text: fill.receiptText || "", preview: fill.receiptScan || "" },
      cluster: { text: fill.clusterText || "", preview: fill.clusterScan || "" },
      ocrStatus: fill.receiptScan || fill.clusterScan ? "Editing a saved fill. Scan is on this device." : "Editing a saved fill.",
      ocrProgress: 100,
    });
  },

  openJob: (id) => {
    const job = get().jobs.find((j) => j.id === id);
    if (!job) return;
    set({
      captureMode: "shop",
      serviceDraft: jobToDraft(job),
      receipt: { text: job.receiptText || "", preview: job.receiptScan || "" },
      shopPreview: job.receiptScan || "",
      ocrStatus: job.receiptScan ? "Editing a saved job. Scan is on this device." : "Editing a saved job.",
      ocrProgress: 100,
    });
  },

  openCharge: (id) => {
    const charge = get().charges.find((c) => c.id === id);
    if (!charge) return;
    set({
      captureMode: "charge",
      chargeDraft: chargeToDraft(charge),
      receipt: { text: charge.receiptText || "", preview: charge.receiptScan || "" },
      shopPreview: charge.receiptScan || "",
      ocrStatus: charge.receiptScan ? "Editing a saved charge. Scan is on this device." : "Editing a saved charge.",
      ocrProgress: 100,
    });
  },

  scheduleFrom: (patch) => {
    set({
      captureMode: "shop",
      serviceDraft: emptyServiceDraft({ status: "scheduled", ...patch }),
      ocrStatus: "Schedule this service.",
      ocrProgress: 0,
    });
  },

  saveDraft: async () => {
    const { draft, receipt, cluster, settings, fills } = get();
    if (!draft.date) {
      set({ ocrStatus: "Add a date before saving." });
      throw new Error("Add a date before saving.");
    }
    const prev = fills.find((f) => f.id === draft.id);
    const fill = draftToFill(
      { ...draft, id: draft.id || uid() },
      {
        receiptText: receipt.text,
        clusterText: cluster.text,
        receiptScan: receipt.preview || prev?.receiptScan || "",
        clusterScan: cluster.preview || prev?.clusterScan || "",
        vehicleId: settings.activeVehicleId,
      },
    );
    await dbSaveFill(fill);
    const next = await getAllFills();
    set({ fills: next, draft: emptyDraft(), receipt: { text: "", preview: "" }, cluster: { text: "", preview: "" } });
  },

  saveServiceDraft: async () => {
    const { serviceDraft, receipt, settings, jobs } = get();
    if (!serviceDraft.date) {
      set({ ocrStatus: "Add a date before saving." });
      throw new Error("Add a date before saving.");
    }
    const prev = jobs.find((j) => j.id === serviceDraft.id);
    const job = draftToJob(
      { ...serviceDraft, id: serviceDraft.id || uid() },
      {
        receiptText: receipt.text,
        receiptScan: receipt.preview || prev?.receiptScan || "",
        vehicleId: settings.activeVehicleId,
      },
    );
    await dbSaveJob(job);
    const next = await getAllJobs();
    set({
      jobs: next,
      serviceDraft: emptyServiceDraft(),
      receipt: { text: "", preview: "" },
      shopPreview: "",
    });
  },

  saveChargeDraft: async () => {
    const { chargeDraft, receipt, settings, charges } = get();
    if (!chargeDraft.date) {
      set({ ocrStatus: "Add a date before saving." });
      throw new Error("Add a date before saving.");
    }
    const prev = charges.find((c) => c.id === chargeDraft.id);
    const charge = draftToCharge(
      { ...chargeDraft, id: chargeDraft.id || uid() },
      {
        receiptText: receipt.text,
        receiptScan: receipt.preview || prev?.receiptScan || "",
        vehicleId: settings.activeVehicleId,
      },
    );
    await dbSaveCharge(charge);
    const next = await getAllCharges();
    set({
      charges: next,
      chargeDraft: emptyChargeDraft(),
      receipt: { text: "", preview: "" },
      shopPreview: "",
    });
  },

  removeFill: async (id) => {
    await dbDeleteFill(id);
    const fills = await getAllFills();
    set({ fills });
    get().resetDraft();
  },

  removeJob: async (id) => {
    await dbDeleteJob(id);
    const jobs = await getAllJobs();
    set({ jobs });
    get().resetServiceDraft();
  },

  removeCharge: async (id) => {
    await dbDeleteCharge(id);
    const charges = await getAllCharges();
    set({ charges });
    get().resetChargeDraft();
  },

  saveSettings: async (next) => {
    const currentId = get().settings.activeVehicleId;
    const settings = normalizeSettings({ ...next, activeVehicleId: currentId, vin: normalizeVin(next.vin || "") });
    const record = vehicleFromSettings(settings);
    await dbSaveVehicle(record);
    await persistActive(settings);
    const vehicles = await getAllVehicles();
    const mode = get().captureMode;
    set({
      settings,
      vehicles,
      captureMode: coerceCaptureMode(settings.powertrain, mode),
    });
  },

  selectVehicle: async (id) => {
    const found = get().vehicles.find((v) => v.id === id);
    if (!found) return;
    const settings = settingsFromVehicle(found);
    await persistActive(settings);
    set({ settings, ...captureFor(found.powertrain) });
  },

  addVehicle: async (input = {}) => {
    const { fromPresetId, ...rest } = input;
    const preset = VEHICLE_PRESETS.find((p) => p.id === fromPresetId);
    const record = preset
      ? vehicleFromPreset(preset, { ...rest, id: rest.id || uid() })
      : blankVehicle({ ...rest, id: rest.id || uid() });
    record.vin = normalizeVin(record.vin || "");
    await dbSaveVehicle(record);
    const vehicles = await getAllVehicles();
    const settings = settingsFromVehicle(record);
    await persistActive(settings);
    set({ vehicles, settings, ...captureFor(record.powertrain) });
    return record;
  },

  removeVehicle: async (id) => {
    const { vehicles, settings } = get();
    if (vehicles.length <= 1) throw new Error("Keep at least one vehicle in the garage.");
    await dbDeleteVehicle(id);
    const remaining = await getAllVehicles();
    const next = settings.activeVehicleId === id ? remaining[0] : remaining.find((v) => v.id === settings.activeVehicleId) || remaining[0];
    const nextSettings = settingsFromVehicle(next);
    await persistActive(nextSettings);
    set({
      vehicles: remaining,
      settings: nextSettings,
      ...(settings.activeVehicleId === id ? captureFor(next.powertrain) : {}),
    });
  },

  applyPreset: async (preset) => {
    const existing = get().vehicles.find((v) => v.id === preset.id);
    if (existing) {
      await get().selectVehicle(existing.id);
      return;
    }
    await get().addVehicle({ fromPresetId: preset.id, id: preset.id, name: preset.name });
  },

  applyOcrText: (text, slot) => {
    const kind = slot === "auto" ? guessPhotoKind(text) : slot;
    const { draft, receipt, cluster, serviceDraft, chargeDraft } = get();
    if (kind === "cluster") {
      const parsed = mergeParse(parseReceipt(receipt.text), parseCluster(text), draft);
      set({
        cluster: { text, preview: cluster.preview },
        draft: parsed,
        captureMode: "fuel",
        ocrProgress: 100,
        ocrStatus: "Check the fields before saving.",
      });
      return;
    }
    if (kind === "shop") {
      const parsed = mergeShopParse(parseShopReceipt(text), serviceDraft);
      set({
        receipt: { text, preview: receipt.preview },
        serviceDraft: parsed,
        captureMode: "shop",
        ocrProgress: 100,
        ocrStatus: "Check the shop fields before saving.",
      });
      return;
    }
    if (kind === "charge") {
      const parsed = mergeChargeParse(parseChargeReceipt(text), chargeDraft);
      set({
        receipt: { text, preview: receipt.preview },
        chargeDraft: parsed,
        captureMode: "charge",
        ocrProgress: 100,
        ocrStatus: "Check the charge fields before saving.",
      });
      return;
    }
    const parsed = mergeParse(parseReceipt(text), parseCluster(cluster.text), draft);
    set({
      receipt: { text, preview: receipt.preview },
      draft: parsed,
      captureMode: "fuel",
      ocrProgress: 100,
      ocrStatus:
        kind === "unknown" ? "Could not tell receipt from cluster — check the fields." : "Check the fields before saving.",
    });
  },

  handlePhoto: async (file, slot) => {
    set({ ocrBusy: true, ocrProgress: 8, ocrStatus: "Preparing photo…" });
    try {
      const rec = await recognizeFile(file, (m) => set({ ocrProgress: 40, ocrStatus: m }));
      const kind = slot === "auto" ? guessPhotoKind(rec.text) : slot;
      const scan = encodeScan(rec.canvas, kind === "cluster" ? "cluster" : "document");
      const { draft, receipt, cluster, serviceDraft, chargeDraft } = get();
      if (kind === "cluster") {
        const parsed = mergeParse(parseReceipt(receipt.text), parseCluster(rec.text), draft);
        set({
          cluster: { text: rec.text, preview: scan },
          draft: parsed,
          captureMode: "fuel",
          ocrProgress: 100,
          ocrStatus: "Check the fields before saving. Scan stays on this device.",
          ocrBusy: false,
        });
      } else if (kind === "shop") {
        const parsed = mergeShopParse(parseShopReceipt(rec.text), serviceDraft);
        set({
          receipt: { text: rec.text, preview: scan },
          shopPreview: scan,
          serviceDraft: parsed,
          captureMode: "shop",
          ocrProgress: 100,
          ocrStatus: "Check the shop fields before saving. Scan stays on this device.",
          ocrBusy: false,
        });
      } else if (kind === "charge") {
        const parsed = mergeChargeParse(parseChargeReceipt(rec.text), chargeDraft);
        set({
          receipt: { text: rec.text, preview: scan },
          shopPreview: scan,
          chargeDraft: parsed,
          captureMode: "charge",
          ocrProgress: 100,
          ocrStatus: "Check the charge fields before saving. Scan stays on this device.",
          ocrBusy: false,
        });
      } else {
        const parsed = mergeParse(parseReceipt(rec.text), parseCluster(cluster.text), draft);
        set({
          receipt: { text: rec.text, preview: scan },
          draft: parsed,
          captureMode: "fuel",
          ocrProgress: 100,
          ocrStatus:
            kind === "unknown"
              ? "Could not tell receipt from cluster — check the fields."
              : "Check the fields before saving. Scan stays on this device.",
          ocrBusy: false,
        });
      }
    } catch (err) {
      set({
        ocrBusy: false,
        ocrProgress: 0,
        ocrStatus: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  },

  exportJson: () => {
    const { settings, vehicles, fills, jobs, charges } = get();
    download(
      new Blob([JSON.stringify({ settings, vehicles, fills, jobs, charges }, null, 2)], { type: "application/json" }),
      "garagebook-backup.json",
    );
  },

  exportSpreadsheet: () => {
    const { settings } = get();
    const { xml, filename } = ownershipWorkbook(settings, get().activeFills(), get().activeJobs(), get().activeCharges());
    download(new Blob([xml], { type: "application/vnd.ms-excel" }), filename);
  },

  importJson: async (file) => {
    const data = JSON.parse(await file.text()) as {
      settings?: VehicleSettings;
      vehicles?: VehicleRecord[];
      fills?: Fill[];
      jobs?: ServiceJob[];
      charges?: Charge[];
    };
    if (Array.isArray(data.vehicles) && data.vehicles.length) {
      for (const v of data.vehicles) {
        if (v?.id) await dbSaveVehicle({ ...v, vin: normalizeVin(v.vin || "") });
      }
    } else if (data.settings) {
      await dbSaveVehicle(vehicleFromSettings(normalizeSettings(data.settings)));
    }
    if (data.settings) {
      const next = normalizeSettings(data.settings);
      await persistActive(next);
      set({ settings: next });
    }
    let n = 0;
    if (Array.isArray(data.fills)) {
      for (const fill of data.fills) {
        if (fill?.id) {
          await dbSaveFill({ ...fill, vehicleId: fill.vehicleId || "highlander" });
          n += 1;
        }
      }
    }
    if (Array.isArray(data.jobs)) {
      for (const job of data.jobs) {
        if (job?.id) {
          await dbSaveJob({ ...job, vehicleId: job.vehicleId || "highlander" });
          n += 1;
        }
      }
    }
    if (Array.isArray(data.charges)) {
      for (const charge of data.charges) {
        if (charge?.id) {
          await dbSaveCharge({ ...charge, vehicleId: charge.vehicleId || "tesla" });
          n += 1;
        }
      }
    }
    const vehicles = await getAllVehicles();
    const fills = await getAllFills();
    const jobs = await getAllJobs();
    const charges = await getAllCharges();
    const active = vehicles.find((v) => v.id === get().settings.activeVehicleId) || vehicles[0];
    const settings = active ? settingsFromVehicle(active) : get().settings;
    set({ vehicles, fills, jobs, charges, settings });
    return n;
  },
}));

export { VEHICLE_PRESETS };
