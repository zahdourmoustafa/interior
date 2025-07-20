import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { FeatureCard } from '@/components/dashboard/feature-card';
import { Palette, Image as ImageIcon, Video, Home } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const features = [
  {
    title: 'Redecorate Room',
    description: 'Transform your existing rooms with AI-powered design',
    icon: <Palette className="h-6 w-6 text-white" />,
    href: '/dashboard/redecorate-room',
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    title: 'From Sketch to Reality',
    description: 'Convert hand-drawn sketches into realistic renders',
    icon: <ImageIcon className="h-6 w-6 text-white" />,
    href: '/dashboard/sketch-to-reality',
    color: 'bg-green-500',
    gradient: 'from-green-500 to-green-600',
  },
  {
    title: 'Generate Videos',
    description: 'Create immersive video walkthroughs of your designs',
    icon: <Video className="h-6 w-6 text-white" />,
    href: '/dashboard/generate-videos',
    color: 'bg-purple-500',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Redesign Exterior',
    description: 'Transform exterior spaces with architectural visualization',
    icon: <Home className="h-6 w-6 text-white" />,
    href: '/dashboard/redesign-exterior',
    color: 'bg-orange-500',
    gradient: 'from-orange-500 to-orange-600',
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <ErrorBoundary>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome to InteriorAI Pro</h1>
            <p className="text-muted-foreground">
              Choose a feature to start transforming your spaces with AI
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                href={feature.href}
                color={feature.color}
                gradient={feature.gradient}
              />
            ))}
          </div>
        </div>
      </ErrorBoundary>
    </DashboardLayout>
  );
}