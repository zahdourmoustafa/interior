import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { db } from '@/lib/db';
import { videos } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

async function getSavedVideos() {
  const savedVideos = await db.select().from(videos).orderBy(desc(videos.createdAt));
  return savedVideos;
}

export default async function SavedVideosPage() {
  const savedVideos = await getSavedVideos();

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Saved Videos</h1>
            <p className="text-muted-foreground">
              Browse and manage your generated videos.
            </p>
          </div>

          {savedVideos.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {savedVideos.map((video) => (
                <div key={video.id} className="rounded-lg overflow-hidden shadow-lg">
                  <video src={video.generatedVideoUrl!} controls className="w-full" />
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Effect: {video.effect}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Generated on: {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'Unknown date'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">You haven&apos;t saved any videos yet.</p>
            </div>
          )}
        </div>
      </ErrorBoundary>
    </DashboardLayout>
  );
}
