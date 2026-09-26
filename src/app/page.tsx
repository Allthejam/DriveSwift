import CmsPage from "@/app/cms/edit-dialogs";
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function generateMetadata(): Promise<Metadata> {
  let title = "DriveSwift | AI-Powered Platform for Driving Instructors & Driving Schools";
  let description = "The all-in-one platform for modern UK driving instructors and driving schools. Manage your diary, pupil progress, payments, and generate AI lesson plans.";
  let keywords = "driving instructor app, ADI software, PDI syllabus, driving school diary, driving lesson planner, AI lesson generator";
  let ogTitle = "DriveSwift | AI-Powered Platform for Driving Instructors";
  let ogDescription = "Manage your driving school, track pupil progress, and generate AI lesson plans with DriveSwift.";
  let ogImage = "https://placehold.co/1200x630.png";
  let canonicalUrl = "https://driveswift.app";

  try {
    const docRef = doc(db, "cms", "landing_page");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().seo) {
      const seo = docSnap.data().seo;
      if (seo.metaTitle) title = seo.metaTitle;
      if (seo.metaDescription) description = seo.metaDescription;
      if (seo.keywords) keywords = seo.keywords;
      if (seo.ogTitle) ogTitle = seo.ogTitle;
      if (seo.ogDescription) ogDescription = seo.ogDescription;
      if (seo.ogImage) ogImage = seo.ogImage;
      if (seo.canonicalUrl) canonicalUrl = seo.canonicalUrl;
    }
  } catch (err) {
    console.warn("Could not fetch server metadata from Firestore, using default SEO:", err);
  }

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: ogTitle || title,
      description: ogDescription || description,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle || title,
      description: ogDescription || description,
      images: [ogImage],
    }
  };
}

export default function Page() {
    return (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-8 text-center text-muted-foreground">Loading DriveSwift...</div>}>
        <CmsPage />
      </Suspense>
    );
}
