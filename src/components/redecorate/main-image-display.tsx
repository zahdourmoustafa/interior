'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Heart, Download, Maximize2, RotateCcw, Split } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ImageComparisonSlider } from './image-comparison-slider';

interface MainImageDisplayProps {
  selectedImage: string | null;
  generatedImage: string | null;
  isGenerating: boolean;
  onImageUpload: (file: File) => void;
}

export function MainImageDisplay({ 
  selectedImage, 
  generatedImage, 
  isGenerating,
  onImageUpload 
}: MainImageDisplayProps) {
  const [dragActive, setDragActive] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

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

  const displayImage = generatedImage || selectedImage;
  const canShowComparison = selectedImage && generatedImage;

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
              <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white">
                <Heart className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white">
                <Download className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
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
                Upload your room image
              </h3>
              <p className="text-gray-500 mb-4">
                Drag and drop an image here, or click to select
              </p>
              <p className="text-sm text-gray-400">
                Supports JPG, PNG, WebP up to 10MB
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
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-center space-x-4 mt-4 p-4 bg-black rounded-lg">
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
          History
        </Button>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
          Retouch
        </Button>
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
          <div className="w-6 h-6 bg-black rounded-full"></div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "text-white hover:bg-white/10",
            showComparison && "bg-white/20 text-white"
          )}
          onClick={handleBeforeAfterToggle}
          disabled={!canShowComparison}
        >
          <Split className="h-4 w-4 mr-1" />
          Before/After
        </Button>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
          Upload
        </Button>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
          Upscale
        </Button>
      </div>
    </div>
  );
}