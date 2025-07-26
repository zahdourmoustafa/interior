'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { MainImageDisplay } from '@/components/redecorate/main-image-display';
import { ControlSidebar } from '@/components/redecorate/control-sidebar';
import { trpc } from '@/lib/trpc';
import toast, { Toaster } from 'react-hot-toast';
import { useCreditCheck } from '@/hooks/use-credit-check';

export default function GenerateVideosPage() {
  // State management
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedVideos, setGeneratedVideos] = useState<string[]>([]);
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingSlot, setGeneratingSlot] = useState<number | null>(null);

  // Credit system integration
  const { checkAndConsumeCredit, UpgradeModalComponent } = useCreditCheck({
    feature: 'video',
    onSuccess: () => {
      console.log('✅ Credit consumed successfully for generate video');
    },
    onError: (error) => {
      console.error('❌ Credit error:', error);
      setIsGenerating(false);
      setGeneratingSlot(null);
    }
  });

  // Handlers
  const handleImageUpload = async (file: File) => {
    const uploadToast = toast.loading('Uploading image...');
    
    try {
      // Create object URL for immediate preview
      const previewUrl = URL.createObjectURL(file);
      setSelectedImage(previewUrl);
      setGeneratedVideos([]); // Clear previous generations

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
    setGeneratedVideos([]);
    toast.success('Image removed. You can upload a new image.');
  };

  const handleRemoveGeneratedVideo = (index: number) => {
    setGeneratedVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleEffectSelect = (effect: string) => {
    setSelectedEffect(effect);
  };

  // tRPC mutation for video generation
  const generateMutation = trpc.videos.generateVideo.useMutation({
    onSuccess: (data) => {
      if (data.status === 'completed' && data.generatedVideoUrl) {
        setGeneratedVideos(prev => {
          const newVideos = [...prev];
          if (generatingSlot !== null) {
            newVideos[generatingSlot] = data.generatedVideoUrl!;
          }
          return newVideos;
        });
        toast.success('🎬 Your video has been generated successfully!');
        console.log('✅ Video generation completed successfully');
      } else if (data.error) {
        toast.error(`Generation failed: ${data.error}`);
        throw new Error(data.error);
      }
    },
    onError: (error) => {
      console.error('❌ Video generation failed:', error);
      toast.error(`Generation failed: ${error.message}`);
    },
    onSettled: () => {
      setIsGenerating(false);
      setGeneratingSlot(null);
    }
  });

  const handleGenerate = async () => {
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
    
    if (!selectedEffect) {
      toast.error('Please select a video effect');
      return;
    }

    const nextSlot = generatedVideos.length;
    if (nextSlot >= 4) {
      toast.error("All video slots are full. Please remove one to generate a new video.");
      return;
    }

    // Set loading state
    setIsGenerating(true);
    setGeneratingSlot(nextSlot);
    
    // Generate unique ID for this generation
    const generationId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check and consume credit before proceeding
    const hasCredits = await checkAndConsumeCredit(generationId, {
      imageUrl: selectedImage,
      videoEffect: selectedEffect,
      slot: nextSlot,
    });

    if (!hasCredits) {
      // Credit check failed, loading state already cleared by onError callback
      return;
    }

    // Credit consumed successfully, proceed with generation
    toast.loading(`🎬 Generating video in slot ${nextSlot + 1}... This may take 60-120 seconds`);
    
    console.log('🎬 Starting video generation with:', {
      generationId,
      imageUrl: selectedImage.substring(0, 50) + '...',
      videoEffect: selectedEffect
    });

    // Call tRPC mutation for video generation
    generateMutation.mutate({
      originalImageUrl: selectedImage,
      effect: selectedEffect as 'rotate180' | 'zoomIn' | 'zoomOut',
    });
  };

  return (
    <DashboardLayout useContainer={false}>
      <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
        {/* Center - Main Image Display */}
        <div className="flex-1 p-6">
          <MainImageDisplay
            selectedImage={selectedImage}
            generatedImages={generatedVideos}
            isGenerating={isGenerating}
            generatingSlot={generatingSlot}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
            onRemoveGeneratedImage={handleRemoveGeneratedVideo}
          />
        </div>
        
        {/* Right Sidebar - Controls */}
        <ControlSidebar
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          title="Video Effects"
          description="Select an effect for your video generation"
          showRoomType={false}
          showDesignStyle={false}
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
