"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ImageEditor } from "@/components/redecorate/image-editor";
import { ControlSidebar } from "@/components/redecorate/control-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { trpc } from "@/lib/trpc";
import { ImageUpload } from "@/components/redecorate/image-upload";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Loader2 } from "lucide-react";

import { BrushControls } from "@/components/redecorate/brush-controls";

export default function RemoveObjectPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [mask, setMask] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingToastId, setLoadingToastId] = useState<string | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [brushOpacity, setBrushOpacity] = useState(0.5);

  const [isDrawingMode, setIsDrawingMode] = useState(true);

  const generateMutation = trpc.images.removeObject.useMutation({
    onSuccess: (data) => {
      if (data.generatedImageUrl) {
        setCurrentImage(data.generatedImageUrl);
        if (loadingToastId) {
          toast.dismiss(loadingToastId);
        }
        toast.success("🎨 Object successfully removed from the image!");
      }
    },
    onError: (error) => {
      console.error("❌ Generation failed:", error);
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      toast.error("Failed to remove object. Please try again.");
    },
    onSettled: () => {
      setIsGenerating(false);
      setLoadingToastId(null);
      setHasDrawn(false);
      setMask(null);
    },
  });

  const handleImageUpload = (url: string) => {
    if (url) {
      // Check if it's a blob URL (temporary) or a permanent URL
      if (url.startsWith("blob:")) {
        setIsUploading(true);
        // Just set the original image for preview, but don't enable generation yet
        setOriginalImage(url);
        setCurrentImage(url);
      } else {
        // It's a permanent URL, ready for generation
        setOriginalImage(url);
        setCurrentImage(url);
        setIsUploading(false);
        toast.success(
          "Image uploaded successfully. Now use the brush to select objects to remove."
        );
      }
    } else {
      setOriginalImage(null);
      setCurrentImage(null);
      setMask(null);
      setHasDrawn(false);
      setIsUploading(false);
    }
  };

  const handleClearAll = () => {
    setOriginalImage(null);
    setCurrentImage(null);
    setMask(null);
    setHasDrawn(false);
    toast.success("Image cleared. You can upload a new image.");
  };

  const handleResetToOriginal = () => {
    if (originalImage) {
      setCurrentImage(originalImage);
      setMask(null);
      setHasDrawn(false);
      toast.success("Image has been reset to the original.");
    }
  };

  const handleMaskChange = (maskData: string) => {
    setMask(maskData);
    if (maskData && !hasDrawn) {
      setHasDrawn(true);
    }
  };

  const [prompt, setPrompt] = useState("");

  const handleGenerate = async () => {
    if (!currentImage) {
      toast.error("Please upload an image first.");
      return;
    }

    if (isUploading || currentImage.startsWith("blob:")) {
      toast.error("Please wait for the image to finish uploading.");
      return;
    }

    if (!mask && !prompt) {
      toast.error(
        "Please brush over the object you want to remove, or enter a prompt."
      );
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading(
      "Removing object with Gemini Flash 2.0... This may take 30-60 seconds"
    );
    setLoadingToastId(loadingToast as string);

    try {
      await generateMutation.mutateAsync({
        imageUrl: currentImage,
        mask: mask || undefined,
        prompt: prompt,
      });
    } catch (error) {
      console.error("Generation error:", error);
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      toast.error("Failed to remove object. Please try again.");
      setIsGenerating(false);
    }
  };

  const handleUploadBegin = () => {
    setIsUploading(true);
    const id = toast.loading("Uploading image... Please wait");
    setLoadingToastId(id as string);
  };

  const handleUploadComplete = (url: string) => {
    if (loadingToastId) {
      toast.dismiss(loadingToastId);
    }
    setOriginalImage(url);
    setCurrentImage(url);
    setIsUploading(false);
    toast.success(
      "Image uploaded successfully. Now use the brush to select objects to remove."
    );
  };

  const clearMask = () => {
    // This function will be passed to the ImageEditor, which will handle the actual clearing.
    // We just need to reset the mask state here.
    setMask(null);
    setHasDrawn(false);
  };

  return (
    <DashboardLayout useContainer={false}>
      <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
        <div className="flex-1 p-6 flex flex-col">
          {!currentImage && (
            <div className="mb-6">
              <Alert className="bg-blue-50 border-blue-200">
                <InfoIcon className="h-4 w-4 text-blue-500" />
                <AlertTitle>Object Removal Tool</AlertTitle>
                <AlertDescription>
                  Upload an image, then use the brush to select objects you
                  want to remove. Our AI will intelligently remove the selected
                  objects and fill in the background.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {currentImage ? (
            <div className="flex-1 flex items-center justify-center">
              <ImageEditor
                image={currentImage}
                onMaskChange={handleMaskChange}
                brushSize={brushSize}
                brushOpacity={brushOpacity}
                clearMask={clearMask}
                isDrawingMode={isDrawingMode}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <ImageUpload
                onImageSelect={handleImageUpload}
                onUploadBegin={handleUploadBegin}
                onUploadComplete={handleUploadComplete}
              />
            </div>
          )}
        </div>
        <ControlSidebar
          title="Remove Object"
          description="Use the brush to select objects you want to remove from the image. Adjust the brush size and opacity as needed."
          isGenerating={isGenerating || isUploading}
          onGenerate={handleGenerate}
          showRoomType={false}
          showDesignStyle={false}
          prompt={prompt}
          onPromptChange={setPrompt}
          promptPlaceholder="e.g., remove the person in the background"
          onReset={handleResetToOriginal}
          isResettable={!!originalImage && currentImage !== originalImage}
          generateButtonText="Remove Object"
          generateButtonDisabled={
            (!hasDrawn && !prompt) ||
            isUploading ||
            currentImage?.startsWith("blob:")
          }
          isDrawingMode={isDrawingMode}
          onDrawingModeChange={setIsDrawingMode}
        >
          <BrushControls
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            brushOpacity={brushOpacity}
            setBrushOpacity={setBrushOpacity}
            clearMask={clearMask}
          />
        </ControlSidebar>
      </div>
      <Toaster />
    </DashboardLayout>
  );
}
