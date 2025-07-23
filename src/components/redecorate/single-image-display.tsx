'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, Maximize2, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ImageDialog } from '@/components/ui/image-dialog';

interface SingleImageDisplayProps {
  image: string | null;
  isGenerating: boolean;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
  title?: string;
  description?: string;
}

export function SingleImageDisplay({
  image,
  isGenerating,
  onImageUpload,
  onImageRemove,
  title = "Upload Your Image",
  description = "Drag & drop or click to upload your empty room"
}: SingleImageDisplayProps) {
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
    if (onImageUpload && e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onImageUpload && e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleDownload = async () => {
    if (!image) return;
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interior-design-${Date.now()}.jpg`;
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

  return (
    <>
      <Card
        className={cn(
          'relative w-full h-full border-2 transition-colors duration-200 flex items-center justify-center group',
          dragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300',
          image ? 'border-solid' : 'border-dashed',
          !image ? 'cursor-pointer hover:border-gray-400' : ''
        )}
        onDragEnter={!image ? handleDrag : undefined}
        onDragLeave={!image ? handleDrag : undefined}
        onDragOver={!image ? handleDrag : undefined}
        onDrop={!image ? handleDrop : undefined}
        onClick={() => !image && document.getElementById('single-file-upload')?.click()}
      >
        {image ? (
          <Image src={image} alt="Room design" fill className="object-cover rounded-md" />
        ) : (
          <div className="text-center p-4">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
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

        {image && (
          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={handleDownload}><Download className="h-4 w-4" /></Button>
            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => setShowImageModal(true)}><Maximize2 className="h-4 w-4" /></Button>
            {onImageRemove && (
              <Button size="icon" variant="destructive" className="h-8 w-8" onClick={onImageRemove}><X className="h-4 w-4" /></Button>
            )}
          </div>
        )}

        {!image && <input id="single-file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileInput} />}
      </Card>

      <ImageDialog
        isOpen={showImageModal}
        onOpenChange={setShowImageModal}
        imageUrl={image}
      />
    </>
  );
}