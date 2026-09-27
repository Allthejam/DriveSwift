"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Mail, 
  Send, 
  RefreshCcw, 
  Download, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Trash2, 
  Check, 
  Loader2,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, getDocs, setDoc, doc, onSnapshot, deleteDoc } from "firebase/firestore";

export type Subscriber = {
  id?: string;
  email: string;
  date: string;
  status: "Subscribed" | "Unsubscribed";
  source?: string;
  brevoSynced?: boolean;
};

const initialMockSubscribers: Subscriber[] = [
  { email: "john.smith@drivinginstructors.co.uk", date: "2026-09-20", status: "Subscribed", source: "Landing Page Footer", brevoSynced: true },
  { email: "sarah.jenkins@eliteacademy.com", date: "2026-09-22", status: "Subscribed", source: "Landing Page Footer", brevoSynced: true },
  { email: "mike.davies@citylearners.co.uk", date: "2026-09-25", status: "Subscribed", source: "Account Registration", brevoSynced: false },
  { email: "emma.wilson@passfast.co.uk", date: "2026-09-26", status: "Subscribed", source: "Landing Page Footer", brevoSynced: false },
];

export default function NewsletterAdminPage() {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialMockSubscribers);
  const [loading, setLoading] = useState<boolean>(true);

  // Brevo API settings state
  const [brevoApiKey, setBrevoApiKey] = useState<string>("");
  const [brevoListId, setBrevoListId] = useState<string>("1");
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [isSyncingBrevo, setIsSyncingBrevo] = useState<boolean>(false);

  // Add subscriber modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState<string>("");
  const [newSource, setNewSource] = useState<string>("Admin Entry");
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // 1. Fetch live subscribers and Brevo settings from Firestore
  useEffect(() => {
    // Listen to subscribers collection
    const subscribersRef = collection(db, "newsletter_subscribers");
    const unsubscribeSubscribers = onSnapshot(subscribersRef, (snapshot) => {
      if (!snapshot.empty) {
        const liveList: Subscriber[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Subscriber)
        }));
        setSubscribers(liveList);
      } else {
        // Seed initial mock subscribers if collection is empty
        initialMockSubscribers.forEach(sub => {
          const subId = sub.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
          setDoc(doc(db, "newsletter_subscribers", subId), sub);
        });
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore subscriber fetch error:", err);
      setLoading(false);
    });

    // Fetch Brevo Settings from Firestore
    async function loadBrevoSettings() {
      try {
        const settingsSnap = await getDocs(collection(db, "settings"));
        settingsSnap.forEach(docSnap => {
          if (docSnap.id === "brevo") {
            const data = docSnap.data();
            if (data.apiKey) setBrevoApiKey(data.apiKey);
            if (data.listId) setBrevoListId(data.listId);
            if (data.autoSync !== undefined) setAutoSyncEnabled(data.autoSync);
          }
        });
      } catch (err) {
        console.error("Brevo settings fetch error:", err);
      }
    }
    loadBrevoSettings();

    return () => unsubscribeSubscribers();
  }, []);

  // 2. Save Brevo Settings to Firestore
  const handleSaveBrevoSettings = async () => {
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, "settings", "brevo"), {
        apiKey: brevoApiKey,
        listId: brevoListId,
        autoSync: autoSyncEnabled,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      toast({
        title: "Brevo Settings Saved!",
        description: "Your Brevo API key and preferences have been updated in Firestore.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: err.message || "Failed to save Brevo settings.",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // 3. Sync Subscribers to Brevo API
  const handleSyncToBrevo = async () => {
    setIsSyncingBrevo(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const sub of subscribers) {
        if (sub.status === "Subscribed") {
          try {
            const res = await fetch("/api/newsletter/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: sub.email,
                listId: brevoListId,
                apiKey: brevoApiKey,
              }),
            });
            const data = await res.json();
            if (data.success && data.brevoSynced) {
              successCount++;
              // Update status in Firestore
              const subId = sub.id || sub.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
              await setDoc(doc(db, "newsletter_subscribers", subId), { brevoSynced: true }, { merge: true });
            } else {
              errorCount++;
            }
          } catch (e) {
            errorCount++;
          }
        }
      }

      if (brevoApiKey) {
        toast({
          title: "Brevo Sync Complete!",
          description: `Successfully synced ${successCount} contacts to Brevo list #${brevoListId}.`,
        });
      } else {
        toast({
          title: "Brevo Integration Ready",
          description: "Subscribers are organized locally. Add your Brevo API Key above when you create your Brevo account to trigger automated email campaigns!",
        });
      }
    } catch (err: any) {
      console.error("Brevo sync error:", err);
    } finally {
      setIsSyncingBrevo(false);
    }
  };

  // 4. Export CSV file for manual import to Brevo or Excel
  const handleExportCSV = () => {
    const headers = "Email,Subscription Date,Status,Source,Brevo Synced\n";
    const rows = subscribers
      .map(s => `"${s.email}","${s.date}","${s.status}","${s.source || 'Website'}","${s.brevoSynced ? 'Yes' : 'No'}"`)
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `driveswift_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV Exported!",
      description: "Downloaded subscriber list formatted for Brevo and Excel.",
    });
  };

  // 5. Add new subscriber manually
  const handleAddSubscriber = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      toast({ variant: "destructive", title: "Invalid Email", description: "Please enter a valid email address." });
      return;
    }
    setIsAdding(true);
    try {
      const subId = newEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const newSub: Subscriber = {
        email: newEmail,
        date: new Date().toISOString().split('T')[0],
        status: "Subscribed",
        source: newSource,
        brevoSynced: false,
      };

      await setDoc(doc(db, "newsletter_subscribers", subId), newSub);

      toast({
        title: "Subscriber Added!",
        description: `${newEmail} added to newsletter database.`,
      });
      setNewEmail("");
      setShowAddModal(false);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsAdding(false);
    }
  };

  // Delete subscriber
  const handleDeleteSubscriber = async (sub: Subscriber) => {
    try {
      const subId = sub.id || sub.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
      await deleteDoc(doc(db, "newsletter_subscribers", subId));
      toast({ title: "Removed Subscriber", description: `Removed ${sub.email}.` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const activeCount = subscribers.filter(s => s.status === "Subscribed").length;
  const syncedCount = subscribers.filter(s => s.brevoSynced).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border rounded-xl bg-card shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" /> Newsletter & Email Automation
            </h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1">
              <Sparkles className="h-3 w-3" /> Brevo Integrated
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage subscriber lists, configure your Brevo API connection, and automate email campaigns for driving instructors and pupils.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> Add Subscriber
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-xs text-muted-foreground uppercase font-semibold">Total Subscribers</span>
          <div className="text-3xl font-bold">{subscribers.length}</div>
          <span className="text-[11px] text-green-600 font-medium">All recorded leads</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-xs text-muted-foreground uppercase font-semibold">Active Subscriptions</span>
          <div className="text-3xl font-bold text-primary">{activeCount}</div>
          <span className="text-[11px] text-muted-foreground">Ready for email broadcast</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-xs text-muted-foreground uppercase font-semibold">Synced to Brevo</span>
          <div className="text-3xl font-bold text-green-600">{syncedCount}</div>
          <span className="text-[11px] text-muted-foreground">{subscribers.length - syncedCount} pending sync</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-xs text-muted-foreground uppercase font-semibold">Email Service Provider</span>
          <div className="text-xl font-bold flex items-center gap-1.5 text-blue-600 pt-1">
            <Send className="h-5 w-5" /> Brevo (Sendinblue)
          </div>
          <span className="text-[11px] text-muted-foreground">Automated marketing suite</span>
        </Card>
      </div>

      {/* Brevo Integration Settings Card */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" /> Brevo API & Automation Setup
              </CardTitle>
              <CardDescription className="text-xs">
                Configure your Brevo account details. When you set up your Brevo account, paste your API Key here to automatically sync new subscribers to Brevo lists.
              </CardDescription>
            </div>
            <a 
              href="https://www.brevo.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            >
              Visit Brevo.com <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Brevo API Key (v3 Key)</Label>
              <Input
                type="password"
                placeholder="xkeysib-xxxxxxxxxxxxxxxxxxxxxxxx..."
                value={brevoApiKey}
                onChange={(e) => setBrevoApiKey(e.target.value)}
                className="font-mono text-xs"
              />
              <span className="text-[10px] text-muted-foreground block">
                Found in Brevo Console → SMTP & API → API Keys
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Brevo Target List ID</Label>
              <Input
                type="text"
                placeholder="e.g. 1 or 2"
                value={brevoListId}
                onChange={(e) => setBrevoListId(e.target.value)}
                className="text-xs"
              />
              <span className="text-[10px] text-muted-foreground block">
                The ID of the contact list in your Brevo dashboard
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-sync"
                checked={autoSyncEnabled}
                onCheckedChange={setAutoSyncEnabled}
              />
              <Label htmlFor="auto-sync" className="text-xs cursor-pointer">
                Automatically sync new landing page subscribers to Brevo in real-time
              </Label>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncToBrevo}
                disabled={isSyncingBrevo}
                className="gap-1.5 text-xs"
              >
                {isSyncingBrevo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
                Sync List Now
              </Button>
              <Button
                size="sm"
                onClick={handleSaveBrevoSettings}
                disabled={isSavingSettings}
                className="gap-1.5 text-xs"
              >
                {isSavingSettings ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Save Brevo Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Subscribers Directory</CardTitle>
              <CardDescription className="text-xs">
                Live subscriber records stored in Firestore and queued for Brevo automation.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading subscribers...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Brevo Sync Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber, index) => (
                  <TableRow key={subscriber.id || index}>
                    <TableCell className="font-medium text-sm">{subscriber.email}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{subscriber.date}</TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline" className="text-[10px]">
                        {subscriber.source || 'Website'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={subscriber.status === "Subscribed" ? "secondary" : "outline"} className="text-[10px]">
                        {subscriber.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {subscriber.brevoSynced ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Synced to Brevo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <AlertCircle className="h-3.5 w-3.5" /> Pending Sync
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSubscriber(subscriber)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Subscriber Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Add New Subscriber
            </DialogTitle>
            <DialogDescription className="text-xs">
              Manually add an email address to the newsletter subscriber database.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Subscriber Email</Label>
              <Input
                type="email"
                placeholder="instructor@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Source / Origin</Label>
              <Input
                type="text"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder="e.g. Exhibition Event, Phone Contact"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddSubscriber} disabled={isAdding}>
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Add Subscriber
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
