import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function SketchToRealityPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sketch to Reality</h1>
          <p className="text-muted-foreground">
            Convert hand-drawn sketches into realistic renders
          </p>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground">
            This feature is under development. Check back soon!
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}