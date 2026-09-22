import { Coffee, Github, Globe } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { APP_LINKS } from "@/lib/fillcue/links";

const items = [
  { href: APP_LINKS.live, label: "Open live app", icon: Globe, gold: false },
  { href: APP_LINKS.github, label: "GitHub", icon: Github, gold: false },
  { href: APP_LINKS.coffee, label: "Buy me a coffee", icon: Coffee, gold: true },
] as const;

export function SupportLinks() {
  return (
    <Card>
      <CardTitle>Web app</CardTitle>
      <CardDescription className="mb-3">
        GarageBook is free. Open it on any phone, then install from the live site.
      </CardDescription>
      <div className="grid gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={
                item.gold
                  ? "inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-gold text-sm font-medium text-navy-deep"
                  : "inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-navy text-sm font-medium text-cream"
              }
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
            </a>
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs text-muted-ink">{APP_LINKS.live.replace(/^https:\/\//, "")}</p>
    </Card>
  );
}
