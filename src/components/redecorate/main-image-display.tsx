'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, Maximize2, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ImageDialog } from '@/components/ui/image-dialog';

interface MainImageDisplayProps {
  selectedImage: string | null;
  generatedImages: string[];
  isGenerating: boolean;
  generatingSlot: number | null;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
  onRemoveGeneratedImage: (index: number) => void;
  showUploadArea?: boolean;
}

// A sub-component for each slot in the grid
function ImageSlot({
  imageUrl,
  originalImageUrl,
  isGenerating,
  onUpload,
  onRemove,
  slotType = 'generated',
  slotIndex,
  showUploadArea = true,
}: {
  imageUrl: string | null;
  originalImageUrl?: string | null;
  isGenerating?: boolean;
  onUpload?: (file: File) => void;
  onRemove?: () => void;
  slotType?: 'upload' | 'generated';
  slotIndex?: number;
  showUploadArea?: boolean;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (onUpload && e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onUpload && e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interior-design-${Date.now()}-${slotIndex}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download image');
    }
  };

  const canUpload = slotType === 'upload' && showUploadArea;

  return (
    <>
      <Card
        className={cn(
          'relative w-full h-full border-2 transition-colors duration-200 flex items-center justify-center group',
                      dragActive ? 'border-[#3b82f6] bg-[#3b82f6]/10' : 'border-gray-300',
          imageUrl ? 'border-solid' : 'border-dashed',
          canUpload && !imageUrl ? 'cursor-pointer hover:border-gray-400' : ''
        )}
        onDragEnter={canUpload ? handleDrag : undefined}
        onDragLeave={canUpload ? handleDrag : undefined}
        onDragOver={canUpload ? handleDrag : undefined}
        onDrop={canUpload ? handleDrop : undefined}
        onClick={() => canUpload && !imageUrl && document.getElementById(`file-upload-${slotIndex}`)?.click()}
      >
        {imageUrl ? (
          <Image src={imageUrl} alt="Room design" fill className="object-cover rounded-md" />
        ) : (
          <div className="text-center p-4">
            {canUpload ? (
              <>
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-800">Upload Original Image</h3>
                <p className="text-sm text-gray-500">Drag & drop or click to upload</p>
              </>
            ) : (
              <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            )}
          </div>
        )}

        {isGenerating && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-md">
            <div className="text-center text-white">
              <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3" />
              <p className="font-medium">Generating...</p>
            </div>
          </div>
        )}

        {imageUrl && (
          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={handleDownload}><Download className="h-4 w-4" /></Button>
            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => setShowImageModal(true)}><Maximize2 className="h-4 w-4" /></Button>
            {onRemove && (
              <Button size="icon" variant="destructive" className="h-8 w-8" onClick={onRemove}><X className="h-4 w-4" /></Button>
            )}
          </div>
        )}

        {canUpload && <input id={`file-upload-${slotIndex}`} type="file" className="hidden" accept="image/*" onChange={handleFileInput} />}
      </Card>

      <ImageDialog
        isOpen={showImageModal}
        onOpenChange={setShowImageModal}
        imageUrl={imageUrl}
        originalImageUrl={originalImageUrl}
        slotType={slotType}
        slotIndex={slotIndex}
      />
    </>
  );
}

export function MainImageDisplay({
  selectedImage,
  generatedImages,
  isGenerating,
  generatingSlot,
  onImageUpload,
  onImageRemove,
  onRemoveGeneratedImage,
  showUploadArea = true,
}: MainImageDisplayProps) {

  const slots = [0, 1, 2, 3];
  const firstSlotImage = generatedImages.length > 0 ? generatedImages[0] : selectedImage;

  return (
    <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 h-full p-4 bg-gray-100 rounded-lg">
      {/* Slot 0 (Top-Left) */}
      <ImageSlot
        imageUrl={firstSlotImage}
        originalImageUrl={selectedImage}
        isGenerating={isGenerating && generatingSlot === 0}
        onUpload={onImageUpload}
        onRemove={generatedImages.length > 0 ? () => onRemoveGeneratedImage(0) : onImageRemove}
        slotType={generatedImages.length > 0 ? "generated" : "upload"}
        slotIndex={0}
        showUploadArea={showUploadArea}
      />

      {/* Other slots */}
      {slots.slice(1).map(index => (
        <ImageSlot
          key={index}
          imageUrl={generatedImages[index] || null}
          originalImageUrl={selectedImage}
          isGenerating={isGenerating && generatingSlot === index}
          onRemove={generatedImages[index] ? () => onRemoveGeneratedImage(index) : undefined}
          slotIndex={index}
        />
      ))}
    </div>
  );
}