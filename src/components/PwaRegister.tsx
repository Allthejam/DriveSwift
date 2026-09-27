"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    deferredPwaPrompt: any;
  }
}

export function PwaRegister() {
  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("DriveSwift PWA ServiceWorker registered with scope:", registration.scope);
          })
          .catch((err) => {
            console.warn("DriveSwift PWA ServiceWorker registration failed:", err);
          });
      });
    }

    // 2. Capture install prompt event for one-click installation
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.deferredPwaPrompt = e;
      window.dispatchEvent(new Event("driveswift:pwa-installable"));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  return null;
}
