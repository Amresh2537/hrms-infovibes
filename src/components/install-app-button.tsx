"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    function onAppInstalled() {
      setDeferredPrompt(null);
      setIsInstalling(false);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (isInstalling) return;

    if (!deferredPrompt) {
      if (isIOS) {
        alert("On iPhone: open Share menu and tap 'Add to Home Screen'.");
      } else {
        alert("Install option will appear when PWA install is supported in this browser.");
      }
      return;
    }

    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } finally {
      setDeferredPrompt(null);
      setIsInstalling(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-white/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition hover:bg-white sm:hidden"
      aria-label="Install Abha HRMS"
    >
      <Image
        src="/hrms.png"
        alt="HRMS logo"
        width={20}
        height={20}
        className="h-5 w-5 rounded-full object-cover"
      />
      {isInstalling ? "Installing..." : "Install App"}
    </button>
  );
}
