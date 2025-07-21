'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const designStyles = [
  {
    id: 'scandinavian',
    name: 'SCANDINAVIAN',
    image: '/modern.webp',
    color: 'bg-blue-500'
  },
  {
    id: 'christmas',
    name: 'CHRISTMAS',
    image: '/vintage.webp',
    color: 'bg-red-500'
  },
  {
    id: 'japanese',
    name: 'JAPANESE',
    image: '/professional.webp',
    color: 'bg-green-500'
  },
  {
    id: 'eclectic',
    name: 'ECLECTIC',
    image: '/tropical.webp',
    color: 'bg-purple-500'
  },
  {
    id: 'minimalist',
    name: 'MINIMALIST',
    image: '/coastal.webp',
    color: 'bg-gray-500'
  },
  {
    id: 'futuristic',
    name: 'FUTURISTIC',
    image: '/industrial.webp',
    color: 'bg-cyan-500'
  },
  {
    id: 'bohemian',
    name: 'BOHEMIAN',
    image: '/summer.webp',
    color: 'bg-orange-500'
  },
  {
    id: 'parisian',
    name: 'PARISIAN',
    image: '/neoclassic.webp',
    color: 'bg-pink-500'
  }
];

interface DesignStyleSidebarProps {
  selectedStyle: string | null;
  onStyleSelect: (styleId: string) => void;
}

export function DesignStyleSidebar({ selectedStyle, onStyleSelect }: DesignStyleSidebarProps) {
  return (
    <div className="w-32 bg-gray-900 flex flex-col space-y-3 p-3 overflow-y-auto">
      {designStyles.map((style) => (
        <div
          key={style.id}
          className={cn(
            "relative h-24 cursor-pointer transition-all duration-200 border-2 overflow-hidden rounded-lg",
            selectedStyle === style.id 
              ? "border-orange-500 ring-2 ring-orange-500/50" 
              : "border-transparent hover:border-gray-600"
          )}
          onClick={() => onStyleSelect(style.id)}
        >
          <Image
            src={style.image}
            alt={style.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <span className="text-white text-[10px] font-bold text-center leading-tight">
              {style.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}