'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GitCompare } from 'lucide-react';
import Image from 'next/image';
import { ImageComparisonSlider } from '@/components/redecorate/image-comparison-slider';

interface ImageDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  imageUrl: string | null;
  originalImageUrl?: string | null;
  slotType?: 'upload' | 'generated';
  slotIndex?: number;
}

export function ImageDialog({
  isOpen,
  onOpenChange,
  imageUrl,
  originalImageUrl,
  slotType,
  slotIndex,
}: ImageDialogProps) {
  const [showComparison, setShowComparison] = useState(false);

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setShowComparison(false);
    }
  };

  const canCompare = slotType === 'generated' && imageUrl && originalImageUrl;

  if (!imageUrl) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full h-[90vh] sm:max-w-7xl p-0 bg-transparent border-0 shadow-none">
        <DialogTitle className="sr-only">
          Enlarged view of {slotType} image {slotIndex}
        </DialogTitle>

        <div className="relative w-full h-full">
          {showComparison && canCompare ? (
            <ImageComparisonSlider beforeImage={originalImageUrl!} afterImage={imageUrl} />
          ) : (
            <Image
              src={imageUrl}
              alt="Full size image"
              fill
              className="object-cover rounded-lg"
            />
          )}
        </div>

        {canCompare && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <Button onClick={() => setShowComparison((p) => !p)} variant="secondary">
              <GitCompare className="h-4 w-4 mr-2" />
              {showComparison ? 'Hide Comparison' : 'Compare'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
