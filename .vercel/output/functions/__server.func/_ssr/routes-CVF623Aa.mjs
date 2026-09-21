import { i as __toESM } from "../_runtime.mjs";
import { a as Overlay2, c as Title2, d as Slot, h as require_react, i as Description2, l as Trigger2, m as require_jsx_runtime, n as Cancel, o as Portal2, r as Content2, s as Root2, t as Action } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as Receipt, c as Gauge, i as SlidersHorizontal, l as ChevronDown, n as Wrench, o as Plus, s as List, t as Zap, u as Camera } from "../_libs/lucide-react.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
import { n as Root$1, t as Indicator } from "../_libs/radix-ui__react-progress.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CVF623Aa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BrandMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 36 36",
		className,
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "6",
				y: "5",
				width: "24",
				height: "26",
				rx: "3",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.6"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M12 5v26",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.4",
				className: "text-ice"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M18 13.5c2.2-1.8 5.6-.4 5.6 2.2 0 1.6-1.1 2.5-2.6 3.3L18 21",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "2",
				strokeLinecap: "round",
				className: "text-gold"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "18",
				cy: "23.4",
				r: "1.5",
				fill: "currentColor",
				className: "text-gold"
			})
		]
	});
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Segmented({ value, onChange, options }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-1 rounded-lg bg-line/60 p-1",
		style: { gridTemplateColumns: `repeat(${options.length}, 1fr)` },
		children: options.map((o) => {
			const active = o.id === value;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onChange(o.id),
				className: cn("min-h-11 rounded-md px-1 font-medium transition-colors duration-[var(--motion-quick)]", options.length > 3 ? "text-xs" : "text-sm", active ? "bg-card text-navy shadow-panel" : "text-muted-ink"),
				children: o.label
			}, o.id);
		})
	});
}
function otsuThreshold(hist) {
	const total = hist.reduce((a, b) => a + b, 0);
	if (!total) return 128;
	let sum = 0;
	for (let i = 0; i < 256; i++) sum += i * (hist[i] || 0);
	let sumB = 0;
	let wB = 0;
	let max = 0;
	let thresh = 128;
	for (let t = 0; t < 256; t++) {
		wB += hist[t] || 0;
		if (!wB) continue;
		const wF = total - wB;
		if (!wF) break;
		sumB += t * (hist[t] || 0);
		const mB = sumB / wB;
		const mF = (sum - sumB) / wF;
		const between = wB * wF * (mB - mF) * (mB - mF);
		if (between >= max) {
			max = between;
			thresh = t;
		}
	}
	return thresh;
}
function fitSize(w, h, maxEdge = 720) {
	const edge = Math.max(w, h);
	if (edge <= maxEdge) return {
		w,
		h
	};
	const s = maxEdge / edge;
	return {
		w: Math.max(1, Math.round(w * s)),
		h: Math.max(1, Math.round(h * s))
	};
}
function luminanceHist(data) {
	const hist = Array.from({ length: 256 }, () => 0);
	for (let i = 0; i < data.length; i += 4) hist[data[i]] += 1;
	return hist;
}
/** Hard black/white — receipt / shop / charge paper. */
function applyDocumentScan(data) {
	const t = otsuThreshold(luminanceHist(data));
	for (let i = 0; i < data.length; i += 4) {
		const v = data[i] > t ? 255 : 0;
		data[i] = data[i + 1] = data[i + 2] = v;
		data[i + 3] = 255;
	}
}
/** 8-level gray so cluster needles and digits stay readable. */
function applyClusterScan(data) {
	for (let i = 0; i < data.length; i += 4) {
		const v = Math.min(255, Math.round(data[i] / 32) * 32);
		data[i] = data[i + 1] = data[i + 2] = v;
		data[i + 3] = 255;
	}
}
function scanByteLength(dataUrl) {
	if (!dataUrl) return 0;
	const comma = dataUrl.indexOf(",");
	const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
	return Math.floor(b64.length * 3 / 4);
}
function formatScanSize(dataUrl) {
	const n = scanByteLength(dataUrl);
	if (n <= 0) return "";
	if (n < 1024) return `${n} B`;
	const kb = n / 1024;
	return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
}
function encodeScan(source, mode = "document") {
	if (typeof document === "undefined") return "";
	const maxEdge = mode === "cluster" ? 640 : 720;
	const { w, h } = fitSize(source.width, source.height, maxEdge);
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d", { alpha: false });
	if (!ctx) return "";
	ctx.drawImage(source, 0, 0, w, h);
	const image = ctx.getImageData(0, 0, w, h);
	if (mode === "document") applyDocumentScan(image.data);
	else applyClusterScan(image.data);
	ctx.putImageData(image, 0, 0);
	const jpeg = canvas.toDataURL("image/jpeg", mode === "document" ? .42 : .48);
	const png = canvas.toDataURL("image/png");
	return scanByteLength(png) < scanByteLength(jpeg) ? png : jpeg;
}
function ScanPeek({ src, alt, className, size = "tile" }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	if (!src) return null;
	const kb = formatScanSize(src);
	function openScan(e) {
		e.preventDefault();
		e.stopPropagation();
		setOpen(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: openScan,
		className: cn("overflow-hidden border border-line bg-paper text-left", size === "thumb" ? "size-12 shrink-0 rounded-sm" : "h-28 w-full rounded-md", className),
		"aria-label": `Open ${alt} scan`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src,
			alt,
			className: "size-full object-cover"
		})
	}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-navy-deep/80 p-4 sm:items-center",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": alt,
		onClick: () => setOpen(false),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
			className: "max-h-[90dvh] w-full max-w-lg overflow-hidden rounded-lg bg-paper shadow-panel",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src,
				alt,
				className: "max-h-[75dvh] w-full object-contain bg-cream"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figcaption", {
				className: "flex items-center justify-between gap-3 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-sm text-muted-ink",
					children: [alt, kb ? ` · ${kb} B&W scan` : " · B&W scan"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "h-11 rounded-md px-3 text-sm font-medium text-navy",
					onClick: () => setOpen(false),
					children: "Close"
				})]
			})]
		})
	}) : null] });
}
function ScanTile({ src, caption }) {
	const kb = src ? formatScanSize(src) : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		className: "min-w-0",
		children: [src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanPeek, {
			src,
			alt: caption,
			size: "tile"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-28 items-center justify-center overflow-hidden rounded-md bg-line/50 text-xs text-muted-ink",
			children: caption
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", {
			className: "mt-1 truncate text-xs text-muted-ink",
			children: src ? kb ? `Saved · ${kb}` : "Saved scan" : caption
		})]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[opacity,transform,background-color,color,border-color] duration-[var(--motion-quick)] ease-[var(--ease-smooth-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice/70 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-navy text-cream hover:bg-navy-deep",
			gold: "bg-gold text-navy-deep hover:opacity-90",
			outline: "border border-line bg-transparent text-navy hover:bg-paper",
			ghost: "text-navy hover:bg-line/40",
			destructive: "bg-danger-soft text-danger hover:opacity-90",
			cream: "bg-cream text-navy hover:bg-card"
		},
		size: {
			default: "h-11 px-4 py-2",
			sm: "h-9 rounded-sm px-3",
			lg: "h-12 rounded-lg px-5",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var AlertDialog = Root2;
var AlertDialogTrigger = Trigger2;
var AlertDialogPortal = Portal2;
var AlertDialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay2, {
	className: cn("fixed inset-0 z-50 bg-ink/50 data-[state=open]:animate-in data-[state=closed]:animate-out", className),
	...props,
	ref
}));
AlertDialogOverlay.displayName = Overlay2.displayName;
var AlertDialogContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	className: cn("fixed top-1/2 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-line bg-card p-5 shadow-panel", className),
	...props
})] }));
AlertDialogContent.displayName = Content2.displayName;
function AlertDialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-2 text-left", className),
		...props
	});
}
function AlertDialogFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
		...props
	});
}
var AlertDialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title2, {
	ref,
	className: cn("text-lg font-semibold text-ink", className),
	...props
}));
AlertDialogTitle.displayName = Title2.displayName;
var AlertDialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description2, {
	ref,
	className: cn("text-sm text-muted-ink", className),
	...props
}));
AlertDialogDescription.displayName = Description2.displayName;
var AlertDialogAction = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
	ref,
	className: cn(buttonVariants(), className),
	...props
}));
AlertDialogAction.displayName = Action.displayName;
var AlertDialogCancel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel, {
	ref,
	className: cn(buttonVariants({ variant: "outline" }), className),
	...props
}));
AlertDialogCancel.displayName = Cancel.displayName;
var Card = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("rounded-xl border border-line bg-card p-4 text-ink shadow-panel", className),
	...props
}));
Card.displayName = "Card";
var CardTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
	ref,
	className: cn("mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-navy", className),
	...props
}));
CardTitle.displayName = "CardTitle";
var CardDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
	ref,
	className: cn("text-sm text-muted-ink", className),
	...props
}));
CardDescription.displayName = "CardDescription";
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	type,
	className: cn("flex h-11 w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-ink shadow-none transition-[border-color,box-shadow] duration-[var(--motion-quick)] placeholder:text-muted-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice/70 disabled:cursor-not-allowed disabled:opacity-50", className),
	ref,
	...props
}));
Input.displayName = "Input";
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("text-xs font-medium uppercase tracking-wide text-muted-ink", className),
	...props
}));
Label.displayName = Root.displayName;
var Progress = import_react.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root$1, {
	ref,
	className: cn("relative h-2 w-full overflow-hidden rounded-full bg-line", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Indicator, {
		className: "h-full w-full flex-1 bg-linear-to-r from-navy to-gold transition-transform duration-[var(--motion-fast)] ease-[var(--ease-smooth-out)]",
		style: { transform: `translateX(-${100 - (value || 0)}%)` }
	})
}));
Progress.displayName = Root$1.displayName;
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
	className: cn("flex min-h-24 w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-muted-ink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice/70 disabled:cursor-not-allowed disabled:opacity-50", className),
	ref,
	...props
}));
Textarea.displayName = "Textarea";
var VEHICLE_PRESETS = [{
	id: "highlander",
	name: "2015 Toyota Highlander XLE",
	powertrain: "ice",
	tankGal: 19.2,
	usableGal: 18.5,
	epaCity: 18,
	epaHwy: 24,
	epaComb: 20
}, {
	id: "tesla",
	name: "2018 Tesla Model 3 LR",
	powertrain: "ev",
	tankGal: 0,
	usableGal: 0,
	epaCity: 0,
	epaHwy: 0,
	epaComb: 0
}];
var POWERTRAIN_OPTIONS = [
	{
		id: "ice",
		label: "Gas"
	},
	{
		id: "hybrid",
		label: "Hybrid"
	},
	{
		id: "phev",
		label: "Plug-in"
	},
	{
		id: "ev",
		label: "EV"
	}
];
function powertrainLabel(p) {
	return POWERTRAIN_OPTIONS.find((o) => o.id === p)?.label ?? "Gas";
}
/** Gasoline, hybrid, and plug-in hybrids all burn fuel. */
function burnsFuel(p) {
	return p !== "ev";
}
/** Battery EVs and plug-in hybrids take a charge log. */
function plugsIn(p) {
	return p === "ev" || p === "phev";
}
function coerceCaptureMode(powertrain, mode) {
	if (mode === "shop") return "shop";
	if (mode === "charge") return plugsIn(powertrain) ? "charge" : "fuel";
	return burnsFuel(powertrain) ? "fuel" : "charge";
}
function captureModesFor(p) {
	const rows = [];
	if (burnsFuel(p)) rows.push({
		id: "fuel",
		label: "Fuel"
	});
	if (plugsIn(p)) rows.push({
		id: "charge",
		label: "Charge"
	});
	rows.push({
		id: "shop",
		label: "Shop"
	});
	return rows;
}
var DEFAULT_SETTINGS = {
	vehicle: "2015 Toyota Highlander XLE",
	tankGal: 19.2,
	usableGal: 18.5,
	epaCity: 18,
	epaHwy: 24,
	epaComb: 20,
	activeVehicleId: "highlander",
	powertrain: "ice",
	ownedSince: "",
	purchaseOdo: null,
	vin: ""
};
var FILL_TO_FULL = [
	"Yes",
	"Partial",
	"No"
];
var TRIP_TYPES = [
	"Mixed",
	"City",
	"Highway",
	"Towing",
	"Loaded family"
];
var GRADES = [
	"Regular 87",
	"Midgrade 89",
	"Premium 91",
	"Premium 93",
	"Diesel",
	"E85"
];
var CHARGE_LOCATIONS = [
	"Home",
	"Supercharger",
	"Destination",
	"Work",
	"Other"
];
var SERVICE_CATEGORIES = [
	{
		id: "oil",
		label: "Oil change"
	},
	{
		id: "rotation",
		label: "Tire rotation"
	},
	{
		id: "tires",
		label: "Tires"
	},
	{
		id: "brakes",
		label: "Brakes"
	},
	{
		id: "brake-fluid",
		label: "Brake fluid"
	},
	{
		id: "cabin-filter",
		label: "Cabin filter"
	},
	{
		id: "air-filter",
		label: "Engine air filter"
	},
	{
		id: "transmission",
		label: "Transmission"
	},
	{
		id: "coolant",
		label: "Coolant"
	},
	{
		id: "spark-plugs",
		label: "Spark plugs"
	},
	{
		id: "battery",
		label: "Battery"
	},
	{
		id: "wipers",
		label: "Wipers"
	},
	{
		id: "alignment",
		label: "Alignment"
	},
	{
		id: "inspection",
		label: "Inspection"
	},
	{
		id: "other",
		label: "Other"
	}
];
var SEED_FILL = {
	id: "seed-costco-2026-09-20",
	vehicleId: "highlander",
	date: "2026-09-20",
	time: "12:22",
	station: "Costco #483",
	city: "San Diego, CA",
	pump: "8",
	grade: "Regular 87",
	gallons: 14.418,
	pricePerGal: 5.799,
	total: 83.61,
	odometer: 112464,
	clusterRange: 309,
	clusterAvgMph: 26,
	outsideF: 81,
	fillToFull: "Yes",
	tripType: "City",
	notes: "Costco Gateway Center Dr, then 4.2 mi to Tous Les Jours, National City. Cluster at bakery: ODO 112468 / Range 309 / 26 mph / 81F."
};
var SAMPLE_RECEIPT = `Costco #483
844 Gateway Center Dr
San Diego, CA 92102
Date: 09/20/26
Time: 12:22
Pump 8
Gallons 14.418
Price $ 5.799
Product Regular
Amount $ 83.61
Total Sale $ 83.61`;
var SAMPLE_CLUSTER = `Outside 81°F
P
Range
309 miles
After Reset
26 MPH
ODO 112468 miles`;
var SAMPLE_SHOP = `Firestone Complete Auto Care
El Paso, TX 79925
Date: 08/12/26
RO 184422
Mileage 110210
Oil change 0W-20
Tire rotation
Cabin air filter
Labor 89.00
Parts 64.18
Total $ 153.18`;
var SAMPLE_CHARGE = `Tesla Supercharger
6101 Gateway Blvd E
El Paso, TX 79905
Date: 09/18/26
Time: 18:40
42.812 kWh
$0.420 / kWh
Total $17.98`;
function emptyDraft(partial = {}) {
	return {
		id: "",
		date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		time: "",
		station: "",
		city: "",
		pump: "",
		grade: "Regular 87",
		gallons: "",
		pricePerGal: "",
		total: "",
		odometer: "",
		clusterRange: "",
		clusterAvgMph: "",
		outsideF: "",
		fillToFull: "Yes",
		tripType: "Mixed",
		notes: "",
		...partial
	};
}
function emptyServiceDraft(partial = {}) {
	return {
		id: "",
		date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		shop: "",
		city: "",
		odometer: "",
		total: "",
		category: "oil",
		summary: "",
		status: "done",
		dueDate: "",
		dueMiles: "",
		notes: "",
		...partial
	};
}
function emptyChargeDraft(partial = {}) {
	return {
		id: "",
		date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		time: "",
		location: "Supercharger",
		city: "",
		kwh: "",
		pricePerKwh: "",
		total: "",
		odometer: "",
		notes: "",
		...partial
	};
}
function fillToDraft(fill) {
	const str = (n) => n == null || Number.isNaN(n) ? "" : String(n);
	return {
		id: fill.id,
		date: fill.date || "",
		time: fill.time || "",
		station: fill.station || "",
		city: fill.city || "",
		pump: fill.pump || "",
		grade: fill.grade || "Regular 87",
		gallons: str(fill.gallons),
		pricePerGal: str(fill.pricePerGal),
		total: str(fill.total),
		odometer: str(fill.odometer),
		clusterRange: str(fill.clusterRange),
		clusterAvgMph: str(fill.clusterAvgMph),
		outsideF: str(fill.outsideF),
		fillToFull: fill.fillToFull || "Yes",
		tripType: fill.tripType || "Mixed",
		notes: fill.notes || ""
	};
}
function draftToFill(draft, extra) {
	const num = (s) => {
		if (s.trim() === "") return null;
		const n = Number(s);
		return Number.isFinite(n) ? n : null;
	};
	return {
		id: draft.id,
		vehicleId: extra.vehicleId,
		date: draft.date,
		time: draft.time,
		station: draft.station,
		city: draft.city,
		pump: draft.pump,
		grade: draft.grade,
		gallons: num(draft.gallons),
		pricePerGal: num(draft.pricePerGal),
		total: num(draft.total),
		odometer: num(draft.odometer),
		clusterRange: num(draft.clusterRange),
		clusterAvgMph: num(draft.clusterAvgMph),
		outsideF: num(draft.outsideF),
		fillToFull: draft.fillToFull,
		tripType: draft.tripType,
		notes: draft.notes,
		receiptText: extra.receiptText || "",
		clusterText: extra.clusterText || "",
		receiptScan: extra.receiptScan || "",
		clusterScan: extra.clusterScan || "",
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function jobToDraft(job) {
	const str = (n) => n == null || Number.isNaN(n) ? "" : String(n);
	return {
		id: job.id,
		date: job.date || "",
		shop: job.shop || "",
		city: job.city || "",
		odometer: str(job.odometer),
		total: str(job.total),
		category: job.category || "other",
		summary: job.summary || "",
		status: job.status || "done",
		dueDate: job.dueDate || "",
		dueMiles: str(job.dueMiles),
		notes: job.notes || ""
	};
}
function draftToJob(draft, extra) {
	const num = (s) => {
		if (s.trim() === "") return null;
		const n = Number(s);
		return Number.isFinite(n) ? n : null;
	};
	return {
		id: draft.id,
		vehicleId: extra.vehicleId,
		date: draft.date,
		shop: draft.shop,
		city: draft.city,
		odometer: num(draft.odometer),
		total: num(draft.total),
		category: draft.category,
		summary: draft.summary,
		status: draft.status,
		dueDate: draft.dueDate,
		dueMiles: num(draft.dueMiles),
		notes: draft.notes,
		receiptText: extra.receiptText || "",
		receiptScan: extra.receiptScan || "",
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function chargeToDraft(charge) {
	const str = (n) => n == null || Number.isNaN(n) ? "" : String(n);
	return {
		id: charge.id,
		date: charge.date || "",
		time: charge.time || "",
		location: charge.location || "Other",
		city: charge.city || "",
		kwh: str(charge.kwh),
		pricePerKwh: str(charge.pricePerKwh),
		total: str(charge.total),
		odometer: str(charge.odometer),
		notes: charge.notes || ""
	};
}
function draftToCharge(draft, extra) {
	const num = (s) => {
		if (s.trim() === "") return null;
		const n = Number(s);
		return Number.isFinite(n) ? n : null;
	};
	return {
		id: draft.id,
		vehicleId: extra.vehicleId,
		date: draft.date,
		time: draft.time,
		location: draft.location,
		city: draft.city,
		kwh: num(draft.kwh),
		pricePerKwh: num(draft.pricePerKwh),
		total: num(draft.total),
		odometer: num(draft.odometer),
		notes: draft.notes,
		receiptText: extra.receiptText || "",
		receiptScan: extra.receiptScan || "",
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function settingsFromVehicle(v) {
	return {
		vehicle: v.name,
		tankGal: v.tankGal,
		usableGal: v.usableGal,
		epaCity: v.epaCity,
		epaHwy: v.epaHwy,
		epaComb: v.epaComb,
		activeVehicleId: v.id,
		powertrain: v.powertrain,
		ownedSince: v.ownedSince || "",
		purchaseOdo: v.purchaseOdo ?? null,
		vin: v.vin || ""
	};
}
function vehicleFromSettings(s) {
	return {
		id: s.activeVehicleId || "highlander",
		name: s.vehicle,
		powertrain: s.powertrain,
		vin: s.vin || "",
		tankGal: s.tankGal,
		usableGal: s.usableGal,
		epaCity: s.epaCity,
		epaHwy: s.epaHwy,
		epaComb: s.epaComb,
		ownedSince: s.ownedSince || "",
		purchaseOdo: s.purchaseOdo ?? null
	};
}
function vehicleFromPreset(preset, extra = {}) {
	return {
		id: extra.id || preset.id,
		name: extra.name || preset.name,
		powertrain: extra.powertrain || preset.powertrain,
		vin: extra.vin || "",
		tankGal: extra.tankGal ?? preset.tankGal,
		usableGal: extra.usableGal ?? preset.usableGal,
		epaCity: extra.epaCity ?? preset.epaCity,
		epaHwy: extra.epaHwy ?? preset.epaHwy,
		epaComb: extra.epaComb ?? preset.epaComb,
		ownedSince: extra.ownedSince || "",
		purchaseOdo: extra.purchaseOdo ?? null
	};
}
function blankVehicle(extra = {}) {
	return {
		id: extra.id || "",
		name: extra.name || "New vehicle",
		powertrain: extra.powertrain || "ice",
		vin: extra.vin || "",
		tankGal: extra.tankGal ?? 15,
		usableGal: extra.usableGal ?? 14.5,
		epaCity: extra.epaCity ?? 22,
		epaHwy: extra.epaHwy ?? 28,
		epaComb: extra.epaComb ?? 24,
		ownedSince: extra.ownedSince || "",
		purchaseOdo: extra.purchaseOdo ?? null
	};
}
var DB_NAME = "fillcue";
var DB_VERSION = 4;
function requireIdb() {
	if (typeof indexedDB === "undefined") throw new Error("GarageBook storage needs a browser.");
	return indexedDB;
}
function openDb() {
	const idb = requireIdb();
	return new Promise((resolve, reject) => {
		const req = idb.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains("fills")) db.createObjectStore("fills", { keyPath: "id" }).createIndex("byDate", "date");
			if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings", { keyPath: "key" });
			if (!db.objectStoreNames.contains("jobs")) db.createObjectStore("jobs", { keyPath: "id" }).createIndex("byDate", "date");
			if (!db.objectStoreNames.contains("charges")) db.createObjectStore("charges", { keyPath: "id" }).createIndex("byDate", "date");
			if (!db.objectStoreNames.contains("vehicles")) db.createObjectStore("vehicles", { keyPath: "id" });
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error ?? /* @__PURE__ */ new Error("Could not open GarageBook storage"));
	});
}
function getAll(store) {
	return openDb().then((db) => new Promise((resolve, reject) => {
		const req = db.transaction(store, "readonly").objectStore(store).getAll();
		req.onsuccess = () => resolve(req.result || []);
		req.onerror = () => reject(req.error);
	}));
}
function put(store, row) {
	return openDb().then((db) => new Promise((resolve, reject) => {
		const t = db.transaction(store, "readwrite");
		t.objectStore(store).put(row);
		t.oncomplete = () => resolve(row);
		t.onerror = () => reject(t.error);
	}));
}
function del(store, id) {
	return openDb().then((db) => new Promise((resolve, reject) => {
		const t = db.transaction(store, "readwrite");
		t.objectStore(store).delete(id);
		t.oncomplete = () => resolve();
		t.onerror = () => reject(t.error);
	}));
}
async function getAllFills() {
	const rows = await getAll("fills");
	rows.sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.time || "").localeCompare(String(b.time || "")));
	return rows.map((r) => ({
		...r,
		vehicleId: r.vehicleId || "highlander"
	}));
}
function saveFill(fill) {
	return put("fills", fill);
}
function deleteFill(id) {
	return del("fills", id);
}
async function getAllJobs() {
	const rows = await getAll("jobs");
	rows.sort((a, b) => String(a.date).localeCompare(String(b.date)));
	return rows.map((r) => ({
		...r,
		vehicleId: r.vehicleId || "highlander"
	}));
}
function saveJob(job) {
	return put("jobs", job);
}
function deleteJob(id) {
	return del("jobs", id);
}
async function getAllCharges() {
	const rows = await getAll("charges");
	rows.sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.time || "").localeCompare(String(b.time || "")));
	return rows.map((r) => ({
		...r,
		vehicleId: r.vehicleId || "tesla"
	}));
}
function saveCharge(charge) {
	return put("charges", charge);
}
function deleteCharge(id) {
	return del("charges", id);
}
async function getAllVehicles() {
	const rows = await getAll("vehicles");
	rows.sort((a, b) => String(a.name).localeCompare(String(b.name)));
	return rows.map((r) => ({
		...r,
		vin: r.vin || "",
		ownedSince: r.ownedSince || "",
		purchaseOdo: r.purchaseOdo ?? null
	}));
}
function saveVehicle(vehicle) {
	return put("vehicles", vehicle);
}
function deleteVehicle(id) {
	return del("vehicles", id);
}
async function getSetting(key, fallback) {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const req = db.transaction("settings", "readonly").objectStore("settings").get(key);
		req.onsuccess = () => {
			const row = req.result;
			resolve(row ? row.value : fallback);
		};
		req.onerror = () => reject(req.error);
	});
}
async function setSetting(key, value) {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const t = db.transaction("settings", "readwrite");
		t.objectStore("settings").put({
			key,
			value
		});
		t.oncomplete = () => resolve(value);
		t.onerror = () => reject(t.error);
	});
}
function uid() {
	return crypto.randomUUID ? crypto.randomUUID() : `f${Date.now()}${Math.random().toString(16).slice(2)}`;
}
function clean(text) {
	return String(text || "").replace(/\u00a0/g, " ");
}
function num$1(s) {
	if (s == null) return null;
	const n = Number(String(s).replace(/,/g, "").replace(/[^\d.-]/g, ""));
	return Number.isFinite(n) ? n : null;
}
function pickDate(text) {
	const t = clean(text);
	const mdy = t.match(/\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})\b/);
	if (mdy) {
		let y = Number(mdy[3]);
		if (y < 100) y += 2e3;
		return `${y}-${String(mdy[1]).padStart(2, "0")}-${String(mdy[2]).padStart(2, "0")}`;
	}
	const iso = t.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
	return iso ? iso[0] : "";
}
function pickTime(text) {
	const m = clean(text).match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
	return m ? `${m[1].padStart(2, "0")}:${m[2]}` : "";
}
function parseReceipt(text) {
	const t = clean(text);
	const out = {
		kind: "receipt",
		station: "",
		city: "",
		pump: "",
		grade: "",
		gallons: null,
		pricePerGal: null,
		total: null,
		date: pickDate(t),
		time: pickTime(t),
		notes: ""
	};
	if (/aafes|army\s*&\s*air force|exchange\s*(gas|fuel)|shopette/i.test(t)) out.station = "AAFES Exchange";
	else if (/costco/i.test(t)) {
		const m = t.match(/costco[^\n]*#?\s*\d+/i);
		out.station = m ? m[0].replace(/\s+/g, " ").trim() : "Costco";
	} else {
		const first = t.split(/\n/).map((l) => l.trim()).find((l) => l && !/date|time|pump|gallon/i.test(l));
		if (first) out.station = first.slice(0, 48);
	}
	const city = t.match(/([A-Za-z .]+),\s*([A-Z]{2})\s+\d{5}/);
	if (city) out.city = `${city[1].trim()}, ${city[2]}`;
	const pump = t.match(/pump\s*#?\s*(\d+)/i);
	if (pump) out.pump = pump[1];
	if (/diesel/i.test(t)) out.grade = "Diesel";
	else if (/premium\s*93|93\s*octane/i.test(t)) out.grade = "Premium 93";
	else if (/premium\s*91|91\s*octane/i.test(t)) out.grade = "Premium 91";
	else if (/midgrade|89/i.test(t)) out.grade = "Midgrade 89";
	else if (/regular|87/i.test(t)) out.grade = "Regular 87";
	const gal = t.match(/gallons?\s*[:\s]*([0-9]+\.[0-9]+)/i) || t.match(/\b([0-9]+\.[0-9]{2,4})\s*gal/i);
	if (gal) out.gallons = num$1(gal[1]);
	const ppg = t.match(/price\s*[:\s]*\$?\s*([0-9]+\.[0-9]{2,3})/i);
	if (ppg) out.pricePerGal = num$1(ppg[1]);
	const tot = t.match(/(?:total sale|amount|total)\s*[:\s]*\$?\s*([0-9]+\.[0-9]{2})/i);
	if (tot) out.total = num$1(tot[1]);
	return out;
}
function parseCluster(text) {
	const t = clean(text);
	const out = {
		kind: "cluster",
		odometer: null,
		clusterRange: null,
		clusterAvgMph: null,
		outsideF: null,
		notes: ""
	};
	const odo = t.match(/\bODO\b\s*[:\s]*([0-9]{4,7})/i) || t.match(/odometer\s*[:\s]*([0-9]{4,7})/i);
	if (odo) out.odometer = num$1(odo[1]);
	const range = t.match(/\bRange\b\s*[:\s]*([0-9]{2,4})/i);
	if (range) out.clusterRange = num$1(range[1]);
	const mph = t.match(/(?:after\s*reset|avg)?\s*([0-9]{1,3})\s*MPH/i);
	if (mph) out.clusterAvgMph = num$1(mph[1]);
	const temp = t.match(/outside\s*([0-9]{1,3})\s*°?\s*F/i) || t.match(/\b([0-9]{2})\s*°F/);
	if (temp) out.outsideF = num$1(temp[1]);
	return out;
}
var SHOPS = [
	{
		re: /firestone/i,
		name: "Firestone"
	},
	{
		re: /jiffy\s*lube/i,
		name: "Jiffy Lube"
	},
	{
		re: /valvoline/i,
		name: "Valvoline"
	},
	{
		re: /pep\s*boys/i,
		name: "Pep Boys"
	},
	{
		re: /napa/i,
		name: "NAPA"
	},
	{
		re: /toyota/i,
		name: "Toyota"
	},
	{
		re: /tesla/i,
		name: "Tesla Service"
	}
];
var CATEGORY_RULES = [
	{
		re: /oil\s*change|0w-20|5w-30|synthetic\s*oil/i,
		category: "oil",
		label: "Oil change"
	},
	{
		re: /tire\s*rotation|rotate\s*tires/i,
		category: "rotation",
		label: "Tire rotation"
	},
	{
		re: /cabin\s*(air\s*)?filter/i,
		category: "cabin-filter",
		label: "Cabin air filter"
	},
	{
		re: /engine\s*air\s*filter|(?<!cabin\s)air\s*filter/i,
		category: "air-filter",
		label: "Engine air filter"
	},
	{
		re: /brake\s*fluid/i,
		category: "brake-fluid",
		label: "Brake fluid"
	},
	{
		re: /brake|rotor|pad/i,
		category: "brakes",
		label: "Brakes"
	},
	{
		re: /trans(mission)?|\batf\b|ws\s*fluid/i,
		category: "transmission",
		label: "Transmission"
	},
	{
		re: /coolant|antifreeze/i,
		category: "coolant",
		label: "Coolant"
	},
	{
		re: /spark\s*plug/i,
		category: "spark-plugs",
		label: "Spark plugs"
	},
	{
		re: /wiper/i,
		category: "wipers",
		label: "Wipers"
	},
	{
		re: /alignment/i,
		category: "alignment",
		label: "Alignment"
	},
	{
		re: /\btires?\b(?!\s*rotation)/i,
		category: "tires",
		label: "Tires"
	},
	{
		re: /batter/i,
		category: "battery",
		label: "Battery"
	},
	{
		re: /inspect/i,
		category: "inspection",
		label: "Inspection"
	}
];
function parseShopReceipt(text) {
	const t = clean(text);
	const out = {
		kind: "shop",
		shop: "",
		city: "",
		date: pickDate(t),
		odometer: null,
		total: null,
		category: "other",
		summary: ""
	};
	for (const s of SHOPS) if (s.re.test(t)) {
		out.shop = s.name;
		break;
	}
	const city = t.match(/([A-Za-z .]+),\s*([A-Z]{2})\s+\d{5}/);
	if (city) out.city = `${city[1].trim()}, ${city[2]}`;
	const odo = t.match(/(?:mileage|odometer|odo)\s*[:\s]*([0-9]{4,7})/i) || t.match(/\b([0-9]{5,7})\s*mi(?:les)?\b/i);
	if (odo) out.odometer = num$1(odo[1]);
	const amount = t.match(/(?:amount|total|balance)\s*[:\s]*\$?\s*([0-9]+\.[0-9]{2})/i);
	if (amount) out.total = num$1(amount[1]);
	const hits = CATEGORY_RULES.filter((r) => r.re.test(t));
	if (hits.length) {
		out.category = hits[0].category;
		out.summary = [...new Set(hits.map((h) => h.label))].join(", ");
	}
	return out;
}
function parseChargeReceipt(text) {
	const t = clean(text);
	const out = {
		kind: "charge",
		location: "Other",
		city: "",
		date: pickDate(t),
		time: pickTime(t),
		kwh: null,
		pricePerKwh: null,
		total: null,
		odometer: null
	};
	if (/supercharger/i.test(t)) out.location = "Supercharger";
	else if (/destination/i.test(t)) out.location = "Destination";
	else if (/home|wall\s*connector|tesla\s*wall/i.test(t)) out.location = "Home";
	else if (/work|office/i.test(t)) out.location = "Work";
	const city = t.match(/([A-Za-z .]+),\s*([A-Z]{2})\s+\d{5}/);
	if (city) out.city = `${city[1].trim()}, ${city[2]}`;
	const kwh = t.match(/([0-9]+(?:\.[0-9]+)?)\s*kwh/i);
	if (kwh) out.kwh = num$1(kwh[1]);
	const rate = t.match(/\$?\s*([0-9]+\.[0-9]{2,3})\s*\/\s*kwh/i);
	if (rate) out.pricePerKwh = num$1(rate[1]);
	const tot = t.match(/(?:total|amount)\s*[:\s]*\$?\s*([0-9]+\.[0-9]{2})/i);
	if (tot) out.total = num$1(tot[1]);
	const odo = t.match(/(?:odometer|odo|mileage)\s*[:\s]*([0-9]{4,7})/i);
	if (odo) out.odometer = num$1(odo[1]);
	return out;
}
function guessPhotoKind(text) {
	const t = clean(text);
	const r = [
		/costco/i,
		/gallons/i,
		/total sale/i,
		/pump/i,
		/regular/i,
		/aafes/i,
		/exchange/i
	].reduce((n, re) => n + (re.test(t) ? 1 : 0), 0);
	const c = [
		/\bODO\b/i,
		/\bRange\b/i,
		/After\s*Reset/i,
		/\bMPH\b/i
	].reduce((n, re) => n + (re.test(t) ? 1 : 0), 0);
	const s = [
		/oil\s*change/i,
		/tire\s*rotation/i,
		/invoice/i,
		/\blabor\b/i,
		/\bRO\b/,
		/repair\s*order/i,
		/firestone/i,
		/cabin\s*air/i
	].reduce((n, re) => n + (re.test(t) ? 1 : 0), 0);
	const e = [
		/kwh/i,
		/supercharger/i,
		/\$\s*[0-9.]+\s*\/\s*kwh/i,
		/wall\s*connector/i
	].reduce((n, re) => n + (re.test(t) ? 1 : 0), 0);
	if (c > r && c > s && c > e) return "cluster";
	if (e > r && e >= s) return "charge";
	if (s > r) return "shop";
	if (r > 0) return "receipt";
	return "unknown";
}
function mergeParse(receipt, cluster, extra = {}) {
	const str = (n) => n == null || n === "" ? "" : String(n);
	return {
		id: extra.id || "",
		date: receipt.date || extra.date || "",
		time: receipt.time || extra.time || "",
		station: receipt.station || extra.station || "",
		city: receipt.city || extra.city || "",
		pump: receipt.pump || extra.pump || "",
		grade: receipt.grade || extra.grade || "Regular 87",
		gallons: str(receipt.gallons ?? extra.gallons),
		pricePerGal: str(receipt.pricePerGal ?? extra.pricePerGal),
		total: str(receipt.total ?? extra.total),
		odometer: str(cluster.odometer ?? extra.odometer),
		clusterRange: str(cluster.clusterRange ?? extra.clusterRange),
		clusterAvgMph: str(cluster.clusterAvgMph ?? extra.clusterAvgMph),
		outsideF: str(cluster.outsideF ?? extra.outsideF),
		fillToFull: extra.fillToFull || "Yes",
		tripType: extra.tripType || "Mixed",
		notes: extra.notes || ""
	};
}
function mergeShopParse(shop, extra = {}) {
	const str = (n) => n == null || n === "" ? "" : String(n);
	return {
		id: extra.id || "",
		date: shop.date || extra.date || "",
		shop: shop.shop || extra.shop || "",
		city: shop.city || extra.city || "",
		odometer: str(shop.odometer ?? extra.odometer),
		total: str(shop.total ?? extra.total),
		category: shop.category || extra.category || "other",
		summary: shop.summary || extra.summary || "",
		status: extra.status || "done",
		dueDate: extra.dueDate || "",
		dueMiles: extra.dueMiles || "",
		notes: extra.notes || ""
	};
}
function mergeChargeParse(charge, extra = {}) {
	const str = (n) => n == null || n === "" ? "" : String(n);
	return {
		id: extra.id || "",
		date: charge.date || extra.date || "",
		time: charge.time || extra.time || "",
		location: charge.location || extra.location || "Other",
		city: charge.city || extra.city || "",
		kwh: str(charge.kwh ?? extra.kwh),
		pricePerKwh: str(charge.pricePerKwh ?? extra.pricePerKwh),
		total: str(charge.total ?? extra.total),
		odometer: str(charge.odometer ?? extra.odometer),
		notes: extra.notes || ""
	};
}
var workerPromise = null;
function loadScript(src) {
	return new Promise((resolve, reject) => {
		if (typeof document === "undefined") {
			reject(/* @__PURE__ */ new Error("OCR needs a browser."));
			return;
		}
		if ([...document.scripts].some((s) => s.src.includes("tesseract"))) {
			resolve();
			return;
		}
		const el = document.createElement("script");
		el.src = src;
		el.async = true;
		el.onload = () => resolve();
		el.onerror = () => reject(/* @__PURE__ */ new Error("Could not load the OCR engine. Connect once to cache it, then you can go offline."));
		document.head.appendChild(el);
	});
}
async function ensureOcr(onProgress) {
	if (typeof window === "undefined") throw new Error("OCR needs a browser.");
	if (window.Tesseract && workerPromise) return workerPromise;
	onProgress?.("Loading OCR engine…");
	await loadScript("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js");
	const Tess = window.Tesseract;
	if (!Tess) throw new Error("OCR engine did not start.");
	workerPromise = Tess.createWorker("eng", 1, { logger: (m) => {
		if (m.status === "recognizing text" && onProgress) onProgress(`Reading photo ${Math.round((m.progress || 0) * 100)}%`);
	} });
	const worker = await workerPromise;
	await worker.setParameters({
		tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#.,:$/°%+- ",
		preserve_interword_spaces: "1"
	});
	return worker;
}
function preprocessImage(file, maxW = 1600) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const url = URL.createObjectURL(file);
		img.onload = () => {
			const scale = Math.min(1, maxW / img.width);
			const w = Math.max(1, Math.round(img.width * scale));
			const h = Math.max(1, Math.round(img.height * scale));
			const canvas = document.createElement("canvas");
			canvas.width = w;
			canvas.height = h;
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				URL.revokeObjectURL(url);
				reject(/* @__PURE__ */ new Error("Could not prepare that image"));
				return;
			}
			ctx.drawImage(img, 0, 0, w, h);
			const data = ctx.getImageData(0, 0, w, h);
			const d = data.data;
			for (let i = 0; i < d.length; i += 4) {
				let y = .2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2];
				y = (y - 128) * 1.35 + 128;
				y = Math.max(0, Math.min(255, y));
				d[i] = d[i + 1] = d[i + 2] = y;
			}
			ctx.putImageData(data, 0, 0);
			URL.revokeObjectURL(url);
			resolve({ canvas });
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(/* @__PURE__ */ new Error("Could not read that image"));
		};
		img.src = url;
	});
}
async function recognizeFile(file, onProgress) {
	const pre = await preprocessImage(file);
	const worker = await ensureOcr(onProgress);
	onProgress?.("Reading photo…");
	const result = await worker.recognize(pre.canvas);
	return {
		text: result.data?.text || "",
		confidence: result.data?.confidence || 0,
		canvas: pre.canvas
	};
}
function enrich(fills, settings) {
	const rows = fills.map((f) => ({
		...f,
		milesThisTank: null,
		mpg: null,
		costPerMile: null
	}));
	for (let i = 0; i < rows.length; i++) {
		const cur = rows[i];
		const prev = i > 0 ? rows[i - 1] : null;
		const gal = Number(cur.gallons);
		const total = Number(cur.total);
		const odo = Number(cur.odometer);
		const prevOdo = prev ? Number(prev.odometer) : NaN;
		cur.milesThisTank = Number.isFinite(odo) && Number.isFinite(prevOdo) ? odo - prevOdo : null;
		cur.mpg = cur.milesThisTank && gal ? cur.milesThisTank / gal : null;
		cur.costPerMile = cur.milesThisTank && total ? total / cur.milesThisTank : null;
	}
	const gallons = rows.reduce((s, r) => s + (Number(r.gallons) || 0), 0);
	const spent = rows.reduce((s, r) => s + (Number(r.total) || 0), 0);
	const mpgVals = rows.map((r) => r.mpg).filter((n) => n != null && Number.isFinite(n) && n > 0 && n < 80);
	const avgMpg = mpgVals.length ? mpgVals.reduce((a, b) => a + b, 0) / mpgVals.length : null;
	const last = rows[rows.length - 1] || null;
	const usable = Number(settings.usableGal) || 18.5;
	const epa = Number(settings.epaComb) || 20;
	const rangeEst = (avgMpg || epa) * usable;
	return {
		rows,
		gallons,
		spent,
		avgMpg,
		avgPpg: gallons ? spent / gallons : null,
		last,
		rangeEst,
		settings
	};
}
function money(n, d = 2) {
	if (n == null || Number.isNaN(Number(n))) return "—";
	return Number(n).toLocaleString("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: d,
		maximumFractionDigits: d
	});
}
function fmt(n, d = 1) {
	if (n == null || Number.isNaN(Number(n))) return "—";
	return Number(n).toLocaleString("en-US", {
		maximumFractionDigits: d,
		minimumFractionDigits: d
	});
}
function inPeriod(date, since) {
	if (!since) return true;
	return String(date || "") >= since;
}
function summarizeOwnership(settings, fills, jobs, charges, today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
	const since = settings.ownedSince || "";
	const fuel = fills.filter((f) => inPeriod(f.date, since));
	const shop = jobs.filter((j) => j.status === "done" && inPeriod(j.date, since));
	const energy = charges.filter((c) => inPeriod(c.date, since));
	const stats = enrich(fuel, settings);
	const odoNums = [
		...fuel.map((f) => f.odometer),
		...shop.map((j) => j.odometer),
		...energy.map((c) => c.odometer)
	].filter((n) => n != null && Number.isFinite(n) && n > 0);
	const currentOdo = odoNums.length ? Math.max(...odoNums) : null;
	const firstOdo = odoNums.length ? Math.min(...odoNums) : null;
	const purchaseOdo = settings.purchaseOdo != null && Number.isFinite(settings.purchaseOdo) ? settings.purchaseOdo : null;
	const milesOwned = currentOdo != null && purchaseOdo != null && currentOdo > purchaseOdo ? currentOdo - purchaseOdo : currentOdo != null && firstOdo != null && currentOdo > firstOdo ? currentOdo - firstOdo : null;
	const dates = [
		...fuel.map((f) => f.date),
		...shop.map((j) => j.date),
		...energy.map((c) => c.date)
	].filter(Boolean);
	dates.sort();
	const periodStart = since || dates[0] || today;
	const periodEnd = dates[dates.length - 1] || today;
	const gallons = stats.gallons;
	const fuelSpend = stats.spent;
	const kwh = energy.reduce((s, c) => s + (Number(c.kwh) || 0), 0);
	const energySpend = energy.reduce((s, c) => s + (Number(c.total) || 0), 0);
	const shopSpend = shop.reduce((s, j) => s + (Number(j.total) || 0), 0);
	const byCat = /* @__PURE__ */ new Map();
	for (const j of shop) {
		const id = j.category || "other";
		const row = byCat.get(id) || {
			category: id,
			label: SERVICE_CATEGORIES.find((c) => c.id === id)?.label || id,
			spend: 0,
			count: 0
		};
		row.spend += Number(j.total) || 0;
		row.count += 1;
		byCat.set(id, row);
	}
	const shopByCategory = [...byCat.values()].sort((a, b) => b.spend - a.spend);
	const operatingTotal = fuelSpend + energySpend + shopSpend;
	const costPerMile = milesOwned && milesOwned > 0 ? operatingTotal / milesOwned : null;
	const sortedCharges = [...energy].filter((c) => c.odometer != null && Number.isFinite(c.odometer)).sort((a, b) => Number(a.odometer) - Number(b.odometer));
	let driveMiles = 0;
	let driveKwh = 0;
	for (let i = 1; i < sortedCharges.length; i++) {
		const miles = Number(sortedCharges[i].odometer) - Number(sortedCharges[i - 1].odometer);
		const k = Number(sortedCharges[i].kwh) || 0;
		if (miles > 0 && k > 0) {
			driveMiles += miles;
			driveKwh += k;
		}
	}
	const miPerKwh = driveKwh > 0 ? driveMiles / driveKwh : null;
	return {
		vehicle: settings.vehicle,
		vehicleId: settings.activeVehicleId,
		vin: settings.vin || "",
		powertrain: settings.powertrain,
		ownedSince: since,
		purchaseOdo,
		currentOdo,
		milesOwned,
		periodStart,
		periodEnd,
		gallons,
		fuelSpend,
		fillCount: fuel.length,
		avgMpg: stats.avgMpg,
		kwh,
		energySpend,
		chargeCount: energy.length,
		miPerKwh,
		shopSpend,
		jobCount: shop.length,
		shopByCategory,
		operatingTotal,
		costPerMile
	};
}
var DUE_DISCLAIMER_SHORT = "Not the manufacturer’s maintenance schedule. These are unofficial estimates from this log — confirm in the owner’s manual.";
var DUE_DISCLAIMER_FULL = "GarageBook due dates and service hints are unofficial estimates. They use generic intervals by powertrain (gas, hybrid, plug-in, EV) plus the odometer and shop jobs you log on this device. They are not Toyota’s, Tesla’s, Honda’s, or any other manufacturer’s recommended maintenance schedule, warranty requirement, or a substitute for the owner’s manual, a dealer, or a qualified technician. Severe use (towing, heat, dust, short trips) can come due sooner. Follow the vehicle maker’s instructions.";
var ICE = [
	{
		category: "oil",
		title: "Oil change",
		miles: 5e3,
		months: 6,
		hint: "0W-20, 5k miles or 6 months"
	},
	{
		category: "rotation",
		title: "Tire rotation",
		miles: 7500,
		months: 6,
		hint: "Every 7,500 miles"
	},
	{
		category: "cabin-filter",
		title: "Cabin air filter",
		miles: 15e3,
		months: 12,
		hint: "Dusty El Paso air clogs these fast"
	},
	{
		category: "air-filter",
		title: "Engine air filter",
		miles: 3e4,
		months: 24,
		hint: "Inspect at 15k in desert dust"
	},
	{
		category: "brakes",
		title: "Brake inspection",
		miles: 15e3,
		months: 12,
		hint: "Pads and rotors"
	},
	{
		category: "brake-fluid",
		title: "Brake fluid",
		miles: 3e4,
		months: 36,
		hint: "Toyota 3-year flush"
	},
	{
		category: "transmission",
		title: "ATF service",
		miles: 1e5,
		months: 60,
		hint: "Highlander WS fluid"
	},
	{
		category: "coolant",
		title: "Coolant",
		miles: 1e5,
		months: 120,
		hint: "SLLC, 100k / 10 years"
	},
	{
		category: "spark-plugs",
		title: "Spark plugs",
		miles: 12e4,
		months: null,
		hint: "Iridium, 120k"
	},
	{
		category: "inspection",
		title: "State inspection",
		miles: null,
		months: 12,
		hint: "Texas safety / emissions"
	}
];
var EV = [
	{
		category: "rotation",
		title: "Tire rotation",
		miles: 6250,
		months: 6,
		hint: "Model 3 eats rear tires"
	},
	{
		category: "cabin-filter",
		title: "Cabin filter",
		miles: 2e4,
		months: 24,
		hint: "HEPA / carbon, 2 years"
	},
	{
		category: "brake-fluid",
		title: "Brake fluid",
		miles: null,
		months: 24,
		hint: "Tesla 2-year flush"
	},
	{
		category: "tires",
		title: "Tire wear check",
		miles: 25e3,
		months: 12,
		hint: "Heavy EV, watch inner shoulders"
	},
	{
		category: "inspection",
		title: "Annual check",
		miles: null,
		months: 12,
		hint: "Coolant, brakes, alignment"
	}
];
var HYBRID = ICE.map((iv) => {
	if (iv.category === "oil") return {
		...iv,
		hint: "0W-16 / 0W-20 — 10k on many hybrids, 5k in desert heat or towing"
	};
	if (iv.category === "coolant") return {
		...iv,
		hint: "Engine + inverter coolant"
	};
	return iv;
});
function intervalsFor(powertrain) {
	if (powertrain === "ev") return EV;
	if (powertrain === "hybrid" || powertrain === "phev") return HYBRID;
	return ICE;
}
function currentOdometer(fills, jobs, charges = []) {
	const nums = [
		...fills.map((f) => f.odometer),
		...jobs.map((j) => j.odometer),
		...charges.map((c) => c.odometer)
	].filter((n) => n != null && Number.isFinite(n) && n > 0);
	return nums.length ? Math.max(...nums) : null;
}
function addMonths(iso, months) {
	const d = /* @__PURE__ */ new Date(`${iso}T12:00:00`);
	if (Number.isNaN(d.getTime())) return iso;
	d.setMonth(d.getMonth() + months);
	return d.toISOString().slice(0, 10);
}
function daysBetween(from, to) {
	const a = (/* @__PURE__ */ new Date(`${from}T12:00:00`)).getTime();
	const b = (/* @__PURE__ */ new Date(`${to}T12:00:00`)).getTime();
	return Math.round((b - a) / 864e5);
}
function rank(status) {
	if (status === "overdue") return 0;
	if (status === "due") return 1;
	if (status === "soon") return 2;
	return 3;
}
function recommend(powertrain, fills, jobs, today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), charges = []) {
	const odo = currentOdometer(fills, jobs, charges);
	const intervals = intervalsFor(powertrain);
	const done = jobs.filter((j) => j.status === "done");
	const scheduled = jobs.filter((j) => j.status === "scheduled");
	const rows = intervals.map((iv) => {
		const last = [...done].reverse().find((j) => j.category === iv.category) ?? null;
		const plan = [...scheduled].reverse().find((j) => j.category === iv.category) ?? null;
		let dueMiles = null;
		let dueDate = null;
		if (plan?.dueMiles != null) dueMiles = plan.dueMiles;
		else if (last?.odometer != null && iv.miles != null) dueMiles = last.odometer + iv.miles;
		else if (odo != null && iv.miles != null && !last) dueMiles = iv.miles;
		if (plan?.dueDate) dueDate = plan.dueDate;
		else if (last?.date && iv.months != null) dueDate = addMonths(last.date, iv.months);
		else if (!last && iv.months != null) dueDate = today;
		const milesLeft = dueMiles != null && odo != null ? dueMiles - odo : null;
		const daysLeft = dueDate ? daysBetween(today, dueDate) : null;
		let status = "ok";
		if (milesLeft != null && milesLeft < 0 || daysLeft != null && daysLeft < 0) status = "overdue";
		else if (milesLeft != null && milesLeft <= 500 || daysLeft != null && daysLeft <= 14) status = "due";
		else if (milesLeft != null && milesLeft <= 1500 || daysLeft != null && daysLeft <= 45) status = "soon";
		if (!last && !plan) {
			if (iv.miles != null && odo != null && odo >= iv.miles) status = "overdue";
			else if (iv.months != null) status = status === "ok" ? "due" : status;
		}
		const detailParts = [];
		if (!last) detailParts.push("Nothing in the log yet");
		else detailParts.push(`Last ${last.date}${last.odometer ? ` @ ${last.odometer.toLocaleString("en-US")} mi` : ""}`);
		if (milesLeft != null) detailParts.push(milesLeft >= 0 ? `${milesLeft.toLocaleString("en-US")} mi left` : `${Math.abs(milesLeft).toLocaleString("en-US")} mi overdue`);
		if (daysLeft != null) detailParts.push(daysLeft >= 0 ? `${daysLeft} days` : `${Math.abs(daysLeft)} days overdue`);
		return {
			id: iv.category,
			category: iv.category,
			title: iv.title,
			detail: detailParts.join(" · "),
			hint: iv.hint,
			status,
			milesLeft,
			daysLeft,
			dueMiles,
			dueDate,
			lastDate: last?.date ?? null,
			lastOdo: last?.odometer ?? null,
			scheduled: Boolean(plan)
		};
	});
	const extras = scheduled.filter((j) => !intervals.some((iv) => iv.category === j.category));
	for (const plan of extras) {
		const milesLeft = plan.dueMiles != null && odo != null ? plan.dueMiles - odo : null;
		const daysLeft = plan.dueDate ? daysBetween(today, plan.dueDate) : null;
		let status = "soon";
		if (milesLeft != null && milesLeft < 0 || daysLeft != null && daysLeft < 0) status = "overdue";
		else if (milesLeft != null && milesLeft <= 500 || daysLeft != null && daysLeft <= 14) status = "due";
		rows.push({
			id: plan.id,
			category: plan.category,
			title: plan.summary || plan.category,
			detail: [
				plan.shop,
				plan.dueDate,
				plan.dueMiles ? `${plan.dueMiles.toLocaleString("en-US")} mi` : ""
			].filter(Boolean).join(" · "),
			hint: "You scheduled this",
			status,
			milesLeft,
			daysLeft,
			dueMiles: plan.dueMiles,
			dueDate: plan.dueDate || null,
			lastDate: null,
			lastOdo: null,
			scheduled: true
		});
	}
	return rows.sort((a, b) => rank(a.status) - rank(b.status) || (a.milesLeft ?? 9e9) - (b.milesLeft ?? 9e9));
}
var E = "&";
function esc(s) {
	return String(s).replace(/&/g, `${E}amp;`).replace(/</g, `${E}lt;`).replace(/>/g, `${E}gt;`).replace(/"/g, `${E}quot;`);
}
function strCell(v) {
	if (v == null || v === "") return `<Cell><Data ss:Type="String"></Data></Cell>`;
	return `<Cell><Data ss:Type="String">${esc(String(v))}</Data></Cell>`;
}
function numCell(v) {
	if (v == null || Number.isNaN(Number(v))) return `<Cell><Data ss:Type="String"></Data></Cell>`;
	return `<Cell ss:StyleID="num"><Data ss:Type="Number">${Number(v)}</Data></Cell>`;
}
function moneyCell(v) {
	if (v == null || Number.isNaN(Number(v))) return `<Cell><Data ss:Type="String"></Data></Cell>`;
	return `<Cell ss:StyleID="usd"><Data ss:Type="Number">${Number(v)}</Data></Cell>`;
}
function row(cells) {
	return `<Row>${cells.join("")}</Row>`;
}
function kv(label, value) {
	return row([strCell(label), strCell(value)]);
}
function kvNum(label, value, money = false) {
	return row([strCell(label), money ? moneyCell(value) : numCell(value)]);
}
function sheet(name, rowsXml, colCount) {
	const cols = Array.from({ length: colCount }, () => `<Column ss:AutoFitWidth="1" ss:Width="90"/>`).join("");
	return `<Worksheet ss:Name="${esc(name)}"><Table>${cols}${rowsXml}</Table></Worksheet>`;
}
function header(labels) {
	return `<Row ss:StyleID="head">${labels.map((l) => strCell(l)).join("")}</Row>`;
}
function ownershipWorkbook(settings, fills, jobs, charges, today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)) {
	const summary = summarizeOwnership(settings, fills, jobs, charges, today);
	const stats = enrich(fills.filter((f) => !settings.ownedSince || f.date >= settings.ownedSince), settings);
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
		kv("Note", "Totals only include what is saved in GarageBook from the owned-since date. Backfill older fills, charges, and shop visits for a full ownership picture. Scheduled (not done) shop jobs are omitted from spend."),
		kv("Due dates", DUE_DISCLAIMER_FULL)
	].join("");
	const fuelRows = [header([
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
		"Notes"
	]), ...stats.rows.map((r) => row([
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
		strCell(r.notes)
	]))].join("");
	const inPeriod = (d) => !settings.ownedSince || d >= settings.ownedSince;
	const chargeRows = [header([
		"Date",
		"Time",
		"Location",
		"City",
		"kWh",
		"$/kWh",
		"Total $",
		"Odometer",
		"Notes"
	]), ...charges.filter((c) => inPeriod(c.date)).map((c) => row([
		strCell(c.date),
		strCell(c.time),
		strCell(c.location),
		strCell(c.city),
		numCell(c.kwh),
		moneyCell(c.pricePerKwh),
		moneyCell(c.total),
		numCell(c.odometer),
		strCell(c.notes)
	]))].join("");
	const shopRows = [header([
		"Date",
		"Shop",
		"City",
		"Category",
		"Summary",
		"Status",
		"Odometer",
		"Total $",
		"Due date",
		"Due miles",
		"Notes"
	]), ...jobs.filter((j) => inPeriod(j.date)).map((j) => row([
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
		strCell(j.notes)
	]))].join("");
	return {
		xml: `<?xml version="1.0"?>
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
</Workbook>`,
		filename: `garagebook-${(settings.activeVehicleId || "vehicle").replace(/[^a-z0-9-]+/gi, "-")}-ownership.xls`,
		summary
	};
}
/** VIN is optional. Empty is fine. A complete VIN is 17 chars, no I / O / Q. */
function normalizeVin(raw) {
	return String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17);
}
function isCompleteVin(vin) {
	return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
}
function vinHint(vin) {
	if (!vin) return null;
	if (/[IOQ]/.test(vin)) return "VIN never uses I, O, or Q";
	if (vin.length < 17) return `${vin.length} of 17 characters — optional until you have it`;
	return null;
}
function vinTail(vin) {
	const n = normalizeVin(vin);
	if (n.length < 4) return n;
	return n.slice(-6);
}
function download(blob, name) {
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = name;
	a.click();
	setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}
