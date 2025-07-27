"use client";

import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Eraser, Palette } from "lucide-react";

interface BrushControlsProps {
  brushSize: number;
  setBrushSize: (size: number) => void;
  brushOpacity: number;
  setBrushOpacity: (opacity: number) => void;
  clearMask: () => void;
}

export function BrushControls({
  brushSize,
  setBrushSize,
  brushOpacity,
  setBrushOpacity,
  clearMask,
}: BrushControlsProps) {
  return (
    <div className="flex flex-col gap-4 w-full p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center gap-2 mb-2">
        <Palette className="h-4 w-4 text-red-500" />
        <span className="text-sm font-medium text-gray-700">Brush Settings</span>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block text-gray-600">
          Brush Size: {brushSize}px
        </label>
        <Slider
          value={[brushSize]}
          min={5}
          max={50}
          step={1}
          onValueChange={(value) => setBrushSize(value[0])}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>5px</span>
          <span>50px</span>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block text-gray-600">
          Brush Opacity: {Math.round(brushOpacity * 100)}%
        </label>
        <Slider
          value={[brushOpacity * 100]}
          min={10}
          max={100}
          step={5}
          onValueChange={(value) => setBrushOpacity(value[0] / 100)}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>10%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Brush Preview */}
      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
        <span className="text-xs text-gray-600">Preview:</span>
        <div 
          className="rounded-full bg-red-500 border border-red-300"
          style={{ 
            width: `${Math.max(brushSize / 2, 8)}px`, 
            height: `${Math.max(brushSize / 2, 8)}px`,
            opacity: brushOpacity
          }}
        />
      </div>

      <Button
        onClick={clearMask}
        variant="outline"
        className="w-full flex items-center gap-2 text-gray-700 hover:text-red-600 hover:border-red-300"
      >
        <Eraser className="h-4 w-4" />
        Clear Selection
      </Button>

      <div className="text-xs text-gray-500 p-2 bg-blue-50 rounded border border-blue-200">
        <strong>💡 Tip:</strong> Use the brush to paint over the object you want to remove. 
        Adjust size and opacity for better precision.
      </div>
    </div>
  );
}
