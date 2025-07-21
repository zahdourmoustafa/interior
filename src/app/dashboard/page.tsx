import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { FeatureCard } from '@/components/dashboard/feature-card';
import { Palette, Image as ImageIcon, Video, Home } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const features = [
  {
    title: 'Redecoration AI',
    description: 'Reimagine interiors with fresh color schemes, layouts, and styles powered by AI.',
    icon: <Palette className="h-6 w-6" />,
    href: '/dashboard/redecorate-room',
    backgroundImage: '/modern.webp',
    features: ['Style Transfer', 'Texture Synthesis', 'Color Harmonization'],
  },
  {
    title: 'Moodboard AI',
    description: 'Upload a moodboard and your room photo to instantly harmonize colors—preview, tweak with a slider, and download.',
    icon: <ImageIcon className="h-6 w-6" />,
    href: '/dashboard/sketch-to-reality',
    backgroundImage: '/professional.webp',
    features: ['Dynamic Lighting', 'Time-of-day Shades', 'colors—preview'],
  },
  {
    title: 'Staging Master AI',
    description: 'Stage properties virtually for real estate marketing with AI-driven furniture placement.',
    icon: <Home className="h-6 w-6" />,
    href: '/dashboard/redesign-exterior',
    backgroundImage: '/neoclassic.webp',
    features: ['3D Generation', 'Structural Analysis', 'Form Optimization'],
  },
  {
    title: 'Sketch AI',
    description: 'Transform rough sketches into refined architectural designs using advanced AI.',
    icon: <Video className="h-6 w-6" />,
    href: '/dashboard/generate-videos',
    backgroundImage: '/summer.webp',
    features: ['Plant Selection', 'Terrain Modeling', 'Water Features'],
  },
  {
    title: 'Design from Text AI',
    description: 'Generate entire designs from text prompts in seconds using cutting-edge AI.',
    icon: <ImageIcon className="h-6 w-6" />,
    href: '/dashboard/sketch-to-reality',
    backgroundImage: '/coastal.webp',
    features: ['4K Resolution', 'Lighting Enhancement', 'Material Optimization'],
  },
  {
    title: 'Product Staging',
    description: 'Visualize furniture arrangements in real time with photorealistic AI rendering.',
    icon: <Home className="h-6 w-6" />,
    href: '/dashboard/redesign-exterior',
    backgroundImage: '/vintage.webp',
    features: ['Texture Generation', 'PBR Materials', 'Custom Patterns'],
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                href={feature.href}
                backgroundImage={feature.backgroundImage}
                features={feature.features}
              />
            ))}
          </div>
        </div>
      </ErrorBoundary>
    </DashboardLayout>
  );
}