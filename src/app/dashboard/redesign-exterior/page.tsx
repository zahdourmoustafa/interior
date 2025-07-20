import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function RedesignExteriorPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Redesign Exterior</h1>
          <p className="text-muted-foreground">
            Transform exterior spaces with architectural visualization
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