'use client';

import { useState, useCallback, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ImageEditor, ImageEditorRef } from '@/components/redecorate/image-editor';
import { RemoveObjectControlSidebar } from '@/components/redecorate/remove-object-control-sidebar';
import { trpc } from '@/lib/trpc';
import toast, { Toaster } from 'react-hot-toast';
import { useCreditCheck } from '@/hooks/use-credit-check';

export default function RemoveObjectPage() {
  // State management
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Brush tool state
  const [brushSize, setBrushSize] = useState(20);
  const [brushOpacity, setBrushOpacity] = useState(0.7);
  const [mask, setMask] = useState('');
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  
  // Ref for ImageEditor
  const imageEditorRef = useRef<ImageEditorRef>(null);

  // Credit system integration
  const { checkAndConsumeCredit, UpgradeModalComponent } = useCreditCheck({
    feature: 'remove',
    onSuccess: () => {
      console.log('✅ Credit consumed successfully for remove object');
    },
    onError: (error) => {
      console.error('❌ Credit error:', error);
      setIsGenerating(false);
    }
  });

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    const uploadToast = toast.loading('Uploading image...');
    
    try {
      // Create object URL for immediate preview
      const previewUrl = URL.createObjectURL(file);
      setSelectedImage(previewUrl);
      setProcessedImage(null); // Clear processed image
      setMask(''); // Clear mask

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


  const clearMask = useCallback(() => {
    setMask('');
    imageEditorRef.current?.clearMask();
  }, []);

  // tRPC mutation for object removal
  const removeObjectMutation = trpc.images.removeObject.useMutation({
    onSuccess: (data) => {
      if (data.status === 'completed' && data.generatedImageUrl) {
        setProcessedImage(data.generatedImageUrl);
        toast.success('🗑️ Object has been removed successfully!');
        console.log('✅ Remove object generation completed successfully');
      } else if (data.status === 'failed') {
        toast.error('Generation failed');
        throw new Error('Generation failed');
      }
    },
    onError: (error) => {
      console.error('❌ Remove object generation failed:', error);
      toast.error(`Generation failed: ${error.message}`);
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });

  const handleGenerate = async (prompt: string, maskData?: string) => {
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
    
    if (!prompt.trim()) {
      toast.error('Please provide a description of what to remove');
      return;
    }

    // Set loading state
    setIsGenerating(true);
    
    // Generate unique ID for this generation
    const generationId = `remove_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check and consume credit before proceeding
    const hasCredits = await checkAndConsumeCredit(generationId, {
      imageUrl: selectedImage,
      prompt: prompt,
      mask: maskData,
    });

    if (!hasCredits) {
      // Credit check failed, loading state already cleared by onError callback
      return;
    }

    // Credit consumed successfully, proceed with generation
    toast.loading(`🗑️ Removing object... This may take 30-60 seconds`);
    
    console.log('🗑️ Starting remove object generation with:', {
      generationId,
      imageUrl: selectedImage.substring(0, 50) + '...',
      prompt: prompt,
      hasMask: !!maskData
    });

    // Call tRPC mutation for object removal
    removeObjectMutation.mutate({
      imageUrl: selectedImage,
      prompt: prompt,
      mask: maskData,
    });
  };

  return (
    <DashboardLayout useContainer={false}>
      <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
        {/* Center - Image Editor and Results */}
        <div className="flex-1 p-6">
          {selectedImage ? (
            <div className="relative h-full">
              {/* Image Display */}
              <div className="relative h-full flex items-center justify-center">
                <ImageEditor
                  ref={imageEditorRef}
                  image={showOriginal ? selectedImage : (processedImage || selectedImage)}
                  onMaskChange={setMask}
                  brushSize={brushSize}
                  brushOpacity={brushOpacity}
                  isDrawingMode={isDrawingMode && !processedImage}
                />
                
                {/* Loading Overlay */}
                {isGenerating && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                    <div className="bg-white rounded-lg p-6 flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mb-4"></div>
                      <span className="text-gray-700 font-medium">Removing object...</span>
                      <span className="text-gray-500 text-sm mt-1">This may take 30-60 seconds</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Comparison Controls */}
              {processedImage && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-white rounded-lg shadow-lg p-2">
                  <button
                    onClick={() => setShowOriginal(!showOriginal)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      showOriginal 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {showOriginal ? 'Original' : 'Result'}
                  </button>
                  
                  <button
                    onClick={() => window.open(processedImage, '_blank')}
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                </div>
              )}

              {/* Status Indicator */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2">
                  {processedImage ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">Object Removed Successfully</span>
                    </>
                  ) : mask ? (
                    <>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">Object Selected - Ready to Remove</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">Select object to remove</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload an image to start removing objects
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Sidebar - Remove Object Controls */}
        <RemoveObjectControlSidebar
          onGenerate={handleGenerate}
          isGenerating={isGenerating || isUploading}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          brushOpacity={brushOpacity}
          setBrushOpacity={setBrushOpacity}
          clearMask={clearMask}
          mask={mask}
          isDrawingMode={isDrawingMode}
          setIsDrawingMode={setIsDrawingMode}
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
