'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Upload, Heart, Download, Maximize2, RotateCcw, Split, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ImageComparisonSlider } from './image-comparison-slider';
import { toast } from 'sonner';

interface MainImageDisplayProps {
  selectedImage: string | null;
  generatedImage: string | null;
  isGenerating: boolean;
  onImageUpload: (file: File) => void;
  onImageRemove?: () => void;
  uploadText?: {
    title: string;
    description: string;
    placeholder: string;
  };
  showCompareButton?: boolean;
  showUploadArea?: boolean;
}

export function MainImageDisplay({ 
  selectedImage, 
  generatedImage, 
  isGenerating,
  onImageUpload,
  onImageRemove,
  uploadText,
  showCompareButton = true,
  showUploadArea = true
}: MainImageDisplayProps) {
  const [dragActive, setDragActive] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleBeforeAfterToggle = () => {
    if (selectedImage && generatedImage) {
      setShowComparison(!showComparison);
    }
  };

  const handleRemoveImage = () => {
    if (onImageRemove) {
      onImageRemove();
    }
    setShowComparison(false);
  };

  const handleLike = () => {
    toast.success("Added to favorites!");
  };

  const handleDownload = async () => {
    if (!displayImage) return;
    
    try {
      const response = await fetch(displayImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interior-design-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download image");
    }
  };

  const handleExpand = () => {
    if (!displayImage) return;
    setShowImageModal(true);
  };

  const displayImage = generatedImage || selectedImage;
  const canShowComparison = selectedImage && generatedImage;

  // Default upload text
  const defaultUploadText = {
    title: "Upload your room image",
    description: "Drag and drop an image here, or click to select",
    placeholder: "Supports JPG, PNG, WebP up to 10MB"
  };

  const finalUploadText = uploadText || defaultUploadText;

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Main Image Area */}
      <div className="flex-1 relative">
        {displayImage ? (
          <div className="relative w-full h-full">
            {showComparison && canShowComparison ? (
              <ImageComparisonSlider
                beforeImage={selectedImage!}
                afterImage={generatedImage!}
                className="w-full h-full"
              />
            ) : (
              <Image
                src={displayImage}
                alt="Room design"
                fill
                className="object-cover rounded-lg"
              />
            )}
            
            {/* Loading Overlay */}
            {isGenerating && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-lg font-medium">Generating your design...</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white" onClick={handleLike}>
                <Heart className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white" onClick={handleExpand}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Delete Button */}
            <Button 
              size="icon" 
              variant="destructive" 
              className="absolute top-4 left-4 bg-red-500/90 hover:bg-red-600 text-white"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          showUploadArea && (
            <Card
              className={cn(
                "w-full h-full border-2 border-dashed transition-colors duration-200 flex items-center justify-center cursor-pointer",
                dragActive ? "border-orange-500 bg-orange-50" : "border-gray-300 hover:border-gray-400"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <div className="text-center p-8">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {finalUploadText.title}
                </h3>
                <p className="text-gray-500 mb-4">
                  {finalUploadText.description}
                </p>
                <p className="text-sm text-gray-400">
                  {finalUploadText.placeholder}
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileInput}
              />
            </Card>
          )
        )}
      </div>

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] w-[1600px] h-[1000px] p-0 overflow-hidden border-0">
          <DialogTitle className="sr-only">Full size image</DialogTitle>
          <div className="relative w-full h-full bg-black">
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white"
              onClick={() => setShowImageModal(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            {displayImage && (
              <Image
                src={displayImage}
                alt="Full size image"
                fill
                className="object-contain"
                sizes="(max-width: 1600px) 98vw, 1600px"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}