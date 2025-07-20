'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ControlPanel } from '@/components/redecorate/control-panel';
import { ImageDisplay } from '@/components/redecorate/image-display';

export default function RedecorateRoomPage() {
  return (
    <DashboardLayout useContainer={false}>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Panel - Controls */}
        <div className="w-120 border-r bg-card p-6 overflow-y-auto">
          <ControlPanel />
        </div>
        
        {/* Right Panel - Image Display */}
        <div className="flex-1 p-6 overflow-y-auto">
          <ImageDisplay />
        </div>
      </div>
    </DashboardLayout>
  );
}