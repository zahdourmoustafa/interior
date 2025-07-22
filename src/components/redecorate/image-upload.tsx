'use client';

import { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, X, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  onUploadBegin?: () => void;
  onUploadComplete?: (url: string) => void;
  maxSize?: number;
  acceptedTypes?: string[];
}

export function ImageUpload({
  onImageSelect,
  onUploadBegin,
  onUploadComplete,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const uploadMutation = trpc.images.uploadImage.useMutation({
    onSuccess: (data) => {
      if (data.imageUrl) {
        setPreview(data.imageUrl);
        onImageSelect(data.imageUrl);
        setIsUploading(false);
        if (onUploadComplete) {
          onUploadComplete(data.imageUrl);
        }
      }
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      toast.error("Failed to upload image. Please try again.");
      setIsUploading(false);
      setPreview(null);
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setDragActive(false);
      setError(null);

      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        if (error.code === "file-too-large") {
          setError(`File is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        } else if (error.code === "file-invalid-type") {
          setError("Invalid file type. Please upload JPEG, PNG, or WebP images.");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const tempPreview = URL.createObjectURL(file);
        setPreview(tempPreview);
        setIsUploading(true);
        if (onUploadBegin) onUploadBegin();

        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && typeof e.target.result === 'string') {
            uploadMutation.mutate({
              file: e.target.result,
              filename: file.name,
            });
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [maxSize, onImageSelect, uploadMutation, onUploadBegin, onUploadComplete]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    maxFiles: 1,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  if (preview) {
    return (
      <Card className="relative w-full h-full">
        <Image
          src={preview}
          alt="Uploaded preview"
          fill
          className="object-contain rounded-md"
        />
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
            <div className="text-white text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Uploading...</p>
            </div>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div
        {...getRootProps()}
        className={cn(
          'relative w-full h-full border-2 transition-colors duration-200 flex items-center justify-center group',
          dragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300',
          'border-dashed',
          'cursor-pointer hover:border-gray-400'
        )}
      >
        <input {...getInputProps()} />
        <div className="text-center p-4">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-medium text-gray-800">Upload an Image</h3>
          <p className="text-sm text-gray-500">Drag & drop or click to upload</p>
        </div>
      </div>
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
}
