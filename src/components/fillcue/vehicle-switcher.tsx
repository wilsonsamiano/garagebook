import { ChevronDown } from "lucide-react";
import { vinTail } from "@/lib/fillcue/vin";
import { useFillcue } from "@/store/fillcue-store";

export function VehicleSwitcher() {
  const vehicles = useFillcue((s) => s.vehicles);
  const settings = useFillcue((s) => s.settings);
  const selectVehicle = useFillcue((s) => s.selectVehicle);
  const label = settings.vehicle;
  const tail = settings.vin ? vinTail(settings.vin) : "";

  if (vehicles.length < 2) {
    return (
      <p className="max-w-[14rem] truncate text-xs text-ice/80">
        {label}
        {tail ? ` · ${tail}` : ""}
      </p>
    );
  }

  return (
    <label className="relative inline-flex max-w-[14.5rem] items-center">
      <span className="sr-only">Active vehicle</span>
      <select
        className="h-10 max-w-full appearance-none truncate bg-transparent pr-5 text-xs text-ice/90"
        value={settings.activeVehicleId}
        onChange={(e) => void selectVehicle(e.target.value)}
      >
        {vehicles.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
            {v.vin ? ` · ${vinTail(v.vin)}` : ""}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-0 size-3.5 text-ice/80" />
    </label>
  );
}
