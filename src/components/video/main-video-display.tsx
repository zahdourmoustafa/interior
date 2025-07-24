'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MainVideoDisplayProps {
  selectedImage: string | null;
  generatedVideo: string | null;
  isGenerating: boolean;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
  onRemoveGeneratedVideo: () => void;
}

export function MainVideoDisplay({
  selectedImage,
  generatedVideo,
  isGenerating,
  onImageUpload,
  onImageRemove,
  onRemoveGeneratedVideo,
}: MainVideoDisplayProps) {
  const [dragActive, setDragActive] = useState(false);

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
    if (!generatedVideo) return;
    try {
      const response = await fetch(generatedVideo);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-video.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Video downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download video');
    }
  };

  return (
    <div className="flex-1 grid grid-cols-1 grid-rows-1 gap-4 h-full p-4 bg-gray-100 rounded-lg">
      <Card
        className={cn(
          'relative w-full h-full border-2 transition-colors duration-200 flex items-center justify-center group',
                        dragActive ? 'border-[#3b82f6] bg-[#3b82f6]/10' : 'border-gray-300',
          selectedImage ? 'border-solid' : 'border-dashed',
          !selectedImage ? 'cursor-pointer hover:border-gray-400' : ''
        )}
        onDragEnter={!selectedImage ? handleDrag : undefined}
        onDragLeave={!selectedImage ? handleDrag : undefined}
        onDragOver={!selectedImage ? handleDrag : undefined}
        onDrop={!selectedImage ? handleDrop : undefined}
        onClick={() => !selectedImage && document.getElementById('file-upload-video')?.click()}
      >
        {generatedVideo ? (
          <video src={generatedVideo} controls className="w-full h-full object-contain rounded-md" />
        ) : selectedImage ? (
          <Image src={selectedImage} alt="Room design" fill className="object-cover rounded-md" />
        ) : (
          <div className="text-center p-4">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-800">Upload Image</h3>
            <p className="text-sm text-gray-500">Drag & drop or click to upload</p>
          </div>
        )}

        {isGenerating && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-md">
            <div className="text-center text-white">
              <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3" />
              <p className="font-medium">Generating Video...</p>
            </div>
          </div>
        )}

        {generatedVideo && (
          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={handleDownload}><Download className="h-4 w-4" /></Button>
            <Button size="icon" variant="destructive" className="h-8 w-8" onClick={onRemoveGeneratedVideo}><X className="h-4 w-4" /></Button>
          </div>
        )}
        
        {selectedImage && !generatedVideo && (
          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="destructive" className="h-8 w-8" onClick={onImageRemove}><X className="h-4 w-4" /></Button>
          </div>
        )}

        {!selectedImage && <input id="file-upload-video" type="file" className="hidden" accept="image/*" onChange={handleFileInput} />}
      </Card>
    </div>
  );
}