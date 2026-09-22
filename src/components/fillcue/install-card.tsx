import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { APP_LINKS } from "@/lib/fillcue/links";

type BeforeInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallCard() {
  const [standalone, setStandalone] = useState(false);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPrompt | null>(null);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());
    setIos(isIos());
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPrompt);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (standalone) {
    return (
      <Card>
        <CardTitle>Installed</CardTitle>
        <CardDescription>
          GarageBook is on this device as an app. The log stays here. First OCR still needs a connection
          once, then receipts work offline.
        </CardDescription>
      </Card>
    );
  }

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
    setStandalone(isStandalone());
  }

  return (
    <Card>
      <CardTitle>Install app</CardTitle>
      <CardDescription className="mb-3">
        Add GarageBook to the home screen. Opens full-screen, keeps the log on this device, and works
        offline after the first load (except VIN/EPA lookup).
      </CardDescription>
      {promptEvent ? (
        <Button type="button" className="gap-2" onClick={() => void install()}>
          <Download className="size-4" />
          Add to home screen
        </Button>
      ) : ios ? (
        <p className="text-sm text-muted-ink">
          iPhone: tap Share, then <strong className="text-navy">Add to Home Screen</strong>.
        </p>
      ) : (
        <p className="text-sm text-muted-ink">
          Browser menu → <strong className="text-navy">Install app</strong> or Add to Home Screen.
        </p>
      )}
      <a
        href={APP_LINKS.live}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block text-center text-xs text-navy underline-offset-2 hover:underline"
      >
        {APP_LINKS.live.replace(/^https:\/\//, "")}
      </a>
    </Card>
  );
}
