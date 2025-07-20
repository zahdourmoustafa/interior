'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Download, Eye } from 'lucide-react';
import Image from 'next/image';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  roomType: string;
  styles: string[];
}

interface GeneratedImagesGridProps {
  images: GeneratedImage[];
  onFavorite: (id: string) => void;
  onDownload: (url: string) => void;
  onView: (image: GeneratedImage) => void;
}

export function GeneratedImagesGrid({ 
  images, 
  onFavorite, 
  onDownload, 
  onView 
}: GeneratedImagesGridProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const handleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
    onFavorite(id);
  };

  if (images.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="aspect-square">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <div className="text-4xl mb-2">🖼️</div>
                <p className="text-sm">Image {index + 1}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {images.map((image) => (
        <Card key={image.id} className="group relative overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-square">
              <Image
                src={image.url}
                alt={`Generated ${image.roomType} in ${image.styles.join(', ')} style`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => onView(image)}
                    className="h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => handleFavorite(image.id)}
                    className="h-8 w-8"
                  >
                    <Heart 
                      className={`h-4 w-4 ${favorites.has(image.id) ? 'fill-red-500 text-red-500' : ''}`} 
                    />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => onDownload(image.url)}
                    className="h-8 w-8"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}