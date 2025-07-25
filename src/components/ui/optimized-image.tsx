"use client"

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  eager?: boolean // Force immediate loading
  threshold?: number // Intersection observer threshold
}

// Generate smart blur placeholder based on image characteristics
const generateSmartBlurDataURL = (src: string, width: number, height: number) => {
  // Extract color hints from filename or use defaults
  const filename = src.toLowerCase();
  let color = '#e5e7eb'; // default gray
  
  if (filename.includes('modern')) color = '#3b82f6'; // blue
  else if (filename.includes('coastal')) color = '#06b6d4'; // cyan
  else if (filename.includes('vintage')) color = '#a855f7'; // purple
  else if (filename.includes('tropical')) color = '#10b981'; // emerald
  else if (filename.includes('industrial')) color = '#6b7280'; // gray
  else if (filename.includes('professional')) color = '#1f2937'; // dark
  else if (filename.includes('summer')) color = '#fbbf24'; // yellow
  
  // Create a more sophisticated blur placeholder
  return `data:image/svg+xml;base64,${btoa(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      <circle cx="50%" cy="50%" r="10" fill="${color}" opacity="0.2"/>
    </svg>`
  )}`;
};

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 85,
  sizes,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  eager = false,
  threshold = 0.1
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(priority || eager)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || eager || shouldLoad) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '50px' // Start loading 50px before entering viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, eager, shouldLoad, threshold]);

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    console.warn(`Failed to load image: ${src}`)
  }

  // Generate smart blur placeholder
  const smartBlurDataURL = blurDataURL || generateSmartBlurDataURL(src, width, height);

  if (hasError) {
    return (
      <div 
        className={cn(
          "bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 text-sm border-2 border-dashed border-gray-300 rounded-lg",
          className
        )} 
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <div className="w-8 h-8 mx-auto mb-2 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-xs">Image failed to load</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={imgRef} className="relative overflow-hidden">
      {/* Skeleton loader while not loaded */}
      {!isLoaded && shouldLoad && (
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse",
            "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
            className
          )} 
          style={{ width, height }}
        />
      )}

      {/* Intersection placeholder when not in view */}
      {!shouldLoad && (
        <div 
          className={cn(
            "bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center",
            className
          )} 
          style={{ width, height }}
        >
          <div className="text-gray-400 text-xs">Loading...</div>
        </div>
      )}

      {/* Actual image */}
      {shouldLoad && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            "transition-all duration-500 ease-out",
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
            className
          )}
          priority={priority}
          quality={quality}
          sizes={sizes}
          placeholder={placeholder}
          blurDataURL={smartBlurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
        />
      )}

      {/* Loading indicator overlay */}
      {shouldLoad && !isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

// Export additional utility for generating blur placeholders
export { generateSmartBlurDataURL } 