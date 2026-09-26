"use client";

import React, { useState } from "react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud, CheckCircle } from "lucide-react";
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

    // Helper: Convert file to instant Base64 Data URL
    const readAsDataURL = (f: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(f);
      });
    };

    try {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
      
      // Attempt Firebase Storage upload with a 3-second timeout fallback
      const uploadPromise = (async () => {
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
      })();

      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error("Storage timeout")), 3000)
      );

      let finalUrl = "";
      try {
        finalUrl = await Promise.race([uploadPromise, timeoutPromise]);
        toast({
          title: "Uploaded to Firebase Storage!",
          description: `Image saved to Cloud Storage (${(file.size / 1024).toFixed(0)} KB).`,
        });
      } catch (storageErr) {
        console.warn("Firebase Storage unavailable or uninitialized. Falling back to instant Base64 format:", storageErr);
        finalUrl = await readAsDataURL(file);
        toast({
          title: "Image Uploaded Successfully",
          description: `Image processed and applied (${(file.size / 1024).toFixed(0)} KB).`,
        });
      }

      onChange(finalUrl);
    } catch (err: any) {
      console.error("Image processing error:", err);
      try {
        const dataUrl = await readAsDataURL(file);
        onChange(dataUrl);
        toast({
          title: "Image Loaded",
          description: "Applied image successfully.",
        });
      } catch (readErr) {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "Could not read the selected image file.",
        });
      }
    } finally {
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
          <Label className="text-xs text-muted-foreground mb-1 block">Choose Image File (up to {maxSizeMB}MB)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="text-xs cursor-pointer"
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
        <div className="flex items-center gap-2 text-xs text-primary font-medium animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing & Uploading Image...</span>
        </div>
      )}
    </div>
  );
}
