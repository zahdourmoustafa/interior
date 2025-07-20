'use client';

import { useState } from 'react';
import { EnhancedImageUpload } from './enhanced-image-upload';
import { RoomTypeSelector } from './room-type-selector';
import { StyleSelector } from './style-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ControlPanel() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedImage || !selectedRoomType || selectedStyles.length === 0) {
      return;
    }
    
    setIsGenerating(true);
    // TODO: Implement generation logic
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const canGenerate = selectedImage && selectedRoomType && selectedStyles.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Generate New Design</h2>
        <p className="text-sm text-muted-foreground">
          Upload an image and select your preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step 1: Upload Image</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedImageUpload onImageUpload={setSelectedImage} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step 2: Select Room Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RoomTypeSelector 
            value={selectedRoomType} 
            onChange={setSelectedRoomType} 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step 3: Choose Styles</CardTitle>
        </CardHeader>
        <CardContent>
          <StyleSelector 
            selectedStyles={selectedStyles} 
            onChange={setSelectedStyles} 
          />
        </CardContent>
      </Card>

      <Button 
        className="w-full" 
        size="lg" 
        disabled={!canGenerate || isGenerating}
        onClick={handleGenerate}
      >
        {isGenerating ? 'Generating...' : 'Generate Design'}
      </Button>
    </div>
  );
}