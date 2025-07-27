'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { SingleVideoDisplay } from '@/components/video/single-video-display';
import { VideoEffectsControlSidebar } from '@/components/video/video-effects-control-sidebar';
import { trpc } from '@/lib/trpc';
import toast, { Toaster } from 'react-hot-toast';
import { useCreditCheck } from '@/hooks/use-credit-check';

export default function GenerateVideosPage() {
  // State management
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Credit system integration
  const { checkAndConsumeCredit, UpgradeModalComponent } = useCreditCheck({
    feature: 'video',
    onSuccess: () => {
      console.log('✅ Credit consumed successfully for generate video');
    },
    onError: (error) => {
      console.error('❌ Credit error:', error);
      setIsGenerating(false);
    }
  });

  // Handlers
  const handleImageUpload = async (file: File) => {
    const uploadToast = toast.loading('Uploading image...');
    
    try {
      // Create object URL for immediate preview
      const previewUrl = URL.createObjectURL(file);
      setSelectedImage(previewUrl);
      setGeneratedVideo(null); // Clear previous video

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
    setSelectedEffect(null);
    toast.success('Image removed. You can upload a new image.');
  };

  const handleEffectSelect = (effect: string) => {
    setSelectedEffect(effect);
  };

  // tRPC mutation for video generation
  const generateMutation = trpc.images.generateVideo.useMutation({
    onSuccess: (data) => {
      if (data.status === 'completed' && data.videoUrl) {
        setGeneratedVideo(data.videoUrl);
        toast.success('🎬 Your video has been generated successfully!');
        console.log('✅ Video generation completed successfully');
      } else if (data.status === 'processing') {
        toast.success('🎬 Video generation started! Processing...');
        console.log('🎬 Video generation in progress');
      } else {
        toast.error('Video generation failed');
        console.error('❌ Video generation failed');
      }
    },
    onError: (error) => {
      console.error('❌ Video generation failed:', error);
      toast.error(`Generation failed: ${error.message}`);
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });

  const handleGenerate = async (effect: string) => {
    // Validation with user-friendly messages
    if (!selectedImage) {
      toast.error('Please upload an image first');
      return;
    }
    
    // Check if image is still uploading (blob URL means upload not complete)
    if (selectedImage.startsWith('blob:')) {
      toast.error('Please wait for the image upload to complete before generating');
      return;
    }
    
    if (!effect) {
      toast.error('Please select a video effect');
      return;
    }

    // Set loading state
    setIsGenerating(true);
    
    // Generate unique ID for this generation
    const generationId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check and consume credit before proceeding
    const hasCredits = await checkAndConsumeCredit(generationId, {
      imageUrl: selectedImage,
      videoEffect: effect,
    });

    if (!hasCredits) {
      // Credit check failed, loading state already cleared by onError callback
      return;
    }

    // Credit consumed successfully, proceed with generation
    toast.loading(`🎬 Generating ${effect} video... This may take 60-120 seconds`);
    
    console.log('🎬 Starting video generation with:', {
      generationId,
      imageUrl: selectedImage.substring(0, 50) + '...',
      videoEffect: effect
    });

    // Call tRPC mutation for video generation
    generateMutation.mutate({
      imageUrl: selectedImage,
      effect: effect as 'zoomIn' | 'zoomOut' | 'flythrough' | 'rotateLeft' | 'rotateRight' | 'panLeft' | 'panRight' | 'tiltUp' | 'tiltDown',
    });
  };

  return (
    <DashboardLayout useContainer={false}>
      <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
        {/* Center - Single Video Display */}
        <div className="flex-1 p-6">
          <SingleVideoDisplay
            selectedImage={selectedImage}
            generatedVideo={generatedVideo}
            isGenerating={isGenerating}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
          />
        </div>
        
        {/* Right Sidebar - Video Effects Controls */}
        <VideoEffectsControlSidebar
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          selectedEffect={selectedEffect}
          onEffectSelect={handleEffectSelect}
        />
      </div>
      
      {/* Credit System Modal */}
      <UpgradeModalComponent />
      
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
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </DashboardLayout>
  );
}
