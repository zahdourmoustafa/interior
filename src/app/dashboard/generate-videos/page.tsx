'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { VideoGenerator } from '@/components/video/video-generator';

export default function GenerateVideosPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Generate Videos</h1>
          <p className="text-muted-foreground">
            Create immersive video walkthroughs with 180° rotation and zoom effects
          </p>
        </div>
        
        <VideoGenerator />
      </div>
    </DashboardLayout>
  );
}