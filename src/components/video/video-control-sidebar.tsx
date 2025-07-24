"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

const videoEffects = [
  {
    id: 'arcAroundObject',
    name: 'Arc Around',
    icon: RotateCcw,
    color: 'bg-blue-500'
  },
  {
    id: 'zoomIn',
    name: 'Zoom In',
    icon: ZoomIn,
    color: 'bg-red-500'
  },
  {
    id: 'zoomOut',
    name: 'Zoom Out',
    icon: ZoomOut,
    color: 'bg-green-500'
  },
];

interface VideoControlSidebarProps {
  onGenerate: () => void;
  isGenerating: boolean;
  selectedEffect: string | null;
  onEffectSelect: (effectId: string) => void;
}

export function VideoControlSidebar({
  onGenerate,
  isGenerating,
  selectedEffect,
  onEffectSelect,
}: VideoControlSidebarProps) {
  return (
    <div className="w-80 bg-white border-l flex flex-col h-full overflow-y-auto">
      {/* Title and Description */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900 mb-1">Generate Video</h3>
        <p className="text-sm text-gray-600">Select an effect and click generate.</p>
      </div>

      <div className="p-4">
        <h4 className="font-medium text-gray-900 mb-2">Video Effects</h4>
        <div className="grid grid-cols-3 gap-2">
          {videoEffects.map((effect) => (
            <div
              key={effect.id}
              className={cn(
                "relative h-20 cursor-pointer transition-all duration-200 border-2 overflow-hidden rounded-lg flex items-center justify-center",
                selectedEffect === effect.id 
                  ? "border-[#3b82f6] ring-2 ring-[#3b82f6]/50" 
                  : "border-transparent hover:border-gray-600",
                effect.color
              )}
              onClick={() => onEffectSelect(effect.id)}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-white">
                <effect.icon className="h-6 w-6 mb-1" />
                <span className="text-[10px] font-bold text-center leading-tight">
                  {effect.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="mt-auto p-4">
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-3 text-lg font-medium"
        >
          {isGenerating ? "Generating..." : "Generate"}
        </Button>
      </div>
    </div>
  );
}