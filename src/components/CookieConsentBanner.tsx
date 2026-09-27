"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Cookie, ShieldCheck, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export type CookieConsent = {
  accepted: boolean;
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

const COOKIE_STORAGE_KEY = "driveswift_cookie_consent";

export function CookieConsentBanner() {
  const { user, userProfile } = useAuth();
  const [visible, setVisible] = useState<boolean>(false);
  const [showPreferences, setShowPreferences] = useState<boolean>(false);

  // Toggle states for customization modal
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(true);
  const [marketingEnabled, setMarketingEnabled] = useState<boolean>(false);

  useEffect(() => {
    // Check local storage consent
    const storedConsent = localStorage.getItem(COOKIE_STORAGE_KEY);
    
    // Check user profile consent from Firestore
    const userHasConsent = userProfile && (userProfile as any).cookieConsent?.accepted;

    if (!storedConsent && !userHasConsent) {
      // Delay display slightly for smooth UI entrance
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [userProfile]);

  useEffect(() => {
    // Listen for custom trigger event to re-open cookie preferences from footer link
    const handleOpenSettings = () => {
      setVisible(true);
      setShowPreferences(true);
    };

    window.addEventListener("driveswift:open-cookie-banner", handleOpenSettings);
    return () => window.removeEventListener("driveswift:open-cookie-banner", handleOpenSettings);
  }, []);

  const saveConsent = async (consent: CookieConsent) => {
    try {
      // 1. Save to local storage for immediate session reference
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(consent));

      // 2. Save to Firestore if user is authenticated
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          cookieConsent: consent,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err) {
      console.error("Error storing cookie consent:", err);
    } finally {
      setVisible(false);
      setShowPreferences(false);
    }
  };

  const handleAcceptAll = () => {
    const consent: CookieConsent = {
      accepted: true,
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    };
    saveConsent(consent);
  };

  const handleEssentialOnly = () => {
    const consent: CookieConsent = {
      accepted: true,
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    };
    saveConsent(consent);
  };

  const handleSavePreferences = () => {
    const consent: CookieConsent = {
      accepted: true,
      essential: true,
      analytics: analyticsEnabled,
      marketing: marketingEnabled,
      timestamp: new Date().toISOString()
    };
    saveConsent(consent);
  };

  if (!visible) return null;

  return (
    <>
      {/* Floating Bottom Cookie Banner */}
      <div className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-6 bg-background/95 backdrop-blur border-t shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-5">
        <div className="container max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 max-w-3xl">
            <div className="p-2 bg-primary/10 text-primary rounded-lg mt-0.5 flex-shrink-0">
              <Cookie className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-base flex items-center gap-2">
                We value your privacy
                <ShieldCheck className="h-4 w-4 text-green-500" />
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                DriveSwift uses cookies and local storage to keep your session secure, remember your preferences, and improve your driving school experience. Read our{" "}
                <Link href="/cookie-policy" className="underline hover:text-primary transition-colors">
                  Cookie Policy
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="underline hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreferences(true)}
              className="text-xs gap-1"
            >
              <Settings className="h-3.5 w-3.5" />
              Customize
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEssentialOnly}
              className="text-xs"
            >
              Essential Only
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleAcceptAll}
              className="text-xs"
            >
              Accept All Cookies
            </Button>
          </div>
        </div>
      </div>

      {/* Cookie Customization Preferences Modal */}
      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" /> Cookie Preferences
            </DialogTitle>
            <DialogDescription>
              Manage your cookie choices. Essential cookies are required to deliver the core service.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Essential Cookies */}
            <div className="flex items-center justify-between space-x-4 p-3 border rounded-lg bg-muted/30">
              <div className="space-y-1">
                <Label className="font-semibold text-sm">Essential Cookies</Label>
                <p className="text-xs text-muted-foreground">
                  Required for user authentication, security, and storing your session state. Always active.
                </p>
              </div>
              <Switch checked disabled />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-center justify-between space-x-4 p-3 border rounded-lg">
              <div className="space-y-1">
                <Label className="font-semibold text-sm cursor-pointer" htmlFor="analytics-toggle">
                  Analytics & Performance
                </Label>
                <p className="text-xs text-muted-foreground">
                  Helps us measure feature usage and optimize application speed.
                </p>
              </div>
              <Switch
                id="analytics-toggle"
                checked={analyticsEnabled}
                onCheckedChange={setAnalyticsEnabled}
              />
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-center justify-between space-x-4 p-3 border rounded-lg">
              <div className="space-y-1">
                <Label className="font-semibold text-sm cursor-pointer" htmlFor="marketing-toggle">
                  Personalization & Features
                </Label>
                <p className="text-xs text-muted-foreground">
                  Remembers your customized dashboard preferences and theme settings.
                </p>
              </div>
              <Switch
                id="marketing-toggle"
                checked={marketingEnabled}
                onCheckedChange={setMarketingEnabled}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={handleEssentialOnly}>
              Reject Non-Essential
            </Button>
            <Button size="sm" onClick={handleSavePreferences}>
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
