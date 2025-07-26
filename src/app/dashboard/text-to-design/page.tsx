"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MainImageDisplay } from "@/components/redecorate/main-image-display";
import { ControlSidebar } from "@/components/redecorate/control-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { trpc } from "@/lib/trpc";
import { useCreditCheck } from '@/hooks/use-credit-check';

export default function TextToDesignPage() {
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingSlot, setGeneratingSlot] = useState<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loadingToastId, setLoadingToastId] = useState<string | null>(null);

  // Credit system integration
  const { checkAndConsumeCredit, UpgradeModalComponent } = useCreditCheck({
    feature: 'text',
    onSuccess: () => {
      console.log('✅ Credit consumed successfully for text to design');
    },
    onError: (error) => {
      console.error('❌ Credit error:', error);
      setIsGenerating(false);
      setGeneratingSlot(null); // Clear the generating slot
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
        setLoadingToastId(null);
      }
    }
  });

  const generateMutation = trpc.images.generateTextToDesign.useMutation({
    onSuccess: (data) => {
      if (data.generatedImageUrl) {
        // Add the new image to the specific generating slot
        setGeneratedImages(prev => {
          const newImages = [...prev];
          if (generatingSlot !== null) {
            newImages[generatingSlot] = data.generatedImageUrl;
          } else {
            // Fallback: append to end if no specific slot
            newImages.push(data.generatedImageUrl);
          }
          return newImages;
        });
        
        if (loadingToastId) {
          toast.dismiss(loadingToastId);
        }
        toast.success("🎨 Your design has been generated successfully!");
      }
    },
    onError: (error) => {
      console.error("❌ Generation failed:", error);
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      toast.error("Failed to generate design. Please try again.");
    },
    onSettled: () => {
      setIsGenerating(false);
      setGeneratingSlot(null); // Clear the generating slot
      setLoadingToastId(null);
    },
  });

  const handleImageRemove = () => {
    setGeneratedImages([]);
    toast.success("All images removed. You can generate new designs.");
  };

  const handleRemoveSpecificImage = (index: number) => {
    setGeneratedImages(prev => prev.filter((_, i) => i !== index));
    toast.success("Image removed.");
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description for your design.");
      return;
    }

    // Determine which slot to use for the new generation
    const nextSlot = generatedImages.length < 4 ? generatedImages.length : 0; // Use next available slot or cycle back to 0
    
    // Set loading state
    setIsGenerating(true);
    setGeneratingSlot(nextSlot);
    const loadingToast = toast.loading("🎨 Generating your design... This may take 30-60 seconds");
    setLoadingToastId(loadingToast as string);

    // Generate unique ID for this generation
    const generationId = `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check and consume credit before proceeding
    const hasCredits = await checkAndConsumeCredit(generationId, {
      prompt: prompt.trim(),
      feature: 'text-to-design',
    });

    if (!hasCredits) {
      // Credit check failed, loading state already cleared by onError callback
      return;
    }

    // Credit consumed successfully, proceed with generation
    console.log('🎨 Starting text to design generation with:', {
      generationId,
      prompt: prompt.trim().substring(0, 100) + '...',
      slot: nextSlot
    });

    try {
      await generateMutation.mutateAsync({
        prompt: prompt.trim(),
      });
    } catch (error) {
      console.error("Generation error:", error);
      // Error is handled in onError callback
    }
  };

  return (
    <DashboardLayout useContainer={false}>
      <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
        <div className="flex-1 p-6">
          <MainImageDisplay
            selectedImage={null}
            generatedImages={generatedImages}
            isGenerating={isGenerating}
            generatingSlot={generatingSlot}
            onImageUpload={() => {}} // No-op function since we don't upload
            onImageRemove={handleImageRemove}
            onRemoveGeneratedImage={handleRemoveSpecificImage}
            showUploadArea={false}
            feature="text"
            currentPrompt={prompt}
          />
        </div>
        <ControlSidebar
          title="Text to Design"
          description="Describe the design you want to generate"
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
          showRoomType={false}
          showDesignStyle={false}
          prompt={prompt}
          onPromptChange={setPrompt}
          promptPlaceholder="Describe an image you want to generate"
        />
      </div>
      
      {/* Credit System Modal */}
      <UpgradeModalComponent />
      
      <Toaster />
    </DashboardLayout>
  );
}
