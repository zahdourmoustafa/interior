'use client';

import { useState } from 'react';
import { GeneratedImagesGrid } from './generated-images-grid';
import { Card, CardContent } from '@/components/ui/card';
import { Image as ImageIcon } from 'lucide-react';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  roomType: string;
  styles: string[];
}

export function ImageDisplay() {
  const [generatedImages] = useState<GeneratedImage[]>([]);

  const handleFavorite = (id: string) => {
    console.log('Favorite:', id);
  };

  const handleDownload = (url: string) => {
    console.log('Download:', url);
  };

  const handleView = (image: GeneratedImage) => {
    console.log('View:', image);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Generated Images</h2>
        <p className="text-sm text-muted-foreground">
          Your AI-generated designs will appear here
        </p>
      </div>

      {generatedImages.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              No images generated yet
            </p>
            <p className="text-xs text-muted-foreground">
              Upload an image and select your preferences to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <GeneratedImagesGrid
          images={generatedImages}
          onFavorite={handleFavorite}
          onDownload={handleDownload}
          onView={handleView}
        />
      )}
    </div>
  );
}