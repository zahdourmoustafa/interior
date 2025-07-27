'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Play, Download } from 'lucide-react';

interface SingleVideoDisplayProps {
  selectedImage: string | null;
  generatedVideo: string | null;
  isGenerating: boolean;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
}

export function SingleVideoDisplay({
  selectedImage,
  generatedVideo,
  isGenerating,
  onImageUpload,
  onImageRemove,
}: SingleVideoDisplayProps) {
  const [showVideo, setShowVideo] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
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
      a.download = `interior-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Video Generation</h2>
        {selectedImage && (
          <Button
            onClick={onImageRemove}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-2" />
            Remove Image
          </Button>
        )}
      </div>

      {/* Main Display Area */}
      <div className="flex-1 flex items-center justify-center">
        {!selectedImage ? (
          /* Upload Area */
          <div className="w-full max-w-2xl">
            <label
              htmlFor="video-file-upload"
              className="flex flex-col items-center justify-center w-full h-96 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 mb-4 text-gray-400" />
                <p className="mb-2 text-lg font-medium text-gray-700">
                  Upload an image to generate video
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG or JPEG (MAX. 10MB)
                </p>
              </div>
              <input
                id="video-file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        ) : (
          /* Image/Video Display */
          <div className="relative w-full max-w-4xl">
            <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
              {showVideo && generatedVideo ? (
                /* Video Player */
                <video
                  controls
                  autoPlay
                  loop
                  className="w-full h-auto max-h-[70vh] object-contain"
                  poster={selectedImage}
                >
                  <source src={generatedVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                /* Image Display */
                <div className="relative">
                  <Image
                    src={selectedImage}
                    alt="Selected interior"
                    width={800}
                    height={600}
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                  
                  {/* Loading Overlay */}
                  {isGenerating && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold mb-2">Generating Video...</h3>
                        <p className="text-sm opacity-90">This may take 60-120 seconds</p>
                        <div className="mt-4 bg-white bg-opacity-20 rounded-full h-2 w-64 mx-auto">
                          <div className="bg-white h-2 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Play Button Overlay (when video is ready) */}
                  {generatedVideo && !isGenerating && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() => setShowVideo(true)}
                        size="lg"
                        className="bg-white text-black hover:bg-gray-100"
                      >
                        <Play className="h-6 w-6 mr-2" />
                        Play Video
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                {generatedVideo && (
                  <>
                    <Button
                      onClick={() => setShowVideo(!showVideo)}
                      variant="outline"
                      size="sm"
                    >
                      {showVideo ? 'Show Image' : 'Show Video'}
                    </Button>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </>
                )}
              </div>
              
              {/* Status */}
              <div className="flex items-center gap-2 text-sm">
                {isGenerating ? (
                  <>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-yellow-600 font-medium">Generating...</span>
                  </>
                ) : generatedVideo ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Video Ready</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-600 font-medium">Ready to Generate</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
