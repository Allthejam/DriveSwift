import CmsPage from "@/app/cms/edit-dialogs";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DriveSwift | AI-Powered Platform for Driving Instructors',
  description: 'The all-in-one platform for modern driving instructors. Manage your diary, track pupil progress, and generate lesson plans with AI. Start your free trial today.',
};

export default function Page() {
    return <CmsPage />;
}
