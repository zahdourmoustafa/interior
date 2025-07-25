"use client"

import { Image } from '@imagekit/next'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { 
  transformationPresets, 
  generateImageKitBlurPlaceholder,
  getOptimalFormat,
  getConnectionAwareQuality,
} from '@/lib/imagekit'
import { ErrorBoundary } from './error-boundary'

interface ImageKitImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  preset?: keyof typeof transformationPresets
  quality?: number
  sizes?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: (error: Error) => void
  eager?: boolean
  threshold?: number
  // ImageKit specific props
  transformation?: Record<string, string | number | boolean>
  lqip?: boolean // Low Quality Image Placeholder
  responsive?: boolean
}

function ImageKitImageComponent({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  preset = 'gallery',
  quality,
  sizes = '100vw',
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  eager = false,
  threshold = 0.1,
  transformation = {},
  lqip = true,
  responsive = true
}: ImageKitImageProps) {
  // All hooks must be called before any early returns
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(priority || eager)
  const imgRef = useRef<HTMLDivElement>(null)

  // Smart quality based on connection
  const adaptiveQuality = quality || getConnectionAwareQuality()
  
  // Optimal format for browser
  const optimalFormat = getOptimalFormat()

  // Combine preset with custom transformations
  const finalTransformations = {
    ...transformationPresets[preset],
    ...transformation,
    quality: adaptiveQuality,
    format: optimalFormat,
  }

  // Generate blur placeholder if not provided
  const placeholderDataURL = blurDataURL || 
    (lqip ? generateImageKitBlurPlaceholder(src, 40, Math.round(40 * height / width)) : undefined)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || eager || shouldLoad || !src || src.trim() === '') return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setShouldLoad(true)
          observer.unobserve(entry.target)
        }
      },
      {
        threshold,
        rootMargin: '50px'
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority, eager, shouldLoad, threshold, src])

  // Early return for invalid src - now after all hooks
  if (!src || src.trim() === '') {
    return (
      <div
        className={cn(
          "bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse",
          "flex items-center justify-center text-gray-400",
          className
        )}
        style={{ width, height }}
      >
        <svg fill="currentColor" viewBox="0 0 20 20" className="w-8 h-8">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true)
    const error = new Error(`ImageKit image failed to load: ${src}`)
    onError?.(error)
    console.warn(`ImageKit image failed to load: ${src}`, event)
  }

  // Error state
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
      {/* Loading skeleton */}
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

      {/* Intersection placeholder */}
      {!shouldLoad && placeholderDataURL && (
        <div 
          className={cn("relative", className)} 
          style={{ width, height }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={placeholderDataURL}
            alt=""
            className="w-full h-full object-cover filter blur-lg scale-110"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gray-100/50 flex items-center justify-center">
            <div className="text-gray-500 text-xs">Loading...</div>
          </div>
        </div>
      )}

      {/* ImageKit optimized image */}
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
          transformation={[finalTransformations]}
          sizes={responsive ? sizes : undefined}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          placeholder={placeholder === 'blur' && placeholderDataURL ? 'blur' : 'empty'}
          blurDataURL={placeholderDataURL}
        />
      )}

      {/* Loading indicator overlay */}
      {shouldLoad && !isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Development info */}
      {process.env.NODE_ENV === 'development' && isLoaded && (
        <div className="absolute top-1 left-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs">
          {optimalFormat.toUpperCase()} • Q{adaptiveQuality}
        </div>
      )}
    </div>
  )
}

// Default export with error boundary
export default function ImageKitImage(props: ImageKitImageProps) {
  return (
    <ErrorBoundary>
      <ImageKitImageComponent {...props} />
    </ErrorBoundary>
  )
}

// Also export the component without error boundary for cases where it's not needed
export { ImageKitImageComponent } 