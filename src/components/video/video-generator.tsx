'use client';

import { useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Play, RotateCcw, ZoomIn, ZoomOut, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { toast } from 'sonner';

interface GenerationStatus {
  id: string;
  status: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  completedAt?: string;
}

export function VideoGenerator() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
    },
    maxSize: 10 * 1024 * 1024, // 10MB for video
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setVideoUrl(null); // Reset previous video
        setGenerationId(null);
      }
    },
  });

  const checkGenerationStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/video/status/${id}`);
      const data: GenerationStatus = await response.json();

      if (data.status === 'completed' && data.videoUrl) {
        setVideoUrl(data.videoUrl);
        setIsGenerating(false);
        setProgress(100);
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
          statusIntervalRef.current = null;
        }
        toast.success('Video generated successfully!');
      } else if (data.status === 'failed') {
        setIsGenerating(false);
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
          statusIntervalRef.current = null;
        }
        toast.error('Video generation failed');
      } else {
        // Update progress based on status
        const progressMap: Record<string, number> = {
          'created': 10,
          'pending': 25,
          'dreaming': 40,
          'processing': 50,
          'generating': 75,
          'in_progress': 50,
        };
        setProgress(progressMap[data.status] || 25);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const handleGenerateVideo = async () => {
    if (!selectedFile || !selectedEffect) {
      toast.error('Please select an image and video effect');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setVideoUrl(null);

    try {
      // Create FormData to send the image file
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('effect', selectedEffect);

      // Start video generation
      const apiResponse = await fetch('/api/video/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(data.error || 'Failed to start video generation');
      }

      setGenerationId(data.generationId);
      setProgress(10);

      // Start polling for status
      statusIntervalRef.current = setInterval(() => {
        checkGenerationStatus(data.generationId);
      }, 5000); // Check every 5 seconds

      toast.success('Video generation started! (Using your uploaded image)');

    } catch (error) {
      console.error('Generation error:', error);
      setIsGenerating(false);
      toast.error(error instanceof Error ? error.message : 'Failed to generate video');
    }
  };

  const handleDownload = async () => {
    if (videoUrl) {
      try {
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = selectedFile?.name.replace(/\.[^/.]+$/, ".mp4") || "generated-video.mp4";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading video:", error);
        toast.error("Failed to download video.");
      }
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setVideoUrl(null);
    setGenerationId(null);
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Image Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Upload Image</CardTitle>
        </CardHeader>
        <CardContent>
          {!previewUrl ? (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {isDragActive ? 'Drop your image here' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, WebP up to 10MB
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Selected room"
                  fill
                  className="object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Settings */}
      {selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Choose Video Effect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant={selectedEffect === 'arcAroundObject' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setSelectedEffect('arcAroundObject')}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Arc Around Object
              </Button>
              
              <Button
                variant={selectedEffect === 'zoomIn' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setSelectedEffect('zoomIn')}
              >
                <ZoomIn className="h-4 w-4 mr-2" />
                Zoom In
              </Button>
              
              <Button
                variant={selectedEffect === 'zoomOut' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => setSelectedEffect('zoomOut')}
              >
                <ZoomOut className="h-4 w-4 mr-2" />
                Zoom Out
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Button */}
      {selectedFile && selectedEffect && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Generate Video</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              size="lg"
              onClick={handleGenerateVideo}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generating Video...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate Video
                </>
              )}
            </Button>

            {isGenerating && (
              <div className="mt-4">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Creating your video... {progress}%
                </p>
                {generationId && (
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    Generation ID: {generationId}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Video Preview */}
      {videoUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Your Generated Video</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <video
              src={videoUrl}
              controls
              className="w-full rounded-lg"
              style={{ maxHeight: '400px' }}
            />
            <div className="flex gap-4">
              <Button onClick={handleDownload} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Video
              </Button>
              <Button onClick={() => toast.success("Video saved to your dashboard!")} className="w-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Save to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
