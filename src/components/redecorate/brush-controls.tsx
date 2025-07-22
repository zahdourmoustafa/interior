"use client";

import { Slider } from "@/components/ui/slider";

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
    <div className="flex flex-col gap-4 w-full p-4 bg-white rounded-lg shadow-sm">
      <div>
        <label className="text-sm font-medium mb-1 block">
          Brush Size: {brushSize}px
        </label>
        <Slider
          value={[brushSize]}
          min={5}
          max={50}
          step={1}
          onValueChange={(value) => setBrushSize(value[0])}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">
          Brush Opacity: {Math.round(brushOpacity * 100)}%
        </label>
        <Slider
          value={[brushOpacity * 100]}
          min={10}
          max={100}
          step={5}
          onValueChange={(value) => setBrushOpacity(value[0] / 100)}
        />
      </div>

      <button
        onClick={clearMask}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded transition-colors"
      >
        Clear Selection
      </button>

      <div className="text-sm text-gray-500 mt-2">
        Use the brush to select the object you want to remove. Adjust the brush
        size and opacity as needed.
      </div>
    </div>
  );
}
