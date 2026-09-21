import { Camera, Gauge, List, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TabId } from "@/store/fillcue-store";

const TABS: { id: TabId; label: string; icon: typeof Gauge }[] = [
  { id: "home", label: "Home", icon: Gauge },
  { id: "capture", label: "Capture", icon: Camera },
  { id: "log", label: "Log", icon: List },
  { id: "settings", label: "Setup", icon: SlidersHorizontal },
];

export function TabBar({ tab, onChange }: { tab: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-card/95 pb-[max(8px,env(safe-area-inset-bottom))] backdrop-blur-sm">
      {TABS.map((item) => {
        const Icon = item.icon;
        const active = tab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs transition-colors duration-[var(--motion-quick)]",
              active ? "font-semibold text-navy" : "text-muted-ink",
            )}
          >
            <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
