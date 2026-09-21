import { summarizeOwnership, type OwnershipSummary } from "./ownership.ts";
import { enrich } from "./stats.ts";
import { DUE_DISCLAIMER_FULL } from "./recommend.ts";
import { SERVICE_CATEGORIES, powertrainLabel, type Charge, type Fill, type ServiceJob, type VehicleSettings } from "./types.ts";


const E = "\u0026";

function esc(s: string): string {
  return String(s)
    .replace(/&/g, `${E}amp;`)
    .replace(/</g, `${E}lt;`)
    .replace(/>/g, `${E}gt;`)
    .replace(/"/g, `${E}quot;`);
}

function strCell(v: string | number | null | undefined): string {
  if (v == null || v === "") return `<Cell><Data ss:Type="String"></Data></Cell>`;
  return `<Cell><Data ss:Type="String">${esc(String(v))}</Data></Cell>`;
}


function numCell(v: number | null | undefined): string {
  if (v == null || Number.isNaN(Number(v))) return `<Cell><Data ss:Type="String"></Data></Cell>`;
  return `<Cell ss:StyleID="num"><Data ss:Type="Number">${Number(v)}</Data></Cell>`;
}

function moneyCell(v: number | null | undefined): string {
  if (v == null || Number.isNaN(Number(v))) return `<Cell><Data ss:Type="String"></Data></Cell>`;
  return `<Cell ss:StyleID="usd"><Data ss:Type="Number">${Number(v)}</Data></Cell>`;
}

function row(cells: string[]): string {
  return `<Row>${cells.join("")}</Row>`;
}

function kv(label: string, value: string): string {
  return row([strCell(label), strCell(value)]);
}

function kvNum(label: string, value: number | null, money = false): string {
  return row([strCell(label), money ? moneyCell(value) : numCell(value)]);
}

function sheet(name: string, rowsXml: string, colCount: number): string {
  const cols = Array.from({ length: colCount }, () => `<Column ss:AutoFitWidth="1" ss:Width="90"/>`).join("");
  return `<Worksheet ss:Name="${esc(name)}"><Table>${cols}${rowsXml}</Table></Worksheet>`;
}

function header(labels: string[]): string {
  return `<Row ss:StyleID="head">${labels.map((l) => strCell(l)).join("")}</Row>`;
}

export function ownershipWorkbook(
  settings: VehicleSettings,
  fills: Fill[],
  jobs: ServiceJob[],
  charges: Charge[],
  today = new Date().toISOString().slice(0, 10),
): { xml: string; filename: string; summary: OwnershipSummary } {
  const summary = summarizeOwnership(settings, fills, jobs, charges, today);
  const stats = enrich(
    fills.filter((f) => !settings.ownedSince || f.date >= settings.ownedSince),
    settings,
  );
  const cat = Object.fromEntries(SERVICE_CATEGORIES.map((c) => [c.id, c.label]));

  const ownRows = [
    row([strCell("GarageBook ownership log")]),
    kv("Vehicle", summary.vehicle),
    kv("VIN", summary.vin || "(not set)"),
    kv("Powertrain", powertrainLabel(summary.powertrain)),
    kv("Owned since", summary.ownedSince || "(from first log entry)"),
    kvNum("Odometer at purchase", summary.purchaseOdo),
    kvNum("Current odometer", summary.currentOdo),
    kvNum("Miles while owned", summary.milesOwned),
    kv("Period start", summary.periodStart),
    kv("Period end", summary.periodEnd),
    row([strCell("")]),
    row([strCell("Energy")]),
    kvNum("Fill-ups", summary.fillCount),
    kvNum("Gasoline (gal)", summary.gallons),
    kvNum("Gasoline spend", summary.fuelSpend, true),
    kvNum("Average MPG", summary.avgMpg),
    kvNum("Charge sessions", summary.chargeCount),
    kvNum("Electricity (kWh)", summary.kwh),
    kvNum("Electricity spend", summary.energySpend, true),
    kvNum("Miles per kWh", summary.miPerKwh),
    row([strCell("")]),
    row([strCell("Maintenance")]),
    kvNum("Completed shop visits", summary.jobCount),
    kvNum("Shop spend", summary.shopSpend, true),
    ...summary.shopByCategory.map((c) => kvNum(`${c.label} (${c.count})`, c.spend, true)),
    row([strCell("")]),
    row([strCell("Totals")]),
    kvNum("Operating cost (fuel + energy + shop)", summary.operatingTotal, true),
    kvNum("Cost per mile", summary.costPerMile, true),
    row([strCell("")]),
    kv(
      "Note",
      "Totals only include what is saved in GarageBook from the owned-since date. Backfill older fills, charges, and shop visits for a full ownership picture. Scheduled (not done) shop jobs are omitted from spend.",
    ),
    kv("Due dates", DUE_DISCLAIMER_FULL),
  ].join("");

  const fuelRows = [
    header([
      "Date",
      "Time",
      "Station",
      "City",
      "Pump",
      "Grade",
      "Gallons",
      "Price/gal",
      "Total $",
      "Odometer",
      "Miles this tank",
      "MPG",
      "$/mile",
      "Fill to full",
      "Trip",
      "Notes",
    ]),
    ...stats.rows.map((r) =>
      row([
        strCell(r.date),
        strCell(r.time),
        strCell(r.station),
        strCell(r.city),
        strCell(r.pump),
        strCell(r.grade),
        numCell(r.gallons),
        moneyCell(r.pricePerGal),
        moneyCell(r.total),
        numCell(r.odometer),
        numCell(r.milesThisTank),
        numCell(r.mpg),
        moneyCell(r.costPerMile),
        strCell(r.fillToFull),
        strCell(r.tripType),
        strCell(r.notes),
      ]),
    ),
  ].join("");

  const inPeriod = (d: string) => !settings.ownedSince || d >= settings.ownedSince;
  const chargeRows = [
    header(["Date", "Time", "Location", "City", "kWh", "$/kWh", "Total $", "Odometer", "Notes"]),
    ...charges
      .filter((c) => inPeriod(c.date))
      .map((c) =>
        row([
          strCell(c.date),
          strCell(c.time),
          strCell(c.location),
          strCell(c.city),
          numCell(c.kwh),
          moneyCell(c.pricePerKwh),
          moneyCell(c.total),
          numCell(c.odometer),
          strCell(c.notes),
        ]),
      ),
  ].join("");

  const shopRows = [
    header(["Date", "Shop", "City", "Category", "Summary", "Status", "Odometer", "Total $", "Due date", "Due miles", "Notes"]),
    ...jobs
      .filter((j) => inPeriod(j.date))
      .map((j) =>
        row([
          strCell(j.date),
          strCell(j.shop),
          strCell(j.city),
          strCell(cat[j.category] || j.category),
          strCell(j.summary),
          strCell(j.status),
          numCell(j.odometer),
          moneyCell(j.total),
          strCell(j.dueDate),
          numCell(j.dueMiles),
          strCell(j.notes),
        ]),
      ),
  ].join("");

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="head"><Font ss:Bold="1" ss:Color="#F7F1E6"/><Interior ss:Color="#1B365D" ss:Pattern="Solid"/></Style>
  <Style ss:ID="usd"><NumberFormat ss:Format="${E}quot;$${E}quot;#,##0.00"/></Style>
  <Style ss:ID="num"><NumberFormat ss:Format="#,##0.00"/></Style>
 </Styles>
 ${sheet("Ownership", ownRows, 2)}
 ${sheet("Fuel", fuelRows, 16)}
 ${sheet("Charging", chargeRows, 9)}
 ${sheet("Shop", shopRows, 11)}
</Workbook>`;

  const slug = (settings.activeVehicleId || "vehicle").replace(/[^a-z0-9-]+/gi, "-");
  return { xml, filename: `garagebook-${slug}-ownership.xls`, summary };
}
