'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';

interface FurnishControlSidebarProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

export function FurnishControlSidebar({ onGenerate, isGenerating }: FurnishControlSidebarProps) {
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt.trim());
    }
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  const examplePrompts = [
    "Add a modern gray sectional sofa, glass coffee table, and floor lamp in the center",
    "Place a wooden dining table with 6 chairs, pendant lighting above, and a sideboard",
    "Add a king-size bed with nightstands, table lamps, and a dresser with mirror",
    "Include a comfortable reading chair, bookshelf, desk with computer, and plants",
    "Add a large kitchen island with bar stools, pendant lights, and modern appliances"
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Furnish Empty Space
          </CardTitle>
          <CardDescription>
            Describe what furniture and decor you want to add to your empty room
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="furnish-prompt">Furniture & Decor Description</Label>
            <Textarea
              id="furnish-prompt"
              placeholder="e.g., Add a comfortable gray sofa, wooden coffee table, floor lamp, and some plants in the living room..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Be specific about furniture types, colors, placement, and style preferences
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Example Prompts</Label>
            <div className="space-y-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                  disabled={isGenerating}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Furnishing Room...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Furnish Room
              </>
            )}
          </Button>

          {prompt.trim() && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Your Request:</strong> {prompt}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
