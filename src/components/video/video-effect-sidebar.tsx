'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

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

interface VideoEffectSidebarProps {
  selectedEffect: string | null;
  onEffectSelect: (effectId: string) => void;
}

export function VideoEffectSidebar({ selectedEffect, onEffectSelect }: VideoEffectSidebarProps) {
  return (
    <div className="w-32 bg-gray-900 flex flex-col space-y-3 p-3 overflow-y-auto">
      {videoEffects.map((effect) => (
        <div
          key={effect.id}
          className={cn(
            "relative h-24 cursor-pointer transition-all duration-200 border-2 overflow-hidden rounded-lg flex items-center justify-center",
            selectedEffect === effect.id 
              ? "border-orange-500 ring-2 ring-orange-500/50" 
              : "border-transparent hover:border-gray-600",
            effect.color
          )}
          onClick={() => onEffectSelect(effect.id)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-white">
            <effect.icon className="h-8 w-8 mb-2" />
            <span className="text-[10px] font-bold text-center leading-tight">
              {effect.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}