"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, ShieldCheck, Zap, CreditCard, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { subscriptionTierPrices } from "@/lib/data";

export type SubscriptionTier = "pdi" | "solo" | "school" | "academy" | "enterprise";

const planNames: Record<SubscriptionTier, string> = {
  pdi: "PDI (Trainee)",
  solo: "Solo Instructor",
  school: "Driving School",
  academy: "Academy",
  enterprise: "Enterprise Franchise",
};

export function DriveSwiftSubscriptionCard({ 
  currentTier = "school",
  status = "active"
}: { 
  currentTier?: SubscriptionTier;
  status?: string;
}) {
  const { toast } = useToast();
  const [activeTier, setActiveTier] = useState<SubscriptionTier>(currentTier);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const price = subscriptionTierPrices[activeTier];

  const handleSelectPlan = async (tier: SubscriptionTier) => {
    setIsProcessing(true);
    try {
      // In production, call Stripe Billing API to update subscription
      setTimeout(() => {
        setActiveTier(tier);
        setIsProcessing(false);
        setShowUpgradeModal(false);
        toast({
          title: `Subscribed to ${planNames[tier]} Plan!`,
          description: `Your subscription has been updated to £${subscriptionTierPrices[tier]}/month.`,
        });
      }, 1000);
    } catch (err: any) {
      setIsProcessing(false);
      toast({
        variant: "destructive",
        title: "Billing Error",
        description: err.message || "Failed to update subscription.",
      });
    }
  };

  return (
    <>
      <Card className="border-primary/40 shadow-sm bg-gradient-to-r from-primary/5 via-background to-background">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Fold 1: DriveSwift Platform Subscription
                </CardTitle>
                <Badge className="bg-primary text-primary-foreground gap-1 text-xs">
                  <Sparkles className="h-3 w-3" /> {planNames[activeTier]}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Your monthly subscription fee paid to DriveSwift for software access, AI lesson generators, and pupil portals.
              </CardDescription>
            </div>

            <Button
              onClick={() => setShowUpgradeModal(true)}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10"
            >
              <Zap className="h-3.5 w-3.5" /> Upgrade Plan
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 border rounded-lg bg-background text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Monthly Subscription</span>
              <span className="font-bold text-base text-primary">
                {price === 0 ? "Free" : `£${price} / month`}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[11px]">Subscription Status</span>
              <span className="font-semibold text-green-600 flex items-center gap-1 capitalize">
                <Check className="h-3.5 w-3.5" /> {status}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[11px]">Next Renewal Date</span>
              <span className="font-medium">October 27, 2026</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" /> Choose Your DriveSwift Subscription Plan
            </DialogTitle>
            <DialogDescription>
              Select the right plan for your driving school or independent practice. Subscriptions auto-renew monthly via Stripe.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            {/* Solo Plan */}
            <div className={`p-4 border rounded-xl space-y-3 flex flex-col justify-between ${activeTier === 'solo' ? 'border-primary bg-primary/5 ring-2 ring-primary' : 'bg-card'}`}>
              <div className="space-y-2">
                <Badge variant="outline">Independent ADI</Badge>
                <h4 className="font-bold text-lg">Solo Plan</h4>
                <div className="text-2xl font-bold text-primary">£10 <span className="text-xs font-normal text-muted-foreground">/ mo</span></div>
                <p className="text-xs text-muted-foreground">Ideal for single independent driving instructors.</p>
                <ul className="text-xs space-y-1.5 text-muted-foreground pt-2">
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500" /> 1 Instructor</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500" /> Up to 10 pupils</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500" /> AI Lesson Plan Generator</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500" /> Direct Pupil Payments (Stripe)</li>
                </ul>
              </div>
              <Button
                size="sm"
                onClick={() => handleSelectPlan('solo')}
                disabled={isProcessing || activeTier === 'solo'}
                variant={activeTier === 'solo' ? 'secondary' : 'default'}
                className="w-full mt-4 text-xs"
              >
                {activeTier === 'solo' ? 'Current Plan' : 'Select Solo Plan'}
              </Button>
            </div>

            {/* School Plan */}
            <div className={`p-4 border rounded-xl space-y-3 flex flex-col justify-between relative ${activeTier === 'school' ? 'border-primary bg-primary/5 ring-2 ring-primary' : 'bg-card border-primary/50'}`}>
              <Badge className="absolute -top-2.5 right-4 bg-primary text-primary-foreground text-[10px]">Most Popular</Badge>
              <div className="space-y-2">
                <Badge variant="outline">Small / Medium School</Badge>
                <h4 className="font-bold text-lg">School Plan</h4>
                <div className="text-2xl font-bold text-primary">£25 <span className="text-xs font-normal text-muted-foreground">/ mo</span></div>
                <p className="text-xs text-muted-foreground">For growing driving schools with up to 5 instructors.</p>
                <ul className="text-xs space-y-1.5 text-muted-foreground pt-2">
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500" /> 5 Instructors</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500" /> Up to 150 pupils</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500" /> Full Team Calendar</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500" /> Automated Pupil Reminders</li>
                </ul>
              </div>
              <Button
                size="sm"
                onClick={() => handleSelectPlan('school')}
                disabled={isProcessing || activeTier === 'school'}
                variant={activeTier === 'school' ? 'secondary' : 'default'}
                className="w-full mt-4 text-xs"
              >
                {activeTier === 'school' ? 'Current Plan' : 'Select School Plan'}
              </Button>
            </div>

            {/* Academy Plan */}
            <div className={`p-4 border rounded-xl space-y-3 flex flex-col justify-between ${activeTier === 'academy' ? 'border-primary bg-primary/5 ring-2 ring-primary' : 'bg-card'}`}>
              <div className="space-y-2">
                <Badge variant="outline">Large Franchise</Badge>
                <h4 className="font-bold text-lg">Academy Plan</h4>
                <div className="text-2xl font-bold text-primary">£100 <span className="text-xs font-normal text-muted-foreground">/ mo</span></div>
                <p className="text-xs text-muted-foreground">For established franchises with multiple cars.</p>
                <ul className="text-xs space-y-1.5 text-muted-foreground pt-2">
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500" /> 10 Instructors</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500" /> Up to 1000 pupils</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500" /> Priority Support</li>
                  <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-500" /> Advanced Financial Analytics</li>
                </ul>
              </div>
              <Button
                size="sm"
                onClick={() => handleSelectPlan('academy')}
                disabled={isProcessing || activeTier === 'academy'}
                variant={activeTier === 'academy' ? 'secondary' : 'default'}
                className="w-full mt-4 text-xs"
              >
                {activeTier === 'academy' ? 'Current Plan' : 'Select Academy Plan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
