'use client';

import { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  maxSize?: number;
  acceptedTypes?: string[];
}

export function ImageUpload({ 
  onImageSelect, 
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    setError(null);
    
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
      const url = URL.createObjectURL(file);
      setPreview(url);
      onImageSelect(url);
    }
  }, [maxSize, onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    maxFiles: 1,
  });

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
      onImageSelect('');
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
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
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
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}