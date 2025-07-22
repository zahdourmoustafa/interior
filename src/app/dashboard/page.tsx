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
    title: 'Magic Edit',
    description: 'Easily transform your scene with simple text descriptions. See the results in seconds.',
    href: '/dashboard/magic-edit',
    backgroundImage: '/coastal.webp',
    minutes: 2,
    generation: 1,
    badgeText: 'NEW',
    badgeVariant: 'new'
  },
  {
    title: 'Style Transfer',
    description: 'Instantly apply amazing design styles to your interiors and exteriors.',
    href: '/dashboard/style-transfer',
    backgroundImage: '/vintage.webp',
    minutes: 1,
    generation: 1,
    badgeText: 'PRO',
    badgeVariant: 'pro'
  },
  {
    title: 'Virtual Staging',
    description: 'Reimagine your home with AI. Upload a photo, select a style, and transform your interiors instantly.',
    href: '/dashboard/virtual-staging',
    backgroundImage: '/tropical.webp',
    minutes: 1,
    generation: 1
  },
  {
    title: 'Enhance',
    description: 'Easily make images and improve their quality by reducing noise and enhancing details. Perfect for all your design needs.',
    href: '/dashboard/enhance',
    backgroundImage: '/industrial.webp',
    minutes: 1,
    generation: 1
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <ErrorBoundary>
        <div className="bg-[#F8F8FA] min-h-screen p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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