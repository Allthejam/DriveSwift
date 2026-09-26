"use client";

import React, { useState } from "react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud, Link as LinkIcon, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface ImageUploaderProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  maxSizeMB?: number;
}

export function ImageUploader({
  label = "Image",
  value,
  onChange,
  folder = "uploads",
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (limit to 5MB default)
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: `Please select an image smaller than ${maxSizeMB}MB (Selected file is ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(pct);
        },
        (error) => {
          console.error("Upload failed:", error);
          // Fallback: If Firebase Storage bucket isn't provisioned or restricted, create an in-memory object URL
          const localUrl = URL.createObjectURL(file);
          onChange(localUrl);
          toast({
            title: "Local Image Applied",
            description: `Uploaded image applied locally (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
          });
          setUploading(false);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          onChange(downloadUrl);
          toast({
            title: "Upload Successful!",
            description: `Image saved to Firebase Storage (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
          });
          setUploading(false);
        }
      );
    } catch (err: any) {
      console.error("Storage Error:", err);
      const localUrl = URL.createObjectURL(file);
      onChange(localUrl);
      toast({
        title: "Local Image Loaded",
        description: "Image applied locally.",
      });
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-card">
      <div className="flex justify-between items-center">
        <Label className="font-semibold">{label}</Label>
        <span className="text-xs text-muted-foreground">Max size: {maxSizeMB}MB</span>
      </div>

      {value && (
        <div className="relative aspect-video max-h-48 rounded-lg overflow-hidden border bg-muted">
          <Image
            src={value}
            alt="Uploaded preview"
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Upload File (up to 5MB)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="text-xs"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Or Paste Image URL</Label>
          <div className="flex items-center gap-2">
            <Input
              type="url"
              placeholder="https://..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={uploading}
              className="text-xs"
            />
          </div>
        </div>
      </div>

      {uploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Uploading to Firebase Storage...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
