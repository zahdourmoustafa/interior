"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SingleImageDisplay } from "@/components/redecorate/single-image-display";
import { ControlSidebar } from "@/components/redecorate/control-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { trpc } from "@/lib/trpc";

export default function FurnishEmptySpacePage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loadingToastId, setLoadingToastId] = useState<string | null>(null);

  const generateMutation = trpc.images.furnishEmptySpace.useMutation({
    onSuccess: (data) => {
      if (data.generatedImageUrl) {
        setCurrentImage(data.generatedImageUrl);
        if (loadingToastId) {
          toast.dismiss(loadingToastId);
        }
        toast.success("🎨 Your design has been updated successfully!");
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

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    const uploadToast = toast.loading("Uploading image...");
    
    // Show a preview immediately
    const previewUrl = URL.createObjectURL(file);
    setOriginalImage(previewUrl);
    setCurrentImage(previewUrl);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      
      // Set the permanent URL once upload is complete
      setOriginalImage(result.imageUrl);
      setCurrentImage(result.imageUrl);
      toast.success("Image uploaded successfully!", { id: uploadToast });
    } catch (error) {
      console.error("❌ Upload failed:", error);
      toast.error("Failed to upload image. Please try again.", { id: uploadToast });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearAll = () => {
    setOriginalImage(null);
    setCurrentImage(null);
    toast.success("Image cleared. You can upload a new image.");
  };

  const handleResetToOriginal = () => {
    if (originalImage) {
      setCurrentImage(originalImage);
      toast.success("Image has been reset to the original.");
    }
  };

  const handleGenerate = async () => {
    if (!currentImage || currentImage.startsWith("blob:")) {
      toast.error("Please wait for the image to finish uploading before generating.");
      return;
    }
    if (!prompt.trim()) {
      toast.error("Please enter a description for your design.");
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading("🎨 Furnishing your space... This may take 30-60 seconds");
    setLoadingToastId(loadingToast as string);

    try {
      await generateMutation.mutateAsync({
        prompt: prompt.trim(),
        imageUrl: currentImage, 
      });
    } catch (error) {
      console.error("Generation error:", error);
    }
  };

  return (
    <DashboardLayout useContainer={false}>
      <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
        <div className="flex-1 p-6">
          <SingleImageDisplay
            image={currentImage}
            isGenerating={isGenerating || isUploading}
            onImageUpload={handleImageUpload}
            onImageRemove={handleClearAll}
            title="Upload an Empty Room"
            description="Drag & drop or click to upload a photo of your empty space"
          />
        </div>
        <ControlSidebar
          title="Furnish Empty Space"
          description="Describe the furniture and style you want to add to your empty room."
          isGenerating={isGenerating || isUploading}
          onGenerate={handleGenerate}
          showRoomType={false}
          showDesignStyle={false}
          prompt={prompt}
          onPromptChange={setPrompt}
          promptPlaceholder="e.g., a modern leather sofa, a glass coffee table..."
          onReset={handleResetToOriginal}
          isResettable={!!originalImage && currentImage !== originalImage}
        />
      </div>
      <Toaster />
    </DashboardLayout>
  );
}