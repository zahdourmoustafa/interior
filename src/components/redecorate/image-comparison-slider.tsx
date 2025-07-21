'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
}

export function ImageComparisonSlider({ 
  beforeImage, 
  afterImage, 
  className 
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
    setIsDragging(true);
  };

  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      
      setSliderPosition(Math.max(0, Math.min(100, percentage)));
    };

    const handleGlobalSelectStart = (e: Event) => {
      if (isDragging) {
        e.preventDefault();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('selectstart', handleGlobalSelectStart);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('selectstart', handleGlobalSelectStart);
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden rounded-lg cursor-col-resize select-none",
        className
      )}
      onMouseDown={handleContainerMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
    >
      {/* Before Image (Right side) */}
      <div className="absolute inset-0 select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}>
        <Image
          src={beforeImage}
          alt="Before"
          fill
          className="object-cover pointer-events-none"
          draggable={false}
        />
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm pointer-events-none">
          Before
        </div>
      </div>

      {/* After Image (Left side) */}
      <div 
        className="absolute inset-0 overflow-hidden select-none"
        style={{ 
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          userSelect: 'none', 
          WebkitUserSelect: 'none', 
          MozUserSelect: 'none', 
          msUserSelect: 'none' 
        }}
      >
        <Image
          src={afterImage}
          alt="After"
          fill
          className="object-cover pointer-events-none"
          draggable={false}
        />
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-sm pointer-events-none">
          After
        </div>
      </div>

      {/* Slider Line */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 select-none"
        style={{ 
          left: `${sliderPosition}%`,
          userSelect: 'none', 
          WebkitUserSelect: 'none', 
          MozUserSelect: 'none', 
          msUserSelect: 'none' 
        }}
      >
        {/* Slider Handle */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-300 cursor-col-resize flex items-center justify-center select-none"
          style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
          onMouseDown={handleMouseDown}
        >
          <div className="flex space-x-0.5 pointer-events-none">
            <div className="w-0.5 h-4 bg-gray-400"></div>
            <div className="w-0.5 h-4 bg-gray-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
}