function normalizeSettings(saved) {
	const base = saved ? {
		...DEFAULT_SETTINGS,
		...saved
	} : { ...DEFAULT_SETTINGS };
	if (!base.activeVehicleId) base.activeVehicleId = "highlander";
	if (!base.powertrain || ![
		"ice",
		"hybrid",
		"phev",
		"ev"
	].includes(base.powertrain)) base.powertrain = base.activeVehicleId === "tesla" ? "ev" : "ice";
	if (!base.ownedSince) base.ownedSince = "";
	if (base.purchaseOdo != null && !Number.isFinite(Number(base.purchaseOdo))) base.purchaseOdo = null;
	base.vin = normalizeVin(base.vin || "");
	return base;
}
function defaultMode(powertrain) {
	return coerceCaptureMode(powertrain, powertrain === "ev" ? "charge" : "fuel");
}
function captureFor(powertrain) {
	return {
		captureMode: defaultMode(powertrain),
		logFilter: defaultMode(powertrain) === "charge" ? "charge" : "fuel",
		draft: emptyDraft(),
		serviceDraft: emptyServiceDraft(),
		chargeDraft: emptyChargeDraft(),
		receipt: {
			text: "",
			preview: ""
		},
		cluster: {
			text: "",
			preview: ""
		},
		shopPreview: ""
	};
}
async function persistActive(settings) {
	await setSetting("vehicle", settings);
	await setSetting("activeVehicleId", settings.activeVehicleId);
}
async function seedVehiclesIfNeeded(saved) {
	const existing = await getAllVehicles();
	if (existing.length) return existing;
	const byId = /* @__PURE__ */ new Map();
	const current = vehicleFromSettings(saved);
	byId.set(current.id, current);
	for (const preset of VEHICLE_PRESETS) {
		if (byId.has(preset.id)) continue;
		const extra = await getSetting(`vehicle:${preset.id}`, null);
		byId.set(preset.id, extra ? vehicleFromSettings(normalizeSettings({
			...presetToLoose(preset),
			...extra,
			activeVehicleId: preset.id
		})) : vehicleFromPreset(preset));
	}
	const seeded = [...byId.values()];
	for (const v of seeded) await saveVehicle(v);
	return seeded;
}
function presetToLoose(preset) {
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
		vin: ""
	};
}
var useFillcue = create((set, get) => ({
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
	receipt: {
		text: "",
		preview: ""
	},
	cluster: {
		text: "",
		preview: ""
	},
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
	ownership: () => summarizeOwnership(get().settings, get().activeFills(), get().activeJobs(), get().activeCharges()),
	hydrate: async () => {
		try {
			const snapshot = normalizeSettings(await getSetting("vehicle", null));
			const vehicles = await seedVehiclesIfNeeded(snapshot);
			const activeId = snapshot.activeVehicleId;
			const settings = settingsFromVehicle(vehicles.find((v) => v.id === activeId) || vehicles[0] || vehicleFromSettings(snapshot));
			await persistActive(settings);
			let fills = await getAllFills();
			const seeded = await getSetting("seeded", false);
			if (!fills.length && !seeded) {
				await saveFill(SEED_FILL);
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
				...captureFor(settings.powertrain)
			});
		} catch (err) {
			set({
				ready: true,
				error: err instanceof Error ? err.message : "Could not open on-device storage."
			});
		}
	},
	setDraft: (patch) => set((s) => ({ draft: {
		...s.draft,
		...patch
	} })),
	setServiceDraft: (patch) => set((s) => ({ serviceDraft: {
		...s.serviceDraft,
		...patch
	} })),
	setChargeDraft: (patch) => set((s) => ({ chargeDraft: {
		...s.chargeDraft,
		...patch
	} })),
	setCaptureMode: (mode) => set({ captureMode: coerceCaptureMode(get().settings.powertrain, mode) }),
	setLogFilter: (f) => set({ logFilter: f }),
	resetDraft: () => set({
		draft: emptyDraft(),
		receipt: {
			text: "",
			preview: ""
		},
		cluster: {
			text: "",
			preview: ""
		},
		ocrProgress: 0,
		ocrStatus: "Waiting for a photo.",
		captureMode: defaultMode(get().settings.powertrain)
	}),
	resetServiceDraft: () => set({
		serviceDraft: emptyServiceDraft(),
		shopPreview: "",
		receipt: {
			text: "",
			preview: ""
		},
		ocrProgress: 0,
		ocrStatus: "Waiting for a shop receipt.",
		captureMode: "shop"
	}),
	resetChargeDraft: () => set({
		chargeDraft: emptyChargeDraft(),
		receipt: {
			text: "",
			preview: ""
		},
		shopPreview: "",
		ocrProgress: 0,
		ocrStatus: "Waiting for a charge receipt.",
		captureMode: "charge"
	}),
	openFill: (id) => {
		const fill = get().fills.find((f) => f.id === id);
		if (!fill) return;
		set({
			captureMode: "fuel",
			draft: fillToDraft(fill),
			receipt: {
				text: fill.receiptText || "",
				preview: fill.receiptScan || ""
			},
			cluster: {
				text: fill.clusterText || "",
				preview: fill.clusterScan || ""
			},
			ocrStatus: fill.receiptScan || fill.clusterScan ? "Editing a saved fill. Scan is on this device." : "Editing a saved fill.",
			ocrProgress: 100
		});
	},
	openJob: (id) => {
		const job = get().jobs.find((j) => j.id === id);
		if (!job) return;
		set({
			captureMode: "shop",
			serviceDraft: jobToDraft(job),
			receipt: {
				text: job.receiptText || "",
				preview: job.receiptScan || ""
			},
			shopPreview: job.receiptScan || "",
			ocrStatus: job.receiptScan ? "Editing a saved job. Scan is on this device." : "Editing a saved job.",
			ocrProgress: 100
		});
	},
	openCharge: (id) => {
		const charge = get().charges.find((c) => c.id === id);
		if (!charge) return;
		set({
			captureMode: "charge",
			chargeDraft: chargeToDraft(charge),
			receipt: {
				text: charge.receiptText || "",
				preview: charge.receiptScan || ""
			},
			shopPreview: charge.receiptScan || "",
			ocrStatus: charge.receiptScan ? "Editing a saved charge. Scan is on this device." : "Editing a saved charge.",
			ocrProgress: 100
		});
	},
	scheduleFrom: (patch) => {
		set({
			captureMode: "shop",
			serviceDraft: emptyServiceDraft({
				status: "scheduled",
				...patch
			}),
			ocrStatus: "Schedule this service.",
			ocrProgress: 0
		});
	},
	saveDraft: async () => {
		const { draft, receipt, cluster, settings, fills } = get();
		if (!draft.date) {
			set({ ocrStatus: "Add a date before saving." });
			throw new Error("Add a date before saving.");
		}
		const prev = fills.find((f) => f.id === draft.id);
		await saveFill(draftToFill({
			...draft,
			id: draft.id || uid()
		}, {
			receiptText: receipt.text,
			clusterText: cluster.text,
			receiptScan: receipt.preview || prev?.receiptScan || "",
			clusterScan: cluster.preview || prev?.clusterScan || "",
			vehicleId: settings.activeVehicleId
		}));
		set({
			fills: await getAllFills(),
			draft: emptyDraft(),
			receipt: {
				text: "",
				preview: ""
			},
			cluster: {
				text: "",
				preview: ""
			}
		});
	},
	saveServiceDraft: async () => {
		const { serviceDraft, receipt, settings, jobs } = get();
		if (!serviceDraft.date) {
			set({ ocrStatus: "Add a date before saving." });
			throw new Error("Add a date before saving.");
		}
		const prev = jobs.find((j) => j.id === serviceDraft.id);
		await saveJob(draftToJob({
			...serviceDraft,
			id: serviceDraft.id || uid()
		}, {
			receiptText: receipt.text,
			receiptScan: receipt.preview || prev?.receiptScan || "",
			vehicleId: settings.activeVehicleId
		}));
		set({
			jobs: await getAllJobs(),
			serviceDraft: emptyServiceDraft(),
			receipt: {
				text: "",
				preview: ""
			},
			shopPreview: ""
		});
	},
	saveChargeDraft: async () => {
		const { chargeDraft, receipt, settings, charges } = get();
		if (!chargeDraft.date) {
			set({ ocrStatus: "Add a date before saving." });
			throw new Error("Add a date before saving.");
		}
		const prev = charges.find((c) => c.id === chargeDraft.id);
		await saveCharge(draftToCharge({
			...chargeDraft,
			id: chargeDraft.id || uid()
		}, {
			receiptText: receipt.text,
			receiptScan: receipt.preview || prev?.receiptScan || "",
			vehicleId: settings.activeVehicleId
		}));
		set({
			charges: await getAllCharges(),
			chargeDraft: emptyChargeDraft(),
			receipt: {
				text: "",
				preview: ""
			},
			shopPreview: ""
		});
	},
	removeFill: async (id) => {
		await deleteFill(id);
		set({ fills: await getAllFills() });
		get().resetDraft();
	},
	removeJob: async (id) => {
		await deleteJob(id);
		set({ jobs: await getAllJobs() });
		get().resetServiceDraft();
	},
	removeCharge: async (id) => {
		await deleteCharge(id);
		set({ charges: await getAllCharges() });
		get().resetChargeDraft();
	},
	saveSettings: async (next) => {
		const currentId = get().settings.activeVehicleId;
		const settings = normalizeSettings({
			...next,
			activeVehicleId: currentId,
			vin: normalizeVin(next.vin || "")
		});
		await saveVehicle(vehicleFromSettings(settings));
		await persistActive(settings);
		const vehicles = await getAllVehicles();
		const mode = get().captureMode;
		set({
			settings,
			vehicles,
			captureMode: coerceCaptureMode(settings.powertrain, mode)
		});
	},
	selectVehicle: async (id) => {
		const found = get().vehicles.find((v) => v.id === id);
		if (!found) return;
		const settings = settingsFromVehicle(found);
		await persistActive(settings);
		set({
			settings,
			...captureFor(found.powertrain)
		});
	},
	addVehicle: async (input = {}) => {
		const { fromPresetId, ...rest } = input;
		const preset = VEHICLE_PRESETS.find((p) => p.id === fromPresetId);
		const record = preset ? vehicleFromPreset(preset, {
			...rest,
			id: rest.id || uid()
		}) : blankVehicle({
			...rest,
			id: rest.id || uid()
		});
		record.vin = normalizeVin(record.vin || "");
		await saveVehicle(record);
		const vehicles = await getAllVehicles();
		const settings = settingsFromVehicle(record);
		await persistActive(settings);
		set({
			vehicles,
			settings,
			...captureFor(record.powertrain)
		});
		return record;
	},
	removeVehicle: async (id) => {
		const { vehicles, settings } = get();
		if (vehicles.length <= 1) throw new Error("Keep at least one vehicle in the garage.");
		await deleteVehicle(id);
		const remaining = await getAllVehicles();
		const next = settings.activeVehicleId === id ? remaining[0] : remaining.find((v) => v.id === settings.activeVehicleId) || remaining[0];
		const nextSettings = settingsFromVehicle(next);
		await persistActive(nextSettings);
		set({
			vehicles: remaining,
			settings: nextSettings,
			...settings.activeVehicleId === id ? captureFor(next.powertrain) : {}
		});
	},
	applyPreset: async (preset) => {
		const existing = get().vehicles.find((v) => v.id === preset.id);
		if (existing) {
			await get().selectVehicle(existing.id);
			return;
		}
		await get().addVehicle({
			fromPresetId: preset.id,
			id: preset.id,
			name: preset.name
		});
	},
	applyOcrText: (text, slot) => {
		const kind = slot === "auto" ? guessPhotoKind(text) : slot;
		const { draft, receipt, cluster, serviceDraft, chargeDraft } = get();
		if (kind === "cluster") {
			const parsed = mergeParse(parseReceipt(receipt.text), parseCluster(text), draft);
			set({
				cluster: {
					text,
					preview: cluster.preview
				},
				draft: parsed,
				captureMode: "fuel",
				ocrProgress: 100,
				ocrStatus: "Check the fields before saving."
			});
			return;
		}
		if (kind === "shop") {
			const parsed = mergeShopParse(parseShopReceipt(text), serviceDraft);
			set({
				receipt: {
					text,
					preview: receipt.preview
				},
				serviceDraft: parsed,
				captureMode: "shop",
				ocrProgress: 100,
				ocrStatus: "Check the shop fields before saving."
			});
			return;
		}
		if (kind === "charge") {
			const parsed = mergeChargeParse(parseChargeReceipt(text), chargeDraft);
			set({
				receipt: {
					text,
					preview: receipt.preview
				},
				chargeDraft: parsed,
				captureMode: "charge",
				ocrProgress: 100,
				ocrStatus: "Check the charge fields before saving."
			});
			return;
		}
		const parsed = mergeParse(parseReceipt(text), parseCluster(cluster.text), draft);
		set({
			receipt: {
				text,
				preview: receipt.preview
			},
			draft: parsed,
			captureMode: "fuel",
			ocrProgress: 100,
			ocrStatus: kind === "unknown" ? "Could not tell receipt from cluster — check the fields." : "Check the fields before saving."
		});
	},
	handlePhoto: async (file, slot) => {
		set({
			ocrBusy: true,
			ocrProgress: 8,
			ocrStatus: "Preparing photo…"
		});
		try {
			const rec = await recognizeFile(file, (m) => set({
				ocrProgress: 40,
				ocrStatus: m
			}));
			const kind = slot === "auto" ? guessPhotoKind(rec.text) : slot;
			const scan = encodeScan(rec.canvas, kind === "cluster" ? "cluster" : "document");
			const { draft, receipt, cluster, serviceDraft, chargeDraft } = get();
			if (kind === "cluster") {
				const parsed = mergeParse(parseReceipt(receipt.text), parseCluster(rec.text), draft);
				set({
					cluster: {
						text: rec.text,
						preview: scan
					},
					draft: parsed,
					captureMode: "fuel",
					ocrProgress: 100,
					ocrStatus: "Check the fields before saving. Scan stays on this device.",
					ocrBusy: false
				});
			} else if (kind === "shop") {
				const parsed = mergeShopParse(parseShopReceipt(rec.text), serviceDraft);
				set({
					receipt: {
						text: rec.text,
						preview: scan
					},
					shopPreview: scan,
					serviceDraft: parsed,
					captureMode: "shop",
					ocrProgress: 100,
					ocrStatus: "Check the shop fields before saving. Scan stays on this device.",
					ocrBusy: false
				});
			} else if (kind === "charge") {
				const parsed = mergeChargeParse(parseChargeReceipt(rec.text), chargeDraft);
				set({
					receipt: {
						text: rec.text,
						preview: scan
					},
					shopPreview: scan,
					chargeDraft: parsed,
					captureMode: "charge",
					ocrProgress: 100,
					ocrStatus: "Check the charge fields before saving. Scan stays on this device.",
					ocrBusy: false
				});
			} else {
				const parsed = mergeParse(parseReceipt(rec.text), parseCluster(cluster.text), draft);
				set({
					receipt: {
						text: rec.text,
						preview: scan
					},
					draft: parsed,
					captureMode: "fuel",
					ocrProgress: 100,
					ocrStatus: kind === "unknown" ? "Could not tell receipt from cluster — check the fields." : "Check the fields before saving. Scan stays on this device.",
					ocrBusy: false
				});
			}
		} catch (err) {
			set({
				ocrBusy: false,
				ocrProgress: 0,
				ocrStatus: err instanceof Error ? err.message : String(err)
			});
			throw err;
		}
	},
	exportJson: () => {
		const { settings, vehicles, fills, jobs, charges } = get();
		download(new Blob([JSON.stringify({
			settings,
			vehicles,
			fills,
			jobs,
			charges
		}, null, 2)], { type: "application/json" }), "garagebook-backup.json");
	},
	exportSpreadsheet: () => {
		const { settings } = get();
		const { xml, filename } = ownershipWorkbook(settings, get().activeFills(), get().activeJobs(), get().activeCharges());
		download(new Blob([xml], { type: "application/vnd.ms-excel" }), filename);
	},
	importJson: async (file) => {
		const data = JSON.parse(await file.text());
		if (Array.isArray(data.vehicles) && data.vehicles.length) {
			for (const v of data.vehicles) if (v?.id) await saveVehicle({
				...v,
				vin: normalizeVin(v.vin || "")
			});
		} else if (data.settings) await saveVehicle(vehicleFromSettings(normalizeSettings(data.settings)));
		if (data.settings) {
			const next = normalizeSettings(data.settings);
			await persistActive(next);
			set({ settings: next });
		}
		let n = 0;
		if (Array.isArray(data.fills)) {
			for (const fill of data.fills) if (fill?.id) {
				await saveFill({
					...fill,
					vehicleId: fill.vehicleId || "highlander"
				});
				n += 1;
			}
		}
		if (Array.isArray(data.jobs)) {
			for (const job of data.jobs) if (job?.id) {
				await saveJob({
					...job,
					vehicleId: job.vehicleId || "highlander"
				});
				n += 1;
			}
		}
		if (Array.isArray(data.charges)) {
			for (const charge of data.charges) if (charge?.id) {
				await saveCharge({
					...charge,
					vehicleId: charge.vehicleId || "tesla"
				});
				n += 1;
			}
		}
		const vehicles = await getAllVehicles();
		const fills = await getAllFills();
		const jobs = await getAllJobs();
		const charges = await getAllCharges();
		const active = vehicles.find((v) => v.id === get().settings.activeVehicleId) || vehicles[0];
		set({
			vehicles,
			fills,
			jobs,
			charges,
			settings: active ? settingsFromVehicle(active) : get().settings
		});
		return n;
	}
}));
function CaptureView({ onTab }) {
	const captureMode = useFillcue((s) => s.captureMode);
	const setCaptureMode = useFillcue((s) => s.setCaptureMode);
	const powertrain = useFillcue((s) => s.settings.powertrain);
	const mode = coerceCaptureMode(powertrain, captureMode);
	const modes = captureModesFor(powertrain);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
			value: mode,
			onChange: setCaptureMode,
			options: modes
		}), mode === "shop" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopForm, { onTab }) : mode === "charge" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChargeForm, { onTab }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FuelForm, { onTab })]
	});
}
function FuelForm({ onTab }) {
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
	async function onPick(slot, file) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Review before save" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
				className: "mb-3",
				children: "OCR is a draft. Check gallons, price, and odometer. Photos are stored as a small B&W scan on this device."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanTile, {
					src: receipt.preview,
					caption: "Receipt"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanTile, {
					src: cluster.preview,
					caption: "Cluster"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
				value: ocrProgress,
				className: "mt-3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-ink",
				children: ocrBusy ? "Working…" : ocrStatus
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileChip, {
					label: "Receipt",
					onFile: (f) => onPick("receipt", f),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "size-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileChip, {
					label: "Cluster",
					gold: true,
					onFile: (f) => onPick("cluster", f),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "sm",
					onClick: () => applyOcrText(SAMPLE_RECEIPT, "receipt"),
					children: "Sample receipt"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "sm",
					onClick: () => applyOcrText(SAMPLE_CLUSTER, "cluster"),
					children: "Sample cluster"
				})]
			})
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "grid grid-cols-2 gap-2.5",
			onSubmit: (e) => {
				e.preventDefault();
				onSave();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Date",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "date",
						required: true,
						value: draft.date,
						onChange: (e) => setDraft({ date: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Time",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "time",
						value: draft.time,
						onChange: (e) => setDraft({ time: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Station",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: draft.station,
						onChange: (e) => setDraft({ station: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "City / State",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: draft.city,
						onChange: (e) => setDraft({ city: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Pump",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "numeric",
						value: draft.pump,
						onChange: (e) => setDraft({ pump: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Grade",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
						value: draft.grade,
						onChange: (v) => setDraft({ grade: v }),
						options: GRADES
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Gallons",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "decimal",
						value: draft.gallons,
						onChange: (e) => setDraft({ gallons: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Price / gal",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "decimal",
						value: draft.pricePerGal,
						onChange: (e) => setDraft({ pricePerGal: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Total $",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "decimal",
						value: draft.total,
						onChange: (e) => setDraft({ total: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Odometer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "numeric",
						value: draft.odometer,
						onChange: (e) => setDraft({ odometer: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Cluster range",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "numeric",
						value: draft.clusterRange,
						onChange: (e) => setDraft({ clusterRange: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "After reset mph",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "numeric",
						value: draft.clusterAvgMph,
						onChange: (e) => setDraft({ clusterAvgMph: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Outside F",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "numeric",
						value: draft.outsideF,
						onChange: (e) => setDraft({ outsideF: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Fill to full?",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
						value: draft.fillToFull,
						onChange: (v) => setDraft({ fillToFull: v }),
						options: FILL_TO_FULL
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Trip type",
					className: "col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
						value: draft.tripType,
						onChange: (v) => setDraft({ tripType: v }),
						options: TRIP_TYPES
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Notes",
					className: "col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: draft.notes,
						onChange: (e) => setDraft({ notes: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-2 grid gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: ocrBusy,
							children: "Save fill"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: resetDraft,
							children: "Reset form"
						}),
						draft.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeleteDialog, {
							title: "Delete this fill?",
							onConfirm: async () => {
								await removeFill(draft.id);
								toast.success("Fill deleted");
								onTab("log");
							}
						}) : null
					]
				})
			]
		}) }),
		(receipt.text || cluster.text) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Raw OCR" }),
			receipt.text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "ocr-box mb-2",
				children: receipt.text.trim()
			}) : null,
			cluster.text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "ocr-box",
				children: cluster.text.trim()
			}) : null
		] })
	] });
}
function ShopForm({ onTab }) {
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
	async function onPick(file) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Shop receipt" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
				className: "mb-3",
				children: "Snap the invoice. OCR drafts shop, miles, total, and the work done. A B&W scan is kept with the log."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanTile, {
				src: preview,
				caption: "Shop receipt"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
				value: ocrProgress,
				className: "mt-3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-ink",
				children: ocrBusy ? "Working…" : ocrStatus
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileChip, {
					label: "Shop receipt",
					gold: true,
					onFile: onPick,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "size-4" })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "sm",
					onClick: () => applyOcrText(SAMPLE_SHOP, "shop"),
					children: "Sample shop"
				})
			})
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "grid grid-cols-2 gap-2.5",
			onSubmit: (e) => {
				e.preventDefault();
				onSave();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Date",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "date",
						required: true,
						value: draft.date,
						onChange: (e) => setDraft({ date: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Status",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
						value: draft.status,
						onChange: (v) => setDraft({ status: v }),
						options: [{
							id: "done",
							label: "Done"
						}, {
							id: "scheduled",
							label: "Scheduled"
						}]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Shop",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: draft.shop,
						onChange: (e) => setDraft({ shop: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "City / State",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: draft.city,
						onChange: (e) => setDraft({ city: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Odometer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "numeric",
						value: draft.odometer,
						onChange: (e) => setDraft({ odometer: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Total $",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "decimal",
						value: draft.total,
						onChange: (e) => setDraft({ total: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Category",
					className: "col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
						value: draft.category,
						onChange: (v) => setDraft({ category: v }),
						options: SERVICE_CATEGORIES
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "What was done",
					className: "col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: draft.summary,
						onChange: (e) => setDraft({ summary: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Due date",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "date",
						value: draft.dueDate,
						onChange: (e) => setDraft({ dueDate: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Due miles",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "numeric",
						value: draft.dueMiles,
						onChange: (e) => setDraft({ dueMiles: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Notes",
					className: "col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: draft.notes,
						onChange: (e) => setDraft({ notes: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-2 grid gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: ocrBusy,
							children: draft.status === "scheduled" ? "Save schedule" : "Save shop visit"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: resetServiceDraft,
							children: "Reset form"
						}),
						draft.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeleteDialog, {
							title: "Delete this shop visit?",
							onConfirm: async () => {
								await removeJob(draft.id);
								toast.success("Shop visit deleted");
								onTab("log");
							}
						}) : null
					]
				})
			]
		}) }),
		receipt.text ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Raw OCR" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
			className: "ocr-box",
			children: receipt.text.trim()
		})] }) : null
	] });
}
function ChargeForm({ onTab }) {
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
	async function onPick(file) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Charge receipt" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
				className: "mb-3",
				children: "Snap a Supercharger or wall-connector receipt. A B&W scan is kept with the log. Nothing is uploaded."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanTile, {
				src: preview,
				caption: "Charge receipt"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
				value: ocrProgress,
				className: "mt-3"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-ink",
				children: ocrBusy ? "Working…" : ocrStatus
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileChip, {
					label: "Charge receipt",
					gold: true,
					onFile: onPick,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4" })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "sm",
					onClick: () => applyOcrText(SAMPLE_CHARGE, "charge"),
					children: "Sample Supercharger"
				})
			})
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "grid grid-cols-2 gap-2.5",
			onSubmit: (e) => {
				e.preventDefault();
				onSave();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Date",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "date",
						required: true,
						value: draft.date,
						onChange: (e) => setDraft({ date: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Time",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "time",
						value: draft.time,
						onChange: (e) => setDraft({ time: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Where",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
						value: draft.location,
						onChange: (v) => setDraft({ location: v }),
						options: CHARGE_LOCATIONS
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "City / State",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: draft.city,
						onChange: (e) => setDraft({ city: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "kWh",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "decimal",
						value: draft.kwh,
						onChange: (e) => setDraft({ kwh: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "$ / kWh",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "decimal",
						value: draft.pricePerKwh,
						onChange: (e) => setDraft({ pricePerKwh: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Total $",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "decimal",
						value: draft.total,
						onChange: (e) => setDraft({ total: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Odometer",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "numeric",
						value: draft.odometer,
						onChange: (e) => setDraft({ odometer: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Notes",
					className: "col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: draft.notes,
						onChange: (e) => setDraft({ notes: e.target.value })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "col-span-2 grid gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: ocrBusy,
							children: "Save charge"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: resetChargeDraft,
							children: "Reset form"
						}),
						draft.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeleteDialog, {
							title: "Delete this charge?",
							onConfirm: async () => {
								await removeCharge(draft.id);
								toast.success("Charge deleted");
								onTab("log");
							}
						}) : null
					]
				})
			]
		}) }),
		receipt.text ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Raw OCR" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
			className: "ocr-box",
			children: receipt.text.trim()
		})] }) : null
	] });
}
function DeleteDialog({ title, onConfirm }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "destructive",
			children: title.replace("?", "")
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "Removed from this device only. Export first if you want a backup." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Keep it" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
		className: "bg-danger text-cream hover:bg-danger",
		onClick: () => void onConfirm(),
		children: "Delete"
	})] })] })] });
}
function Field({ label, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: `flex flex-col gap-1 ${className ?? ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), children]
	});
}
function NativeSelect({ value, onChange, options }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		value,
		onChange: (e) => onChange(e.target.value),
		className: "flex h-11 w-full rounded-md border border-line bg-card px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice/70",
		children: options.map((o) => {
			const id = typeof o === "string" ? o : o.id;
			const label = typeof o === "string" ? o : o.label;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: id,
				children: label
			}, id);
		})
	});
}
function FileChip({ label, gold, icon, onFile }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type: "file",
		accept: "image/*",
		capture: "environment",
		className: "sr-only",
		onChange: (e) => {
			const f = e.target.files?.[0];
			if (f) onFile(f);
			e.target.value = "";
		}
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: gold ? "inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-gold text-sm font-medium text-navy-deep" : "inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-navy text-sm font-medium text-cream",
		children: [icon, label]
	})] });
}
function ClusterFace({ stats, nextDue }) {
	const ev = stats.settings.powertrain === "ev";
	const last = stats.last;
	const range = last?.clusterRange ?? stats.rangeEst;
	const odo = last?.odometer;
	const settings = stats.settings;
	const vinBit = settings.vin ? ` · ${vinTail(settings.vin)}` : "";
	if (ev) {
		const miles = nextDue?.milesLeft;
		const hasMiles = miles != null && Number.isFinite(miles);
		const headline = hasMiles ? fmt(Math.abs(miles), 0) : odo ? fmt(odo, 0) : nextDue ? nextDue.status === "overdue" ? "OVER" : "DUE" : "—";
		const unit = hasMiles ? miles < 0 ? "MI OVER" : "MI" : odo ? "MI" : "";
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-xl bg-cluster px-4 py-5 text-cream shadow-panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-xs tracking-[0.12em] text-ice/80 uppercase",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "truncate",
						children: [settings.vehicle, vinBit]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "EV" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-3 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs tracking-[0.18em] text-ice/70 uppercase",
						children: nextDue ? nextDue.title : "Odometer"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-display leading-none tabular-nums",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-cluster font-semibold tracking-tight",
							children: headline
						}), unit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-1 align-super text-sm text-ice",
							children: unit
						}) : null]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							label: "Odo",
							value: odo ? Number(odo).toLocaleString("en-US") : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							label: "Next",
							value: nextDue?.status ?? "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							label: "When",
							value: nextDue?.dueDate ? nextDue.dueDate.slice(5) : "—"
						})
					]
				})
			]
		});
	}
	const epa = `EPA ${settings.epaCity}/${settings.epaHwy}/${settings.epaComb}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-cluster px-4 py-5 text-cream shadow-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2 text-xs tracking-[0.12em] text-ice/80 uppercase",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "truncate",
					children: [settings.vehicle, vinBit]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "shrink-0",
					children: epa
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "py-3 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs tracking-[0.18em] text-ice/70 uppercase",
					children: "Range"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-display leading-none tabular-nums",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-cluster font-semibold tracking-tight",
						children: fmt(range, 0)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-1 align-super text-sm text-ice",
						children: "MI"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						label: "Odo",
						value: odo ? Number(odo).toLocaleString("en-US") : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						label: "After reset",
						value: last?.clusterAvgMph != null ? `${last.clusterAvgMph} mph` : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						label: "Outside",
						value: last?.outsideF != null ? `${last.outsideF}°F` : "—"
					})
				]
			})
		]
	});
}
function Pill({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md bg-cluster-face px-2 py-2 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-xs tracking-[0.12em] text-ice/70 uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-sm font-medium tabular-nums text-cream",
			children: value
		})]
	});
}
var badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", {
	variants: { variant: {
		default: "border-transparent bg-navy text-cream hover:bg-navy",
		gold: "border-transparent bg-gold text-navy-deep",
		outline: "border-line text-navy",
		muted: "border-transparent bg-line/70 text-muted-ink"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var STATUS = {
	overdue: {
		label: "Overdue",
		className: "bg-danger-soft text-danger border-transparent"
	},
	due: {
		label: "Due",
		className: "bg-gold/30 text-navy-deep border-transparent"
	},
	soon: {
		label: "Soon",
		className: "bg-ice/20 text-navy border-transparent"
	},
	ok: {
		label: "On track",
		className: "bg-ok-soft text-ok border-transparent"
	}
};
function DueList({ recs, onSchedule, limit }) {
	const rows = limit ? recs.slice(0, limit) : recs;
	if (!rows.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "What’s due" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: ["Based on this vehicle’s odometer and shop log. ", DUE_DISCLAIMER_SHORT] })] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-4 pt-4 pb-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "mb-1",
				children: "What’s due"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, {
				className: "mb-2",
				children: ["Based on this vehicle’s odometer and shop log. ", DUE_DISCLAIMER_SHORT]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: rows.map((r) => {
			const st = STATUS[r.status];
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onSchedule(r),
				className: "flex w-full items-start justify-between gap-3 border-t border-line px-4 py-3.5 text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "size-3.5 shrink-0 text-navy" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-navy",
								children: r.title
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-sm text-muted-ink",
							children: r.detail
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-ink",
							children: r.hint
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					className: cn("shrink-0", st.className),
					children: st.label
				})]
			}) }, r.id);
		}) })]
	});
}
function HomeView({ stats, recs, ownership, onTab, onPick, onShop, onSchedule, onExport }) {
	const powertrain = stats.settings.powertrain;
	const ev = !burnsFuel(powertrain);
	const phev = plugsIn(powertrain) && burnsFuel(powertrain);
	const mpgLabel = stats.avgMpg != null ? fmt(stats.avgMpg, 2) : "Need 2nd fill";
	const mpgRows = stats.rows.filter((r) => r.mpg != null);
	const list = recs ?? [];
	const nextDue = list[0] ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClusterFace, {
				stats,
				nextDue
			}),
			ev ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Charges",
						value: String(ownership.chargeCount)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "kWh",
						value: fmt(ownership.kwh, 1)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Energy $",
						value: money(ownership.energySpend)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Shop $",
						value: money(ownership.shopSpend)
					})
				]
			}) : phev ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Fills",
						value: String(stats.rows.length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Charges",
						value: String(ownership.chargeCount)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Fuel $",
						value: money(stats.spent)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Energy $",
						value: money(ownership.energySpend)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Avg MPG",
						value: mpgLabel
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Shop $",
						value: money(ownership.shopSpend)
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Fills",
						value: String(stats.rows.length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Gallons",
						value: fmt(stats.gallons, 3)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Fuel $",
						value: money(stats.spent)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Shop $",
						value: money(ownership.shopSpend)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Avg MPG",
						value: mpgLabel
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Est. range",
						value: `${fmt(stats.rangeEst, 0)} mi`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "While owned" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
					className: "mb-3",
					children: ownership.ownedSince ? `From ${ownership.ownedSince} through what’s in this log.` : "From the first log entry. Set owned-since and purchase odometer in Setup for a tighter number."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
							label: "Operating $",
							value: money(ownership.operatingTotal)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
							label: "$ / mile",
							value: ownership.costPerMile != null ? money(ownership.costPerMile) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
							label: "Miles",
							value: ownership.milesOwned != null ? ownership.milesOwned.toLocaleString("en-US") : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
							label: ev ? "Energy + shop" : phev ? "Fuel + energy + shop" : "Fuel + shop",
							value: `${ownership.fillCount + ownership.chargeCount + ownership.jobCount} logs`
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-3 w-full",
					onClick: onExport,
					children: "Download spreadsheet"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DueList, {
				recs: list,
				onSchedule,
				limit: 4
			}),
			!ev && mpgRows.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "MPG by tank" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex h-16 items-end gap-1.5",
				children: mpgRows.slice(-8).map((r) => {
					const mpg = r.mpg ?? 0;
					const h = Math.max(8, Math.min(100, mpg / 30 * 100));
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-1 flex-col items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-full rounded-sm bg-navy",
							style: { height: `${h}%` },
							title: `${r.date}: ${fmt(mpg, 1)} mpg`
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs tabular-nums text-muted-ink",
							children: fmt(mpg, 0)
						})]
					}, r.id);
				})
			})] }) : null,
			!ev && mpgRows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "MPG" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "First fill is the baseline. Log a second full tank with odometer and MPG appears." })] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Capture" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
					className: "mb-3",
					children: "Photos stay on this device as a small B&W scan. OCR is a draft — you own the save."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2.5",
					children: [
						burnsFuel(powertrain) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileButton, {
							label: "Fuel receipt",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, {}),
							onFile: (f) => onPick("receipt", f)
						}) : null,
						plugsIn(powertrain) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileButton, {
							label: "Charge receipt",
							gold: true,
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {}),
							onFile: (f) => onPick("charge", f)
						}) : null,
						burnsFuel(powertrain) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileButton, {
							label: "Cluster",
							gold: !plugsIn(powertrain),
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {}),
							onFile: (f) => onPick("cluster", f)
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileButton, {
							label: "Shop receipt",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, {}),
							onFile: (f) => onPick("shop", f),
							className: burnsFuel(powertrain) && !plugsIn(powertrain) ? "col-span-2" : void 0
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					className: "mt-2 w-full",
					onClick: () => onTab("capture"),
					children: "Enter by hand"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					className: "w-full",
					onClick: onShop,
					children: "Schedule service"
				})
			] })
		]
	});
}
function Kpi({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-line bg-card px-3.5 py-3 shadow-panel",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs tracking-[0.08em] text-muted-ink uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-display text-kpi font-semibold tabular-nums text-navy",
			children: value
		})]
	});
}
function FileButton({ label, icon, gold, onFile, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "file",
			accept: "image/*",
			capture: "environment",
			className: "sr-only",
			onChange: (e) => {
				const f = e.target.files?.[0];
				if (f) onFile(f);
				e.target.value = "";
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: gold ? "inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-gold text-sm font-medium text-navy-deep" : "inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-navy text-sm font-medium text-cream",
			children: [icon, label]
		})]
	});
}
var CATEGORY_LABEL = Object.fromEntries(SERVICE_CATEGORIES.map((c) => [c.id, c.label]));
function LogView({ stats, jobs, charges, recs, onOpenFill, onOpenJob, onOpenCharge, onSchedule }) {
	const logFilter = useFillcue((s) => s.logFilter);
	const setLogFilter = useFillcue((s) => s.setLogFilter);
	const powertrain = stats.settings.powertrain;
	const logOptions = [
		...burnsFuel(powertrain) ? [{
			id: "fuel",
			label: "Fuel"
		}] : [],
		...plugsIn(powertrain) ? [{
			id: "charge",
			label: "Charge"
		}] : [],
		{
			id: "shop",
			label: "Shop"
		},
		{
			id: "due",
			label: "Due"
		}
	];
	const filter = logOptions.some((o) => o.id === logFilter) ? logFilter : logOptions[0].id;
	const shopRows = [...jobs].sort((a, b) => `${b.date}${b.id}`.localeCompare(`${a.date}${a.id}`));
	const chargeRows = [...charges].sort((a, b) => `${b.date}${b.id}`.localeCompare(`${a.date}${a.id}`));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
				value: filter,
				onChange: setLogFilter,
				options: logOptions
			}),
			filter === "fuel" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FuelLog, {
				stats,
				onOpen: onOpenFill
			}) : null,
			filter === "charge" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChargeLog, {
				charges: chargeRows,
				onOpen: onOpenCharge
			}) : null,
			filter === "shop" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShopLog, {
				jobs: shopRows,
				onOpen: onOpenJob
			}) : null,
			filter === "due" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DueList, {
				recs,
				onSchedule
			}) : null
		]
	});
}
function FuelLog({ stats, onOpen }) {
	if (!stats.rows.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Fuel log" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "No fills yet. Capture a receipt or enter one by hand." })] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 pt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Fuel log" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: [...stats.rows].reverse().map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full items-center gap-3 border-t border-line px-4 py-3.5",
			children: [r.receiptScan || r.clusterScan ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanPeek, {
				src: r.receiptScan || r.clusterScan || "",
				alt: "Receipt scan",
				size: "thumb"
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onOpen(r.id),
				className: "flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "truncate font-medium text-navy",
						children: [
							r.station || "Fill",
							" · ",
							r.date || ""
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm text-muted-ink",
						children: [
							r.gallons ?? "—",
							" gal @ ",
							r.pricePerGal != null ? money(r.pricePerGal, 3) : "—",
							" · ",
							money(r.total)
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "shrink-0 text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-lg font-semibold tabular-nums text-navy",
						children: r.mpg ? fmt(r.mpg, 1) : "—"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs tracking-wide text-muted-ink uppercase",
						children: "mpg"
					})]
				})]
			})]
		}) }, r.id)) })]
	});
}
function ChargeLog({ charges, onOpen }) {
	if (!charges.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Charge log" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "No charging sessions yet. Snap a Supercharger receipt or enter kWh by hand." })] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 pt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Charge log" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: charges.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full items-center gap-3 border-t border-line px-4 py-3.5",
			children: [c.receiptScan ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanPeek, {
				src: c.receiptScan,
				alt: "Charge scan",
				size: "thumb"
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onOpen(c.id),
				className: "flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "truncate font-medium text-navy",
						children: [
							c.location || "Charge",
							" · ",
							c.date || ""
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm text-muted-ink",
						children: [
							c.kwh ?? "—",
							" kWh",
							c.city ? ` · ${c.city}` : ""
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "shrink-0 text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-lg font-semibold tabular-nums text-navy",
						children: money(c.total)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs tracking-wide text-muted-ink uppercase",
						children: "kWh"
					})]
				})]
			})]
		}) }, c.id)) })]
	});
}
function ShopLog({ jobs, onOpen }) {
	if (!jobs.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Shop log" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "No shop visits yet. Snap a receipt or schedule the next service." })] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 pt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Shop log" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: jobs.map((j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full items-center gap-3 border-t border-line px-4 py-3.5",
			children: [j.receiptScan ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanPeek, {
				src: j.receiptScan,
				alt: "Shop scan",
				size: "thumb"
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onOpen(j.id),
				className: "flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "truncate font-medium text-navy",
						children: [
							j.shop || j.summary || "Shop visit",
							" · ",
							j.date || ""
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm text-muted-ink",
						children: [CATEGORY_LABEL[j.category] || j.category, j.odometer ? ` · ${j.odometer.toLocaleString("en-US")} mi` : ""]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "shrink-0 text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-lg font-semibold tabular-nums text-navy",
						children: money(j.total)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						className: j.status === "scheduled" ? "mt-1 border-transparent bg-gold/30 text-navy-deep" : "mt-1 border-transparent bg-ok-soft text-ok",
						children: j.status === "scheduled" ? "Scheduled" : "Done"
					})]
				})]
			})]
		}) }, j.id)) })]
	});
}
var SPECS = [
	{
		make: "Toyota",
		model: "Highlander",
		from: 2014,
		to: 2019,
		tankGal: 19.2,
		usableGal: 18.5,
		kind: "gas"
	},
	{
		make: "Toyota",
		model: "Highlander",
		from: 2014,
		to: 2019,
		tankGal: 17.2,
		usableGal: 16.5,
		kind: "hybrid"
	},
	{
		make: "Toyota",
		model: "Highlander",
		from: 2020,
		to: 2025,
		tankGal: 17.9,
		kind: "gas"
	},
	{
		make: "Toyota",
		model: "Highlander",
		from: 2020,
		to: 2025,
		tankGal: 17.1,
		kind: "hybrid"
	},
	{
		make: "Toyota",
		model: "Camry",
		from: 2012,
		to: 2017,
		tankGal: 17
	},
	{
		make: "Toyota",
		model: "Camry",
		from: 2018,
		to: 2024,
		tankGal: 16,
		kind: "gas"
	},
	{
		make: "Toyota",
		model: "Camry",
		from: 2018,
		to: 2024,
		tankGal: 13,
		kind: "hybrid"
	},
	{
		make: "Toyota",
		model: "Corolla",
		from: 2014,
		to: 2025,
		tankGal: 13.2
	},
	{
		make: "Toyota",
		model: "RAV4",
		from: 2013,
		to: 2018,
		tankGal: 15.9
	},
	{
		make: "Toyota",
		model: "RAV4",
		from: 2019,
		to: 2025,
		tankGal: 14.5
	},
	{
		make: "Toyota",
		model: "Sienna",
		from: 2011,
		to: 2020,
		tankGal: 20
	},
	{
		make: "Toyota",
		model: "Sienna",
		from: 2021,
		to: 2026,
		tankGal: 18
	},
	{
		make: "Toyota",
		model: "Tacoma",
		from: 2016,
		to: 2023,
		tankGal: 21.1
	},
	{
		make: "Toyota",
		model: "4Runner",
		from: 2010,
		to: 2024,
		tankGal: 23
	},
	{
		make: "Toyota",
		model: "Prius",
		from: 2010,
		to: 2015,
		tankGal: 11.9,
		kind: "hybrid"
	},
	{
		make: "Toyota",
		model: "Prius",
		from: 2016,
		to: 2022,
		tankGal: 11.3,
		kind: "hybrid"
	},
	{
		make: "Toyota",
		model: "Tundra",
		from: 2014,
		to: 2021,
		tankGal: 26.4
	},
	{
		make: "Lexus",
		model: "RX",
		from: 2016,
		to: 2022,
		tankGal: 19.2
	},
	{
		make: "Honda",
		model: "Civic",
		from: 2012,
		to: 2015,
		tankGal: 13.2,
		usableGal: 12.7
	},
	{
		make: "Honda",
		model: "Civic",
		from: 2016,
		to: 2021,
		tankGal: 12.4
	},
	{
		make: "Honda",
		model: "Civic",
		from: 2022,
		to: 2026,
		tankGal: 12.4
	},
	{
		make: "Honda",
		model: "Accord",
		from: 2013,
		to: 2017,
		tankGal: 17.2
	},
	{
		make: "Honda",
		model: "Accord",
		from: 2018,
		to: 2022,
		tankGal: 14.8
	},
	{
		make: "Honda",
		model: "CR-V",
		from: 2012,
		to: 2016,
		tankGal: 15.3
	},
	{
		make: "Honda",
		model: "CR-V",
		from: 2017,
		to: 2022,
		tankGal: 14
	},
	{
		make: "Honda",
		model: "Odyssey",
		from: 2011,
		to: 2017,
		tankGal: 21
	},
	{
		make: "Honda",
		model: "Odyssey",
		from: 2018,
		to: 2026,
		tankGal: 19.5
	},
	{
		make: "Honda",
		model: "Pilot",
		from: 2016,
		to: 2022,
		tankGal: 19.5
	},
	{
		make: "Honda",
		model: "Ridgeline",
		from: 2017,
		to: 2026,
		tankGal: 19.5
	},
	{
		make: "Honda",
		model: "Fit",
		from: 2015,
		to: 2020,
		tankGal: 10.6
	},
	{
		make: "Ford",
		model: "Escape",
		from: 2013,
		to: 2019,
		tankGal: 15.1
	},
	{
		make: "Ford",
		model: "Escape",
		from: 2020,
		to: 2025,
		tankGal: 14.7
	},
	{
		make: "Ford",
		model: "Explorer",
		from: 2016,
		to: 2019,
		tankGal: 18.6
	},
	{
		make: "Ford",
		model: "Explorer",
		from: 2020,
		to: 2025,
		tankGal: 17.9
	},
	{
		make: "Ford",
		model: "F-150",
		from: 2015,
		to: 2020,
		tankGal: 23
	},
	{
		make: "Ford",
		model: "Mustang",
		from: 2015,
		to: 2023,
		tankGal: 16
	},
	{
		make: "Ford",
		model: "Edge",
		from: 2015,
		to: 2024,
		tankGal: 18
	},
	{
		make: "Chevrolet",
		model: "Equinox",
		from: 2018,
		to: 2024,
		tankGal: 14.9
	},
	{
		make: "Chevrolet",
		model: "Malibu",
		from: 2016,
		to: 2023,
		tankGal: 15.8
	},
	{
		make: "Chevrolet",
		model: "Silverado",
		from: 2014,
		to: 2018,
		tankGal: 26
	},
	{
		make: "Chevrolet",
		model: "Tahoe",
		from: 2015,
		to: 2020,
		tankGal: 26
	},
	{
		make: "Nissan",
		model: "Altima",
		from: 2013,
		to: 2018,
		tankGal: 18
	},
	{
		make: "Nissan",
		model: "Altima",
		from: 2019,
		to: 2025,
		tankGal: 16.2
	},
	{
		make: "Nissan",
		model: "Rogue",
		from: 2014,
		to: 2020,
		tankGal: 14.5
	},
	{
		make: "Nissan",
		model: "Rogue",
		from: 2021,
		to: 2025,
		tankGal: 14.5
	},
	{
		make: "Subaru",
		model: "Outback",
		from: 2015,
		to: 2025,
		tankGal: 18.5
	},
	{
		make: "Subaru",
		model: "Forester",
		from: 2014,
		to: 2018,
		tankGal: 15.9
	},
	{
		make: "Subaru",
		model: "Forester",
		from: 2019,
		to: 2024,
		tankGal: 16.6
	},
	{
		make: "Subaru",
		model: "Crosstrek",
		from: 2018,
		to: 2023,
		tankGal: 16.6
	},
	{
		make: "Jeep",
		model: "Wrangler",
		from: 2012,
		to: 2017,
		tankGal: 18.6
	},
	{
		make: "Jeep",
		model: "Wrangler",
		from: 2018,
		to: 2024,
		tankGal: 21.5
	},
	{
		make: "Jeep",
		model: "Grand Cherokee",
		from: 2011,
		to: 2021,
		tankGal: 24.6
	},
	{
		make: "Jeep",
		model: "Cherokee",
		from: 2014,
		to: 2023,
		tankGal: 15.8
	},
	{
		make: "Hyundai",
		model: "Elantra",
		from: 2017,
		to: 2020,
		tankGal: 14
	},
	{
		make: "Hyundai",
		model: "Tucson",
		from: 2016,
		to: 2021,
		tankGal: 16.4
	},
	{
		make: "Hyundai",
		model: "Santa Fe",
		from: 2013,
		to: 2018,
		tankGal: 17.4
	},
	{
		make: "Kia",
		model: "Sportage",
		from: 2017,
		to: 2022,
		tankGal: 16.4
	},
	{
		make: "Kia",
		model: "Telluride",
		from: 2020,
		to: 2025,
		tankGal: 18.8
	},
	{
		make: "Mazda",
		model: "CX-5",
		from: 2017,
		to: 2025,
		tankGal: 15.3
	},
	{
		make: "Mazda",
		model: "Mazda3",
		from: 2014,
		to: 2018,
		tankGal: 13.2
	},
	{
		make: "Volkswagen",
		model: "Jetta",
		from: 2019,
		to: 2024,
		tankGal: 13.2
	},
	{
		make: "BMW",
		model: "3 Series",
		from: 2012,
		to: 2018,
		tankGal: 15.8
	},
	{
		make: "Mercedes-Benz",
		model: "C-Class",
		from: 2015,
		to: 2021,
		tankGal: 17.4
	},
	{
		make: "Tesla",
		model: "Model 3",
		from: 2017,
		to: 2026,
		tankGal: 0,
		usableGal: 0,
		kind: "ev"
	},
	{
		make: "Tesla",
		model: "Model Y",
		from: 2020,
		to: 2026,
		tankGal: 0,
		usableGal: 0,
		kind: "ev"
	},
	{
		make: "Tesla",
		model: "Model S",
		from: 2012,
		to: 2026,
		tankGal: 0,
		usableGal: 0,
		kind: "ev"
	},
	{
		make: "Tesla",
		model: "Model X",
		from: 2016,
		to: 2026,
		tankGal: 0,
		usableGal: 0,
		kind: "ev"
	}
];
function core(s) {
	return String(s || "").toLowerCase().replace(/\b(2wd|4wd|awd|fwd|rwd|4x4|4x2|hybrid|phev|plugin|plug-in)\b/g, " ").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}
