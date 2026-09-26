import CmsPage from "@/app/cms/edit-dialogs";
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'DriveSwift | AI-Powered Platform for Driving Instructors',
  description: 'The all-in-one platform for modern driving instructors. Manage your diary, track pupil progress, and generate lesson plans with AI. Start your free trial today.',
};

export default function Page() {
    return (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-8 text-center text-muted-foreground">Loading DriveSwift...</div>}>
        <CmsPage />
      </Suspense>
    );
}
