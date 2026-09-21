import {
  DEFAULT_SETTINGS,
  type Charge,
  type Fill,
  type ServiceJob,
  type VehicleRecord,
  type VehicleSettings,
} from "./types";

const DB_NAME = "fillcue";
const DB_VERSION = 4;

function requireIdb(): IDBFactory {
  if (typeof indexedDB === "undefined") {
    throw new Error("GarageBook storage needs a browser.");
  }
  return indexedDB;
}

export function openDb(): Promise<IDBDatabase> {
  const idb = requireIdb();
  return new Promise((resolve, reject) => {
    const req = idb.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("fills")) {
        const fills = db.createObjectStore("fills", { keyPath: "id" });
        fills.createIndex("byDate", "date");
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("jobs")) {
        const jobs = db.createObjectStore("jobs", { keyPath: "id" });
        jobs.createIndex("byDate", "date");
      }
      if (!db.objectStoreNames.contains("charges")) {
        const charges = db.createObjectStore("charges", { keyPath: "id" });
        charges.createIndex("byDate", "date");
      }
      if (!db.objectStoreNames.contains("vehicles")) {
        db.createObjectStore("vehicles", { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Could not open GarageBook storage"));
  });
}

function getAll<T>(store: string): Promise<T[]> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(store, "readonly");
        const req = t.objectStore(store).getAll();
        req.onsuccess = () => resolve((req.result || []) as T[]);
        req.onerror = () => reject(req.error);
      }),
  );
}

function put<T>(store: string, row: T): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(store, "readwrite");
        t.objectStore(store).put(row);
        t.oncomplete = () => resolve(row);
        t.onerror = () => reject(t.error);
      }),
  );
}

function del(store: string, id: string): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(store, "readwrite");
        t.objectStore(store).delete(id);
        t.oncomplete = () => resolve();
        t.onerror = () => reject(t.error);
      }),
  );
}

export async function getAllFills(): Promise<Fill[]> {
  const rows = await getAll<Fill>("fills");
  rows.sort(
    (a, b) =>
      String(a.date).localeCompare(String(b.date)) || String(a.time || "").localeCompare(String(b.time || "")),
  );
  return rows.map((r) => ({ ...r, vehicleId: r.vehicleId || "highlander" }));
}

export function saveFill(fill: Fill): Promise<Fill> {
  return put("fills", fill);
}

export function deleteFill(id: string): Promise<void> {
  return del("fills", id);
}

export async function getAllJobs(): Promise<ServiceJob[]> {
  const rows = await getAll<ServiceJob>("jobs");
  rows.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  return rows.map((r) => ({ ...r, vehicleId: r.vehicleId || "highlander" }));
}

export function saveJob(job: ServiceJob): Promise<ServiceJob> {
  return put("jobs", job);
}

export function deleteJob(id: string): Promise<void> {
  return del("jobs", id);
}

export async function getAllCharges(): Promise<Charge[]> {
  const rows = await getAll<Charge>("charges");
  rows.sort(
    (a, b) =>
      String(a.date).localeCompare(String(b.date)) || String(a.time || "").localeCompare(String(b.time || "")),
  );
  return rows.map((r) => ({ ...r, vehicleId: r.vehicleId || "tesla" }));
}

export function saveCharge(charge: Charge): Promise<Charge> {
  return put("charges", charge);
}

export function deleteCharge(id: string): Promise<void> {
  return del("charges", id);
}

export async function getAllVehicles(): Promise<VehicleRecord[]> {
  const rows = await getAll<VehicleRecord>("vehicles");
  rows.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  return rows.map((r) => ({
    ...r,
    vin: r.vin || "",
    ownedSince: r.ownedSince || "",
    purchaseOdo: r.purchaseOdo ?? null,
  }));
}

export function saveVehicle(vehicle: VehicleRecord): Promise<VehicleRecord> {
  return put("vehicles", vehicle);
}

export function deleteVehicle(id: string): Promise<void> {
  return del("vehicles", id);
}

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction("settings", "readonly");
    const req = t.objectStore("settings").get(key);
    req.onsuccess = () => {
      const row = req.result as { key: string; value: T } | undefined;
      resolve(row ? row.value : fallback);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function setSetting<T>(key: string, value: T): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction("settings", "readwrite");
    t.objectStore("settings").put({ key, value });
    t.oncomplete = () => resolve(value);
    t.onerror = () => reject(t.error);
  });
}

export function uid(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `f${Date.now()}${Math.random().toString(16).slice(2)}`;
}

export { DEFAULT_SETTINGS };