function usableFromTank(tankGal, listed) {
	if (listed != null && Number.isFinite(listed)) return listed;
	return Math.round(tankGal * .96 * 10) / 10;
}
function isHybrid(model, fuel) {
	return /\bhybrid\b/i.test(`${model} ${fuel}`);
}
function tankFor(year, make, model, powertrain, fuel = "") {
	if (powertrain === "ev") return {
		tankGal: 0,
		usableGal: 0
	};
	const mk = make.toLowerCase();
	const md = core(model);
	const hybrid = isHybrid(model, fuel);
	const hits = SPECS.filter((s) => {
		if (s.make.toLowerCase() !== mk) return false;
		if (year < s.from || year > s.to) return false;
		if (s.kind === "ev") return false;
		const specModel = core(s.model);
		const first = md.split(" ")[0] || md;
		if (!md.includes(specModel) && !specModel.includes(first)) return false;
		if (s.kind === "hybrid") return hybrid;
		if (s.kind === "gas") return !hybrid;
		return true;
	});
	if (!hits.length) return null;
	hits.sort((a, b) => core(b.model).length - core(a.model).length);
	const best = hits[0];
	return {
		tankGal: best.tankGal,
		usableGal: usableFromTank(best.tankGal, best.usableGal)
	};
}
var EPA_BASE = "https://www.fueleconomy.gov/ws/rest";
var VPIC = "https://vpic.nhtsa.dot.gov/api/vehicles";
function asList(x) {
	if (x == null) return [];
	return Array.isArray(x) ? x : [x];
}
function menuItems(data) {
	return asList(data?.menuItem).filter((i) => i && (i.text || i.value)).map((i) => ({
		text: String(i.text ?? i.value),
		value: String(i.value ?? i.text)
	}));
}
function parseYearMakeModel(name) {
	const m = String(name || "").trim().match(/^((?:19|20)\d{2})\s+(.+)$/);
	if (!m) return null;
	const year = Number(m[1]);
	if (year < 1984 || year > 2030) return null;
	return {
		year,
		rest: m[2].trim()
	};
}
function pickMake(rest, makes) {
	const lower = rest.trim().toLowerCase();
	const ranked = [...makes].sort((a, b) => b.length - a.length);
	for (const make of ranked) {
		const m = make.toLowerCase();
		if (lower === m) return {
			make,
			model: ""
		};
		if (lower.startsWith(`${m} `)) return {
			make,
			model: rest.slice(make.length).trim()
		};
	}
	return null;
}
function modelCore(s) {
	return String(s || "").toLowerCase().replace(/\b(2wd|4wd|awd|fwd|rwd|4x4|4x2|hybrid|phev|plugin|plug-in)\b/g, " ").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}
