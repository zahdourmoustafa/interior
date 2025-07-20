'use client';

import { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';

interface EnhancedImageUploadProps {
  onImageUpload: (url: string) => void;
  maxSize?: number;
  acceptedTypes?: string[];
}

export function EnhancedImageUpload({ 
  onImageUpload, 
  maxSize = 5 * 1024 * 1024,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: EnhancedImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = useCallback((file: File) => {
    if (file.size > maxSize) {
      return `File is too large. Maximum size is ${maxSize / 1024 / 1024}MB`;
    }
    
    if (!acceptedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload JPEG, PNG, or WebP images.';
    }
    
    return null;
  }, [maxSize, acceptedTypes]);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    setError(null);
    setUploadProgress(0);
    
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        setError(`File is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
      } else if (error.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload JPEG, PNG, or WebP images.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const validationError = validateFile(file);
      
      if (validationError) {
        setError(validationError);
        return;
      }

      // Create preview
      const url = URL.createObjectURL(file);
      setPreview(url);
      setIsUploading(true);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setIsUploading(false);
            onImageUpload(url);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  }, [maxSize, validateFile, onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  if (preview) {
    return (
      <Card className="relative">
        <CardContent className="p-4">
          <div className="relative aspect-video">
            <Image
              src={preview}
              alt="Uploaded room"
              fill
              className="object-cover rounded-md"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {isUploading && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}
          ${error ? 'border-destructive bg-destructive/5' : ''}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {isDragActive ? 'Drop your image here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, WebP up to 5MB
          </p>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}