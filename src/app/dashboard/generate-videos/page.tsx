'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import toast, { Toaster } from 'react-hot-toast';
import { MainVideoDisplay } from '@/components/video/main-video-display';
import { VideoControlSidebar } from '@/components/video/video-control-sidebar';

export default function GenerateVideosPage() {
  // State management
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);

  // Handlers
  const handleEffectSelect = (effectId: string) => {
    setSelectedEffect(effectId);
  };

  const handleImageUpload = async (file: File) => {
    const uploadToast = toast.loading('Uploading image...');
    
    try {
      // Create object URL for immediate preview
      const previewUrl = URL.createObjectURL(file);
      setSelectedImage(previewUrl);
      setGeneratedVideo(null); // Clear previous generations

      // Upload to server
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      // Update with server URL
      setSelectedImage(result.imageUrl);
      toast.success('Image uploaded successfully!', { id: uploadToast });
      console.log('✅ Image uploaded successfully:', result.imageUrl);

    } catch (error) {
      console.error('❌ Upload failed:', error);
      toast.error('Failed to upload image. Please try again.', { id: uploadToast });
      // Keep the preview URL if upload fails
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setGeneratedVideo(null);
    toast.success('Image removed. You can upload a new image.');
  };

  const handleRemoveGeneratedVideo = () => {
    setGeneratedVideo(null);
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      toast.error('Please upload an image first');
      return;
    }
    
    if (!selectedEffect) {
      toast.error('Please select a video effect');
      return;
    }

    setIsGenerating(true);
    toast.loading(`📹 Generating video... This may take 30-60 seconds`);
    
    try {
      // Create FormData to send the image file
      const formData = new FormData();
      // We need to fetch the image from the URL to send it to the API
      const imageResponse = await fetch(selectedImage);
      const imageBlob = await imageResponse.blob();
      formData.append('image', imageBlob);
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

      const generationId = data.generationId;

      // Start polling for status
      const interval = setInterval(async () => {
        try {
            const response = await fetch(`/api/video/status/${generationId}`);
            const statusData = await response.json();

            if (statusData.status === 'completed' && statusData.videoUrl) {
              setGeneratedVideo(statusData.videoUrl);
              setIsGenerating(false);
              toast.success('Video generated successfully!');
              clearInterval(interval);
            } else if (statusData.status === 'failed') {
              setIsGenerating(false);
              toast.error('Video generation failed');
              clearInterval(interval);
            }
        } catch(e) {
            setIsGenerating(false);
            toast.error('Video generation failed');
            clearInterval(interval);
        }
      }, 5000);

      toast.success('Video generation started!');

    } catch (error) {
      console.error('Generation error:', error);
      setIsGenerating(false);
      toast.error(error instanceof Error ? error.message : 'Failed to generate video');
    }
  };



  return (
    <DashboardLayout useContainer={false}>
      <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
        {/* Center - Main Video Display */}
        <div className="flex-1 p-6">
          <MainVideoDisplay
            selectedImage={selectedImage}
            generatedVideo={generatedVideo}
            isGenerating={isGenerating}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
            onRemoveGeneratedVideo={handleRemoveGeneratedVideo}
          />
        </div>
        
        {/* Right Sidebar - Controls */}
        <VideoControlSidebar
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          selectedEffect={selectedEffect}
          onEffectSelect={handleEffectSelect}
        />
      </div>
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          },
        }}
      />
    </DashboardLayout>
  );
}