function rankModels(query, models) {
	const qCore = modelCore(query);
	if (!qCore) return [];
	const qTokens = qCore.split(/\s+/).filter((t) => t.length > 1 || /^\d+$/.test(t));
	const scored = models.map((model) => {
		const core = modelCore(model);
		if (!core) return {
			model,
			score: 0
		};
		if (core === qCore) return {
			model,
			score: 100
		};
		if (core.startsWith(`${qCore} `) || core === qCore || qCore.startsWith(`${core} `)) return {
			model,
			score: 80
		};
		const hits = qTokens.filter((t) => core.includes(t)).length;
		const need = qTokens.length || 1;
		if (hits === 0 || hits < need) return {
			model,
			score: 0
		};
		return {
			model,
			score: Math.round(hits / need * 60)
		};
	}).filter((x) => x.score >= 50).sort((a, b) => b.score - a.score || a.model.length - b.model.length);
	const top = scored[0]?.score ?? 0;
	return scored.filter((x) => x.score >= top - 20).map((x) => x.model);
}
function isElectricFuel(fuel, atv = "", electrification = "") {
	const blob = `${fuel} ${atv} ${electrification}`.toLowerCase();
	if (/\b(phev|plug-?in hybrid)\b/.test(blob)) return false;
	return /\b(electricity|electric|\bev\b|bev)\b/.test(blob);
}
function detectPowertrain(fuel, atv = "", electrification = "", model = "") {
	const blob = `${fuel} ${atv} ${electrification} ${model}`.toLowerCase();
	if (/\b(phev|plug-?in)\b/.test(blob)) return "phev";
	if (isElectricFuel(fuel, atv, electrification)) return "ev";
	if (/\bhybrid\b/.test(blob)) return "hybrid";
	return "ice";
}
function num(v) {
	const n = Number(v);
	return Number.isFinite(n) ? n : null;
}
async function getJson(url) {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), 12e3);
	try {
		const res = await fetch(url, {
			headers: { Accept: "application/json" },
			signal: ctrl.signal
		});
		if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
		return await res.json();
	} catch (err) {
		if (err instanceof Error && err.name === "AbortError") throw new Error("EPA lookup timed out.");
		throw err;
	} finally {
		clearTimeout(timer);
	}
}
async function epaMenu(path) {
	return menuItems(await getJson(`${EPA_BASE}/vehicle/menu/${path}`));
}
async function epaVehicle(id) {
	const raw = await getJson(`${EPA_BASE}/vehicle/${encodeURIComponent(id)}`);
	const city = num(raw.city08);
	const hwy = num(raw.highway08);
	const comb = num(raw.comb08);
	if (city == null || hwy == null) return null;
	const year = num(raw.year) || 0;
	const make = String(raw.make || "");
	const model = String(raw.model || "");
	const fuel = String(raw.fuelType1 || raw.fuelType || "");
	const atv = String(raw.atvType || "");
	const option = String(raw.trany || raw.engId || "");
	const drive = String(raw.drive || "");
	const powertrain = detectPowertrain(fuel, atv, "", model);
	const tank = tankFor(year, make, model, powertrain, `${fuel} ${atv} ${model}`);
	const name = [
		year,
		make,
		model
	].filter(Boolean).join(" ");
	return {
		id: String(raw.id || id),
		year,
		make,
		model,
		option,
		city,
		hwy,
		comb: comb ?? Math.round(city * .55 + hwy * .45),
		fuel,
		powertrain,
		drive,
		name,
		tankGal: tank?.tankGal ?? null,
		usableGal: tank?.usableGal ?? null
	};
}
async function decodeVin(vin) {
	if (!isCompleteVin(vin)) return null;
	const row = (await getJson(`${VPIC}/DecodeVinValues/${encodeURIComponent(vin)}?format=json`)).Results?.[0];
	if (!row) return null;
	const make = (row.Make || "").trim();
	const model = (row.Model || "").trim();
	const year = (row.ModelYear || "").trim();
	if (!make || !model || !year) return null;
	return {
		year,
		make,
		model,
		fuel: (row.FuelTypePrimary || "").trim(),
		drive: (row.DriveType || "").trim(),
		displ: (row.DisplacementL || "").trim(),
		electrification: (row.ElectrificationLevel || "").trim()
	};
}
function preferDrive(models, drive) {
	if (!drive) return models;
	const wantAwd = /\b(awd|4wd|4x4|all-wheel|4-wheel)\b/i.test(drive);
	const want2 = /\b(2wd|4x2|fwd|rwd|2-wheel)\b/i.test(drive);
	const tagged = models.filter((m) => {
		const awd = /\b(awd|4wd|4x4)\b/i.test(m);
		const twod = /\b(2wd|fwd|rwd)\b/i.test(m);
		if (wantAwd) return awd || !twod;
		if (want2) return twod || !awd;
		return true;
	});
	return tagged.length ? tagged : models;
}
async function lookupByYearMakeModel(year, make, modelQuery, drive = "") {
	const models = (await epaMenu(`model?year=${year}&make=${encodeURIComponent(make)}`)).map((i) => i.text);
	let picked = rankModels(modelQuery || make, models);
	picked = preferDrive(picked, drive).slice(0, 4);
	const matches = [];
	for (const model of picked) {
		const options = await epaMenu(`options?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`);
		for (const opt of options.slice(0, 6)) {
			const rec = await epaVehicle(opt.value);
			if (rec) {
				rec.option = opt.text || rec.option;
				matches.push(rec);
			}
			if (matches.length >= 8) return matches;
		}
	}
	return matches;
}
async function lookupVehicle(input) {
	const vin = (input.vin || "").trim();
	const name = (input.name || "").trim();
	let decoded = null;
	if (isCompleteVin(vin)) {
		decoded = await decodeVin(vin);
		if (decoded) {
			const matches = await lookupByYearMakeModel(Number(decoded.year), titleCaseMake(decoded.make), decoded.model, decoded.drive);
			if (matches.length) return {
				decoded,
				matches
			};
		}
	}
	const parsed = parseYearMakeModel(name);
	if (!parsed) {
		if (decoded) return {
			decoded,
			matches: []
		};
		throw new Error("Add a 17-character VIN, or a name like 2015 Toyota Highlander.");
	}
	const makes = (await epaMenu(`make?year=${parsed.year}`)).map((i) => i.text);
	const picked = pickMake(parsed.rest, makes);
	if (!picked) throw new Error(`No EPA make matched “${parsed.rest}”.`);
	const matches = await lookupByYearMakeModel(parsed.year, picked.make, picked.model || picked.make);
	return {
		decoded,
		matches
	};
}
function titleCaseMake(make) {
	if (make.toUpperCase() === "BMW" || make.toUpperCase() === "GMC" || make.toUpperCase() === "MINI") return make.toUpperCase() === "MINI" ? "MINI" : make.toUpperCase();
	return make.toLowerCase().split(/[\s-]+/).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(make.includes("-") ? "-" : " ");
}
function formatEpa(m) {
	const unit = m.powertrain === "ev" ? "MPGe" : "MPG";
	const mpg = `${m.city}/${m.hwy}/${m.comb} ${unit}`;
	if (m.powertrain === "ev") return mpg;
	if (m.tankGal != null) return `${mpg} · ${m.tankGal} gal`;
	return mpg;
}
function EpaLookup({ vin, name, autoVin, onApply }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [matches, setMatches] = (0, import_react.useState)([]);
	const [picked, setPicked] = (0, import_react.useState)("");
	const lastVin = (0, import_react.useRef)("");
	async function run() {
		setBusy(true);
		setError(null);
		try {
			const result = await lookupVehicle({
				vin,
				name
			});
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
	(0, import_react.useEffect)(() => {
		if (!autoVin) return;
		if (!isCompleteVin(vin)) return;
		if (lastVin.current === vin) return;
		lastVin.current = vin;
		run();
	}, [autoVin, vin]);
	const canRun = isCompleteVin(vin) || /^\s*(?:19|20)\d{2}\s+\S+/.test(name);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				className: "w-full",
				disabled: busy || !canRun,
				onClick: () => void run(),
				children: busy ? "Looking up EPA…" : "Look up EPA city / hwy"
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-danger",
				children: error
			}) : null,
			matches.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-ink",
					children: "Pick the trim that matches your car."
				}), matches.map((m) => {
					const active = picked === m.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: cn("flex min-h-11 w-full flex-col items-start rounded-md border px-3 py-2 text-left", active ? "border-navy bg-navy text-cream" : "border-line bg-card text-ink"),
						onClick: () => {
							setPicked(m.id);
							onApply(m);
							toast.success(`EPA ${formatEpa(m)}`);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-medium",
							children: m.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("text-xs", active ? "text-ice" : "text-muted-ink"),
							children: [m.option ? `${m.option} · ` : "", formatEpa(m)]
						})]
					}, m.id);
				})]
			}) : null,
			matches.length === 1 && picked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-ok",
				children: [
					matches[0].name,
					" · ",
					formatEpa(matches[0])
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-ink",
				children: "EPA city/hwy from FuelEconomy.gov. Tank size is the manufacturer figure (not EPA). Usable is ~96% of that — the pump clicks off early."
			})
		]
	});
}
function SettingsView() {
	const settings = useFillcue((s) => s.settings);
	const vehicles = useFillcue((s) => s.vehicles);
	const saveSettings = useFillcue((s) => s.saveSettings);
	const selectVehicle = useFillcue((s) => s.selectVehicle);
	const addVehicle = useFillcue((s) => s.addVehicle);
	const removeVehicle = useFillcue((s) => s.removeVehicle);
	const exportJson = useFillcue((s) => s.exportJson);
	const exportSpreadsheet = useFillcue((s) => s.exportSpreadsheet);
	const importJson = useFillcue((s) => s.importJson);
	const [form, setForm] = (0, import_react.useState)(settings);
	const [adding, setAdding] = (0, import_react.useState)(false);
	const [newName, setNewName] = (0, import_react.useState)("");
	const [newPower, setNewPower] = (0, import_react.useState)("ice");
	const [newVin, setNewVin] = (0, import_react.useState)("");
	const [fromPreset, setFromPreset] = (0, import_react.useState)("");
	const [epaDraft, setEpaDraft] = (0, import_react.useState)(null);
	const ev = !burnsFuel(form.powertrain);
	const hint = vinHint(form.vin);
	(0, import_react.useEffect)(() => {
		setForm(settings);
	}, [settings]);
	function patch(key, value) {
		setForm((f) => ({
			...f,
			[key]: value
		}));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Garage" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
					className: "mb-3",
					children: "Each vehicle keeps its own fuel, charge, and shop log. VIN is optional."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: vehicles.map((v) => {
						const active = settings.activeVehicleId === v.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: cn("flex min-h-11 w-full flex-col items-start rounded-md border px-3 py-2 text-left", active ? "border-navy bg-navy text-cream" : "border-line bg-card text-ink"),
							onClick: () => void selectVehicle(v.id),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium",
								children: v.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: cn("text-xs", active ? "text-ice" : "text-muted-ink"),
								children: [powertrainLabel(v.powertrain), v.vin ? ` · VIN …${vinTail(v.vin)}` : " · no VIN"]
							})]
						}, v.id);
					})
				}),
				adding ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-3 space-y-2.5 rounded-md border border-line bg-paper p-3",
					onSubmit: async (e) => {
						e.preventDefault();
						const preset = VEHICLE_PRESETS.find((p) => p.id === fromPreset);
						const record = await addVehicle({
							name: newName.trim() || preset?.name || "New vehicle",
							powertrain: preset?.powertrain || newPower,
							vin: normalizeVin(newVin),
							fromPresetId: fromPreset || void 0,
							epaCity: epaDraft?.epaCity,
							epaHwy: epaDraft?.epaHwy,
							epaComb: epaDraft?.epaComb,
							tankGal: epaDraft?.tankGal ?? ((preset?.powertrain || newPower) === "ev" ? 0 : void 0),
							usableGal: epaDraft?.usableGal ?? ((preset?.powertrain || newPower) === "ev" ? 0 : void 0)
						});
						toast.success(`Added ${record.name}`);
						setAdding(false);
						setNewName("");
						setNewVin("");
						setFromPreset("");
						setNewPower("ice");
						setEpaDraft(null);
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-navy",
							children: "Add vehicle"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: newName,
								placeholder: "2012 Honda Civic",
								onChange: (e) => setNewName(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
							value: fromPreset === "tesla" ? "ev" : fromPreset === "highlander" ? "ice" : newPower,
							onChange: (v) => {
								setFromPreset("");
								setNewPower(v);
							},
							options: POWERTRAIN_OPTIONS
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "VIN (optional)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: newVin,
								autoCapitalize: "characters",
								spellCheck: false,
								placeholder: "17 characters",
								onChange: (e) => setNewVin(normalizeVin(e.target.value))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EpaLookup, {
							vin: newVin,
							name: newName,
							autoVin: true,
							onApply: (m) => {
								setFromPreset("");
								setNewPower(m.powertrain);
								if (!newName.trim()) setNewName(m.name);
								setEpaDraft({
									epaCity: m.city,
									epaHwy: m.hwy,
									epaComb: m.comb,
									tankGal: m.tankGal,
									usableGal: m.usableGal
								});
							}
						}),
						epaDraft ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-ok",
							children: [
								"Will save EPA ",
								epaDraft.epaCity,
								"/",
								epaDraft.epaHwy,
								"/",
								epaDraft.epaComb,
								newPower === "ev" ? " MPGe" : " MPG",
								epaDraft.tankGal != null && newPower !== "ev" ? ` · tank ${epaDraft.tankGal} gal (usable ${epaDraft.usableGal})` : ""
							]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-2",
							children: VEHICLE_PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: fromPreset === p.id ? "default" : "outline",
								className: "h-auto min-h-11 whitespace-normal py-2 text-left",
								onClick: () => {
									setFromPreset(p.id);
									setNewPower(p.powertrain);
									if (!newName.trim()) setNewName(p.name);
								},
								children: ["Copy ", p.id === "highlander" ? "Highlander" : "Model 3"]
							}, p.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "ghost",
								onClick: () => setAdding(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Add to garage"
							})]
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					className: "mt-3 w-full",
					onClick: () => setAdding(true),
					children: "Add vehicle"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "This vehicle" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
					className: "mb-3",
					children: "Name, VIN, tank, and the dates used for lifetime cost."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid grid-cols-2 gap-2.5",
					onSubmit: async (e) => {
						e.preventDefault();
						await saveSettings(form);
						toast.success("Vehicle saved on this device");
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "col-span-2 flex flex-col gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								required: true,
								value: form.vehicle,
								onChange: (e) => patch("vehicle", e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
								value: form.powertrain,
								onChange: (v) => patch("powertrain", v),
								options: POWERTRAIN_OPTIONS
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "col-span-2 flex flex-col gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "VIN (optional)" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: form.vin,
									autoCapitalize: "characters",
									spellCheck: false,
									placeholder: "17 characters, no I O Q",
									onChange: (e) => patch("vin", normalizeVin(e.target.value))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("text-xs", isCompleteVin(form.vin) ? "text-ok" : "text-muted-ink"),
									children: form.vin ? isCompleteVin(form.vin) ? "Looks like a complete VIN" : hint : "Leave blank if you don’t have it yet"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EpaLookup, {
								vin: form.vin,
								name: form.vehicle,
								onApply: (m) => {
									setForm((f) => ({
										...f,
										vehicle: f.vehicle.trim() ? f.vehicle : m.name,
										powertrain: m.powertrain,
										epaCity: m.city,
										epaHwy: m.hwy,
										epaComb: m.comb,
										tankGal: m.tankGal ?? (m.powertrain === "ev" ? 0 : f.tankGal),
										usableGal: m.usableGal ?? (m.powertrain === "ev" ? 0 : f.usableGal)
									}));
								}
							}, settings.activeVehicleId)
						}),
						!ev ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
								label: "Tank (gal)",
								value: form.tankGal,
								onChange: (n) => patch("tankGal", n)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
								label: "Usable tank",
								value: form.usableGal,
								onChange: (n) => patch("usableGal", n)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
								label: "EPA city",
								value: form.epaCity,
								onChange: (n) => patch("epaCity", n)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
								label: "EPA hwy",
								value: form.epaHwy,
								onChange: (n) => patch("epaHwy", n)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
								label: "EPA combined",
								value: form.epaComb,
								onChange: (n) => patch("epaComb", n),
								className: "col-span-2"
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "col-span-2 text-sm text-muted-ink",
							children: "EV has no tank or MPG. Log Supercharger and home charging for kWh, and shop visits for tires and brakes."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Owned since" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: form.ownedSince,
								onChange: (e) => patch("ownedSince", e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Odo at purchase" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								inputMode: "numeric",
								value: form.purchaseOdo == null ? "" : String(form.purchaseOdo),
								onChange: (e) => patch("purchaseOdo", e.target.value === "" ? null : Number(e.target.value))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "col-span-2",
							children: "Save vehicle"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "destructive",
							className: "col-span-2",
							disabled: vehicles.length <= 1,
							onClick: async () => {
								if (!window.confirm("Remove this vehicle from the garage? Fuel, charge, and shop logs stay on this device.")) return;
								try {
									await removeVehicle(settings.activeVehicleId);
									toast.success("Removed from garage. Logs stay on this device.");
								} catch (err) {
									toast.error(err instanceof Error ? err.message : "Could not remove");
								}
							},
							children: "Remove from garage"
						})
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Ownership spreadsheet" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
					className: "mb-3",
					children: "Excel workbook for the active vehicle: lifetime fuel or kWh, shop spend, and cost per mile."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							className: "col-span-2",
							onClick: exportSpreadsheet,
							children: "Download spreadsheet"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: exportJson,
							children: "Export JSON"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							accept: "application/json",
							className: "sr-only",
							onChange: async (e) => {
								const file = e.target.files?.[0];
								e.target.value = "";
								if (!file) return;
								try {
									const n = await importJson(file);
									toast.success(`Imported ${n} record${n === 1 ? "" : "s"}`);
								} catch {
									toast.error("That file is not a GarageBook backup");
								}
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-md bg-gold text-sm font-medium text-navy-deep",
							children: "Import JSON"
						})] })
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Maintenance estimates" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: DUE_DISCLAIMER_FULL })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Privacy" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Photos are read on this device. A small black-and-white scan is saved with the log so you can check the original later. Nothing is uploaded. There is no account. Tesseract.js loads once from a CDN, then the engine can run offline." })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Support" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
					className: "mb-3",
					children: "GarageBook is free. Coffee keeps the side projects going."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "https://buymeacoffee.com/wilsonsamiano",
					target: "_blank",
					rel: "noopener noreferrer",
					className: "inline-flex h-11 w-full items-center justify-center rounded-md bg-gold text-sm font-medium text-navy-deep",
					children: "Buy me a coffee"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-center text-xs text-muted-ink",
					children: "buymeacoffee.com/wilsonsamiano"
				})
			] })
		]
	});
}
function NumField({ label, value, onChange, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: `flex flex-col gap-1 ${className ?? ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			type: "number",
			step: "0.1",
			value: Number.isFinite(value) ? value.toFixed(1) : "",
			onChange: (e) => onChange(Number(e.target.value))
		})]
	});
}
var TABS = [
	{
		id: "home",
		label: "Home",
		icon: Gauge
	},
	{
		id: "capture",
		label: "Capture",
		icon: Camera
	},
	{
		id: "log",
		label: "Log",
		icon: List
	},
	{
		id: "settings",
		label: "Setup",
		icon: SlidersHorizontal
	}
];
function TabBar({ tab, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-card/95 pb-[max(8px,env(safe-area-inset-bottom))] backdrop-blur-sm",
		children: TABS.map((item) => {
			const Icon = item.icon;
			const active = tab === item.id;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onChange(item.id),
				className: cn("flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs transition-colors duration-[var(--motion-quick)]", active ? "font-semibold text-navy" : "text-muted-ink"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-5",
					strokeWidth: active ? 2.2 : 1.8
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label })]
			}, item.id);
		})
	});
}
function VehicleSwitcher() {
	const vehicles = useFillcue((s) => s.vehicles);
	const settings = useFillcue((s) => s.settings);
	const selectVehicle = useFillcue((s) => s.selectVehicle);
	const label = settings.vehicle;
	const tail = settings.vin ? vinTail(settings.vin) : "";
	if (vehicles.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "max-w-[14rem] truncate text-xs text-ice/80",
		children: [label, tail ? ` · ${tail}` : ""]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "relative inline-flex max-w-[14.5rem] items-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Active vehicle"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				className: "h-10 max-w-full appearance-none truncate bg-transparent pr-5 text-xs text-ice/90",
				value: settings.activeVehicleId,
				onChange: (e) => void selectVehicle(e.target.value),
				children: vehicles.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
					value: v.id,
					children: [v.name, v.vin ? ` · ${vinTail(v.vin)}` : ""]
				}, v.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "pointer-events-none absolute right-0 size-3.5 text-ice/80" })
		]
	});
}
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
	const [tab, setTab] = (0, import_react.useState)("home");
	(0, import_react.useEffect)(() => {
		hydrate();
	}, [hydrate]);
	const activeId = settings.activeVehicleId || "highlander";
	const activeFills = (0, import_react.useMemo)(() => fills.filter((f) => (f.vehicleId || "highlander") === activeId), [fills, activeId]);
	const activeJobs = (0, import_react.useMemo)(() => jobs.filter((j) => (j.vehicleId || "highlander") === activeId), [jobs, activeId]);
	const activeCharges = (0, import_react.useMemo)(() => charges.filter((c) => (c.vehicleId || "tesla") === activeId), [charges, activeId]);
	const snapshot = ready ? enrich(activeFills, settings) : null;
	const recs = ready ? recommend(settings.powertrain, activeFills, activeJobs, void 0, activeCharges) : [];
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
	function onSchedule(rec) {
		scheduleFrom({
			category: rec.category,
			summary: rec.title,
			status: "scheduled",
			dueDate: rec.dueDate || "",
			dueMiles: rec.dueMiles != null ? String(rec.dueMiles) : ""
		});
		setTab("capture");
	}
	async function onPick(slot, file) {
		setTab("capture");
		try {
			await handlePhoto(file, slot);
		} catch {}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-20 flex items-center justify-between bg-linear-to-b from-navy-deep to-navy px-4 py-3 text-cream",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, { className: "size-9 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-lg leading-tight font-semibold",
						children: "GarageBook"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VehicleSwitcher, {})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					variant: "cream",
					size: "sm",
					className: "h-10 border border-cream/35 bg-transparent text-cream hover:bg-cream/10",
					onClick: goCaptureNew,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Add"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-xl px-4 pt-4 pb-28",
				children: !ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-xl bg-cluster/90" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-20 animate-pulse rounded-xl bg-card" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-20 animate-pulse rounded-xl bg-card" })]
					})]
				}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger",
					children: error
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					tab === "home" && snapshot && ownership ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeView, {
						stats: snapshot,
						recs,
						ownership,
						onTab: setTab,
						onPick,
						onShop: goShop,
						onSchedule,
						onExport: exportSpreadsheet
					}) : null,
					tab === "capture" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaptureView, { onTab: setTab }) : null,
					tab === "log" && snapshot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogView, {
						stats: snapshot,
						jobs: activeJobs,
						charges: activeCharges,
						recs,
						onOpenFill: (id) => {
							openFill(id);
							setTab("capture");
						},
						onOpenJob: (id) => {
							openJob(id);
							setTab("capture");
						},
						onOpenCharge: (id) => {
							openCharge(id);
							setTab("capture");
						},
						onSchedule
					}) : null,
					tab === "settings" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsView, {}) : null
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabBar, {
				tab,
				onChange: setTab
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				position: "top-center",
				richColors: true
			})
		]
	});
}
//#endregion
export { Home as component };
