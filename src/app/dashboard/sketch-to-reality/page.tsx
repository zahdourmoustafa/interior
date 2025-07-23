'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DesignStyleSidebar } from '@/components/redecorate/design-style-sidebar';
import { MainImageDisplay } from '@/components/redecorate/main-image-display';
import { ControlSidebar } from '@/components/redecorate/control-sidebar';
import { trpc } from '@/lib/trpc';
import toast, { Toaster } from 'react-hot-toast';

export default function SketchToRealityPage() {
  // State management
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingSlot, setGeneratingSlot] = useState<number | null>(null);

  // Handlers
  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  const handleImageUpload = async (file: File) => {
    const uploadToast = toast.loading('Uploading sketch...');
    
    try {
      // Create object URL for immediate preview
      const previewUrl = URL.createObjectURL(file);
      setSelectedImage(previewUrl);

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
      toast.success('Sketch uploaded successfully!', { id: uploadToast });
      console.log('✅ Sketch uploaded successfully:', result.imageUrl);

    } catch (error) {
      console.error('❌ Upload failed:', error);
      toast.error('Failed to upload sketch. Please try again.', { id: uploadToast });
      // Keep the preview URL if upload fails
    }
  };

  

  const handleImageRemove = () => {
    setSelectedImage(null);
    setGeneratedImages([]);
    toast.success('Sketch removed. You can upload a new sketch.');
  };

  const handleRemoveGeneratedImage = (index: number) => {
    setGeneratedImages(prev => prev.filter((_, i) => i !== index));
  };

  // tRPC mutation for image generation
  const generateMutation = trpc.images.generateSketchToReality.useMutation({
    onSuccess: (data) => {
      if (data.status === 'completed' && data.generatedImageUrl) {
        setGeneratedImages(prev => {
          const newImages = [...prev];
          if (generatingSlot !== null) {
            newImages[generatingSlot] = data.generatedImageUrl!;
          }
          return newImages;
        });
        toast.success('🏠 Your realistic design has been generated successfully!');
        console.log('✅ Sketch-to-reality generation completed successfully');
      } else if (data.error) {
        toast.error(`Generation failed: ${data.error}`);
        throw new Error(data.error);
      }
    },
    onError: (error) => {
      console.error('❌ Generation failed:', error);
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
      toast.error('Please upload a sketch first');
      return;
    }
    
    if (!selectedRoomType) {
      toast.error('Please select a room type');
      return;
    }
    
    if (!selectedStyle) {
      toast.error('Please select a design style');
      return;
    }

    const nextSlot = generatedImages.length;
    if (nextSlot >= 4) {
      toast.error("All image slots are full. Please remove one to generate a new design.");
      return;
    }

    setIsGenerating(true);
    setGeneratingSlot(nextSlot);
    toast.loading(`🏠 Converting your sketch to reality in slot ${nextSlot + 1}... This may take 30-60 seconds`);
    
    console.log('🏠 Starting sketch-to-reality generation with:', {
      roomType: selectedRoomType,
      designStyle: selectedStyle,
      imageUrl: selectedImage.substring(0, 50) + '...'
    });

    // Call tRPC mutation for image generation
    generateMutation.mutate({
      originalImageUrl: selectedImage,
      roomType: selectedRoomType as "living-room" | "kitchen" | "bedroom" | "kids-room" | "dining-room" | "home-office" | "game-room" | "bath-room",
      designStyle: selectedStyle,
    });
  };

  return (
    <DashboardLayout useContainer={false}>
      <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
        {/* Left Sidebar - Design Styles */}
        <DesignStyleSidebar
          selectedStyle={selectedStyle}
          onStyleSelect={handleStyleSelect}
        />
        
        {/* Center - Main Image Display */}
        <div className="flex-1 p-6">
          <MainImageDisplay
            selectedImage={selectedImage}
            generatedImages={generatedImages}
            isGenerating={isGenerating}
            generatingSlot={generatingSlot}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
            onRemoveGeneratedImage={handleRemoveGeneratedImage}
          />
        </div>
        
        {/* Right Sidebar - Controls */}
        <ControlSidebar
          selectedRoomType={selectedRoomType}
          onRoomTypeSelect={setSelectedRoomType}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          title="Room Type"
          description="Select the room type for your sketch"
          showRoomType={true}
          showDesignStyle={false}
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