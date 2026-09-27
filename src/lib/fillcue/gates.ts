function positive(value: string) {
  const n = Number(value);
  return value.trim() !== "" && Number.isFinite(n) && n > 0;
}

export function fuelSaveGaps(draft: {
  date: string;
  gallons: string;
  pricePerGal: string;
  total: string;
  odometer: string;
}) {
  const gaps: string[] = [];
  if (!draft.date.trim()) gaps.push("date");
  if (!positive(draft.gallons)) gaps.push("gallons");
  if (!positive(draft.pricePerGal)) gaps.push("price per gallon");
  if (!positive(draft.total)) gaps.push("total");
  if (!positive(draft.odometer)) gaps.push("odometer");
  return gaps;
}

export function shopSaveGaps(draft: {
  date: string;
  status: string;
  total: string;
  odometer: string;
  dueDate: string;
  dueMiles: string;
}) {
  const gaps: string[] = [];
  if (!draft.date.trim()) gaps.push("date");
  if (draft.status === "scheduled") {
    if (!draft.dueDate.trim() && !positive(draft.dueMiles)) gaps.push("due date or due miles");
    return gaps;
  }
  if (!positive(draft.total)) gaps.push("total");
  if (!positive(draft.odometer)) gaps.push("odometer");
  return gaps;
}

export function chargeSaveGaps(draft: {
  date: string;
  kwh: string;
  pricePerKwh: string;
  total: string;
  odometer: string;
}) {
  const gaps: string[] = [];
  if (!draft.date.trim()) gaps.push("date");
  if (!positive(draft.kwh)) gaps.push("kWh");
  if (!positive(draft.pricePerKwh)) gaps.push("price per kWh");
  if (!positive(draft.total)) gaps.push("total");
  if (!positive(draft.odometer)) gaps.push("odometer");
  return gaps;
}
