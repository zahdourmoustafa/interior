import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { FeatureCard } from '@/components/dashboard/feature-card';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const features = [
  {
    title: 'Interior',
    description: 'Turn any room into a beautiful interior. Upload a photo or choose a template, pick a style, and let AI do the rest.',
    href: '/dashboard/redecorate-room',
    backgroundImage: '/modern.webp',
    minutes: 1,
    generation: 1
  },
  {
    title: 'Exterior',
    description: 'Redesign your exterior in seconds. Just upload a photo or sketch and see the magic in action.',
    href: '/dashboard/redesign-exterior',
    backgroundImage: '/professional.webp',
    minutes: 1,
    generation: 1
  },
  {
    title: 'Sketch',
    description: 'Transform your sketch into a beautiful image. Upload your draft, select a style, and let AI create the final design.',
    href: '/dashboard/sketch-to-reality',
    backgroundImage: '/neoclassic.webp',
    minutes: 1,
    generation: 1,
    badgeText: 'Image'
  },
  {
    title: 'Furnish Empty Space',
    description: 'Upload an image of an empty room and let AI furnish it for you.',
    href: '/dashboard/furnish-empty-space',
    backgroundImage: '/summer.webp',
    minutes: 1,
    generation: 1
  },
  {
    title: 'Remove Object',
    description: 'Use the brush to select objects you want to remove from the image.',
    href: '/dashboard/remove-object',
    backgroundImage: '/coastal.webp',
    minutes: 1,
    generation: 1,
    badgeText: 'AI',
    badgeVariant: 'new'
  },
  {
    title: 'Generate Video',
    description: 'Create stunning videos from your images with AI.',
    href: '/dashboard/generate-videos',
    backgroundImage: '/vintage.webp',
    minutes: 3,
    generation: 1,
    badgeText: 'NEW',
    badgeVariant: 'new'
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <ErrorBoundary>
        <div className="bg-[#F8F8FA] min-h-screen p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                href={feature.href}
                backgroundImage={feature.backgroundImage}
                minutes={feature.minutes}
                generation={feature.generation}
                badgeText={feature.badgeText}
                badgeVariant={feature.badgeVariant as "new" | "pro" | undefined}
              />
            ))}
          </div>
        </div>
      </ErrorBoundary>
    </DashboardLayout>
  );
}