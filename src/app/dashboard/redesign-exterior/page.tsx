'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DesignStyleSidebar } from '@/components/redecorate/design-style-sidebar';
import { MainImageDisplay } from '@/components/redecorate/main-image-display';
import { ControlSidebar } from '@/components/redecorate/control-sidebar';
import { trpc } from '@/lib/trpc';
import toast, { Toaster } from 'react-hot-toast';
import { useCreditCheck } from '@/hooks/use-credit-check';

export default function RedesignExteriorPage() {
  // State management
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingSlot, setGeneratingSlot] = useState<number | null>(null);

  // Credit system integration
  const { checkAndConsumeCredit, UpgradeModalComponent } = useCreditCheck({
    feature: 'exterior',
    onSuccess: () => {
      console.log('✅ Credit consumed successfully for exterior design');
    },
    onError: (error) => {
      console.error('❌ Credit error:', error);
      setIsGenerating(false);
      setGeneratingSlot(null);
    }
  });

  // Handlers
  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    const uploadToast = toast.loading('Uploading image...');
    
    try {
      // Create object URL for immediate preview
      const previewUrl = URL.createObjectURL(file);
      setSelectedImage(previewUrl);
      setGeneratedImages([]); // Clear previous generations

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
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setGeneratedImages([]);
    toast.success('Image removed. You can upload a new image.');
  };

  const handleRemoveGeneratedImage = (index: number) => {
    setGeneratedImages(prev => prev.filter((_, i) => i !== index));
  };

  // tRPC mutation for image generation
  const generateMutation = trpc.images.generateExterior.useMutation({
    onSuccess: (data) => {
      if (data.status === 'completed' && data.generatedImageUrl) {
        setGeneratedImages(prev => {
          const newImages = [...prev];
          if (generatingSlot !== null) {
            newImages[generatingSlot] = data.generatedImageUrl!;
          }
          return newImages;
        });
        toast.success('🏠 Your exterior design has been generated successfully!');
        console.log('✅ Exterior generation completed successfully');
      } else if (data.error) {
        toast.error(`Generation failed: ${data.error}`);
        throw new Error(data.error);
      }
    },
    onError: (error) => {
      console.error('❌ Exterior generation failed:', error);
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
    
    if (!selectedStyle) {
      toast.error('Please select a design style');
      return;
    }

    const nextSlot = generatedImages.length;
    if (nextSlot >= 4) {
      toast.error("All image slots are full. Please remove one to generate a new design.");
      return;
    }

    // Set loading state
    setIsGenerating(true);
    setGeneratingSlot(nextSlot);
    
    // Generate unique ID for this generation
    const generationId = `exterior_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check and consume credit before proceeding
    const hasCredits = await checkAndConsumeCredit(generationId, {
      designStyle: selectedStyle,
      imageUrl: selectedImage,
      slot: nextSlot,
    });

    if (!hasCredits) {
      // Credit check failed, loading state already cleared by onError callback
      return;
    }

    // Credit consumed successfully, proceed with generation
    toast.loading(`🏠 Generating exterior design in slot ${nextSlot + 1}... This may take 30-60 seconds`);
    
    console.log('🏠 Starting exterior generation with:', {
      generationId,
      designStyle: selectedStyle,
      imageUrl: selectedImage.substring(0, 50) + '...'
    });

    // Call tRPC mutation for image generation
    generateMutation.mutate({
      originalImageUrl: selectedImage,
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
          onGenerate={handleGenerate}
          isGenerating={isGenerating || isUploading}
          title="Design Style"
          description="Select a design style for your exterior"
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
