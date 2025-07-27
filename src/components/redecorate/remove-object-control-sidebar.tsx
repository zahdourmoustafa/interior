'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eraser, Brush, Type } from 'lucide-react';
import { BrushControls } from './brush-controls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RemoveObjectControlSidebarProps {
  onGenerate: (prompt: string, mask?: string) => void;
  isGenerating: boolean;
  brushSize: number;
  setBrushSize: (size: number) => void;
  brushOpacity: number;
  setBrushOpacity: (opacity: number) => void;
  clearMask: () => void;
  mask: string;
  isDrawingMode: boolean;
  setIsDrawingMode: (mode: boolean) => void;
}

export function RemoveObjectControlSidebar({
  onGenerate,
  isGenerating,
  brushSize,
  setBrushSize,
  brushOpacity,
  setBrushOpacity,
  clearMask,
  mask,
  isDrawingMode,
  setIsDrawingMode,
}: RemoveObjectControlSidebarProps) {
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('brush');

  const handleGenerate = () => {
    if (activeTab === 'brush' && mask) {
      onGenerate('Remove the object highlighted by the red mask', mask);
    } else if (activeTab === 'text' && prompt.trim()) {
      onGenerate(prompt.trim());
    }
  };

  const canGenerate = (activeTab === 'brush' && mask) || (activeTab === 'text' && prompt.trim());

  const examplePrompts = [
    "Remove the chair from the room",
    "Remove the table in the center",
    "Remove the lamp on the left side",
    "Remove the painting on the wall",
    "Remove the plant in the corner"
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eraser className="h-5 w-5 text-red-600" />
            Remove Objects
          </CardTitle>
          <CardDescription>
            Choose how you want to select objects for removal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="brush" className="flex items-center gap-2">
                <Brush className="h-4 w-4" />
                Brush Tool
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Text Prompt
              </TabsTrigger>
            </TabsList>

            <TabsContent value="brush" className="space-y-4">
              <div className="space-y-2">
                <Label>Brush Selection Mode</Label>
                <p className="text-sm text-gray-600">
                  Use the brush to paint over the object you want to remove
                </p>
                <div className="flex gap-2">
                  <Button
                    variant={isDrawingMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsDrawingMode(!isDrawingMode)}
                    className="flex items-center gap-2"
                  >
                    <Brush className="h-4 w-4" />
                    {isDrawingMode ? 'Drawing' : 'Draw Mode'}
                  </Button>
                </div>
              </div>

              <BrushControls
                brushSize={brushSize}
                setBrushSize={setBrushSize}
                brushOpacity={brushOpacity}
                setBrushOpacity={setBrushOpacity}
                clearMask={clearMask}
              />

              {mask && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    ✓ Object selected with brush. Ready to remove!
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="remove-prompt">Object Description</Label>
                <Textarea
                  id="remove-prompt"
                  placeholder="e.g., Remove the red chair in the center of the room..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  Describe the specific object you want to remove
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Example Prompts</Label>
                <div className="space-y-2">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                      disabled={isGenerating}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {prompt.trim() && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Will Remove:</strong> {prompt}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !canGenerate}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing Object...
              </>
            ) : (
              <>
                <Eraser className="mr-2 h-4 w-4" />
                Remove Object
              </>
            )}
          </Button>

          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Brush Mode:</strong> Paint over the object to select it</p>
            <p><strong>Text Mode:</strong> Describe the object to remove</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
