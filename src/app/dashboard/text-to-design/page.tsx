"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MainImageDisplay } from "@/components/redecorate/main-image-display";
import { ControlSidebar } from "@/components/redecorate/control-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { trpc } from "@/lib/trpc";

export default function TextToDesignPage() {
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loadingToastId, setLoadingToastId] = useState<string | null>(null);

  const generateMutation = trpc.images.generateTextToDesign.useMutation({
    onSuccess: (data) => {
      if (data.generatedImageUrl) {
        setGeneratedImages([data.generatedImageUrl]);
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
      setLoadingToastId(null);
    },
  });

  const handleImageRemove = () => {
    setGeneratedImages([]);
    toast.success("Image removed. You can generate a new design.");
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description for your design.");
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading("🎨 Generating your design... This may take 30-60 seconds");
    setLoadingToastId(loadingToast as string);

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
            generatingSlot={null}
            onImageUpload={() => {}} // No-op function since we don't upload
            onImageRemove={handleImageRemove}
            onRemoveGeneratedImage={() => setGeneratedImages([])}
            showUploadArea={false}
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
      <Toaster />
    </DashboardLayout>
  );
} 