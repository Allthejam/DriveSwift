"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Smartphone, 
  Laptop, 
  Apple, 
  CheckCircle2, 
  Zap, 
  WifiOff, 
  ShieldCheck, 
  RotateCw, 
  Share, 
  MoreVertical, 
  PlusSquare,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function PwaInstallModal({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const [canPrompt, setCanPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.deferredPwaPrompt) {
      setCanPrompt(true);
    }

    const handleInstallable = () => setCanPrompt(true);
    window.addEventListener("driveswift:pwa-installable", handleInstallable);
    return () => window.removeEventListener("driveswift:pwa-installable", handleInstallable);
  }, []);

  const handleTriggerInstall = async () => {
    if (typeof window !== "undefined" && window.deferredPwaPrompt) {
      setIsInstalling(true);
      try {
        const promptEvent = window.deferredPwaPrompt;
        promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult.outcome === "accepted") {
          toast({
            title: "Installing DriveSwift!",
            description: "DriveSwift is being added to your home screen / desktop.",
          });
          window.deferredPwaPrompt = null;
          setCanPrompt(false);
          onOpenChange(false);
        }
      } catch (err) {
        console.error("Install prompt error:", err);
      } finally {
        setIsInstalling(false);
      }
    } else {
      toast({
        title: "Manual Installation Instructions",
        description: "Please follow the quick instructions below for your device.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3" /> Progressive Web App (PWA)
            </Badge>
          </div>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-primary" /> Install DriveSwift App
          </DialogTitle>
          <DialogDescription>
            Install DriveSwift directly on your iPhone, iPad, Android phone, or PC/Mac for a fast, native app experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* 1. Direct Install Trigger Card */}
          <div className="p-4 border rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-background flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-semibold text-base">Ready for 1-Click Install</h4>
              <p className="text-xs text-muted-foreground">
                {canPrompt
                  ? "Your browser supports instant native installation!"
                  : "Install DriveSwift to your home screen or desktop taskbar."}
              </p>
            </div>
            <Button
              onClick={handleTriggerInstall}
              disabled={isInstalling}
              className="gap-2 shadow-md w-full sm:w-auto"
            >
              <Download className="h-4 w-4" />
              {isInstalling ? "Installing..." : "Install DriveSwift Now"}
            </Button>
          </div>

          {/* 2. Why PWA vs Legacy Web App Stores */}
          <div className="space-y-3">
            <h3 className="font-bold text-base flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Why Progressive Web App (PWA) vs. Legacy App Stores?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Legacy app stores (Apple App Store & Google Play Store) involve middleman update approvals, 30% revenue cuts, heavy downloads, and store restrictions. PWAs are modern web-native applications that deliver full native app capabilities directly from the cloud.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <Card className="shadow-none border-primary/20 bg-muted/20">
                <CardContent className="p-3 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-xs text-primary">
                    <Zap className="h-4 w-4 text-amber-500" /> Instant Cloud Updates
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    New features, AI flows, and lesson syllabuses update instantly without waiting days for app store approvals.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-none border-primary/20 bg-muted/20">
                <CardContent className="p-3 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-xs text-primary">
                    <WifiOff className="h-4 w-4 text-blue-500" /> Offline & In-Car Capable
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Access pupil logs and gap schedules even when instructing in rural areas with poor mobile signal.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-none border-primary/20 bg-muted/20">
                <CardContent className="p-3 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-xs text-primary">
                    <RotateCw className="h-4 w-4 text-green-500" /> Ultra Lightweight (~5MB)
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    No 200MB+ store downloads eating your phone storage. PWAs load blazingly fast with zero bloat.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-none border-primary/20 bg-muted/20">
                <CardContent className="p-3 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-xs text-primary">
                    <Laptop className="h-4 w-4 text-purple-500" /> Works Everywhere
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    One unified app runs seamlessly across iPhone, iPad, Android, Mac, and Windows PC.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 3. Step-by-Step Installation Tabs */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-bold text-base">Step-by-Step Device Guide</h3>
            <Tabs defaultValue="ios" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ios" className="gap-1.5 text-xs">
                  <Apple className="h-3.5 w-3.5" /> iOS / iPhone
                </TabsTrigger>
                <TabsTrigger value="android" className="gap-1.5 text-xs">
                  <Smartphone className="h-3.5 w-3.5 text-green-600" /> Android
                </TabsTrigger>
                <TabsTrigger value="desktop" className="gap-1.5 text-xs">
                  <Laptop className="h-3.5 w-3.5 text-blue-600" /> PC / Mac
                </TabsTrigger>
              </TabsList>

              {/* iOS Safari Guide */}
              <TabsContent value="ios" className="space-y-3 pt-3">
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2 p-2 border rounded-lg bg-background">
                    <span className="flex h-5 w-5 rounded-full bg-primary/10 text-primary items-center justify-center font-bold text-xs flex-shrink-0">1</span>
                    <span>Open <strong>DriveSwift</strong> in Safari on your iPhone or iPad.</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 border rounded-lg bg-background">
                    <span className="flex h-5 w-5 rounded-full bg-primary/10 text-primary items-center justify-center font-bold text-xs flex-shrink-0">2</span>
                    <span className="flex items-center gap-1 flex-wrap">
                      Tap the <strong>Share button</strong> <Share className="h-3.5 w-3.5 inline text-primary" /> at the bottom of the Safari screen.
                    </span>
                  </div>
                  <div className="flex items-start gap-2 p-2 border rounded-lg bg-background">
                    <span className="flex h-5 w-5 rounded-full bg-primary/10 text-primary items-center justify-center font-bold text-xs flex-shrink-0">3</span>
                    <span className="flex items-center gap-1 flex-wrap">
                      Scroll down the share menu and tap <strong>Add to Home Screen</strong> <PlusSquare className="h-3.5 w-3.5 inline text-primary" />.
                    </span>
                  </div>
                  <div className="flex items-start gap-2 p-2 border rounded-lg bg-background">
                    <span className="flex h-5 w-5 rounded-full bg-primary/10 text-primary items-center justify-center font-bold text-xs flex-shrink-0">4</span>
                    <span>Tap <strong>Add</strong> in the top right. DriveSwift icon will appear on your home screen!</span>
                  </div>
                </div>
              </TabsContent>

              {/* Android Guide */}
              <TabsContent value="android" className="space-y-3 pt-3">
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2 p-2 border rounded-lg bg-background">
                    <span className="flex h-5 w-5 rounded-full bg-primary/10 text-primary items-center justify-center font-bold text-xs flex-shrink-0">1</span>
                    <span>Click the <strong>Install DriveSwift Now</strong> button at the top of this dialog.</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 border rounded-lg bg-background">
                    <span className="flex h-5 w-5 rounded-full bg-primary/10 text-primary items-center justify-center font-bold text-xs flex-shrink-0">2</span>
                    <span className="flex items-center gap-1 flex-wrap">
                      Or tap the <strong>3 dots menu</strong> <MoreVertical className="h-3.5 w-3.5 inline" /> in Chrome / Edge / Firefox.
                    </span>
                  </div>
                  <div className="flex items-start gap-2 p-2 border rounded-lg bg-background">
                    <span className="flex h-5 w-5 rounded-full bg-primary/10 text-primary items-center justify-center font-bold text-xs flex-shrink-0">3</span>
                    <span>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong> and confirm.</span>
                  </div>
                </div>
              </TabsContent>

              {/* Desktop Guide */}
              <TabsContent value="desktop" className="space-y-3 pt-3">
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-start gap-2 p-2 border rounded-lg bg-background">
                    <span className="flex h-5 w-5 rounded-full bg-primary/10 text-primary items-center justify-center font-bold text-xs flex-shrink-0">1</span>
                    <span>Click <strong>Install DriveSwift Now</strong> button above.</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 border rounded-lg bg-background">
                    <span className="flex h-5 w-5 rounded-full bg-primary/10 text-primary items-center justify-center font-bold text-xs flex-shrink-0">2</span>
                    <span>Or look at the right side of your browser address bar for the <strong>Install icon (⊕)</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2 p-2 border rounded-lg bg-background">
                    <span className="flex h-5 w-5 rounded-full bg-primary/10 text-primary items-center justify-center font-bold text-xs flex-shrink-0">3</span>
                    <span>Click <strong>Install</strong>. DriveSwift will launch as a standalone desktop application in your taskbar!</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
