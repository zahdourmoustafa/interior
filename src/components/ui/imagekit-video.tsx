"use client"

import { Video } from '@imagekit/next'
import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { 
  videoPresets,
  getConnectionAwareQuality,
} from '@/lib/imagekit'
import { ErrorBoundary } from './error-boundary'

interface NetworkConnection {
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g'
}

interface ExtendedNavigator extends Navigator {
  connection?: NetworkConnection
}

interface ImageKitVideoProps {
  src: string
  poster?: string
  className?: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  playsInline?: boolean
  controls?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  onLoad?: () => void
  onError?: (error: Event) => void
  priority?: boolean
  threshold?: number
  preset?: keyof typeof videoPresets
  quality?: number
  // ImageKit specific props
  transformation?: Record<string, string | number | boolean>
  posterTransformation?: Record<string, string | number | boolean>
  adaptive?: boolean // Adaptive streaming based on connection
}

// Detect connection speed for adaptive loading
const getConnectionSpeed = (): 'slow' | 'medium' | 'fast' => {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as ExtendedNavigator).connection
    if (connection?.effectiveType) {
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return 'slow'
      }
      if (connection.effectiveType === '3g') {
        return 'medium'
      }
    }
  }
  return 'fast'
}

function ImageKitVideoComponent({
  src,
  poster,
  className,
  autoPlay = false,
  loop = false,
  muted = true,
  playsInline = true,
  controls = false,
  preload = 'none',
  onLoad,
  onError,
  priority = false,
  threshold = 0.2,
  preset = 'gallery',
  quality,
  transformation = {},
  posterTransformation = {},
  adaptive = true
}: ImageKitVideoProps) {
  // All hooks must be called before any early returns
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(priority)
  const [hasError, setHasError] = useState(false)
  const [connectionSpeed] = useState(getConnectionSpeed())

  // Smart quality based on connection
  const adaptiveQuality = quality || (adaptive ? getConnectionAwareQuality() : 85)

  // Combine preset with custom transformations
  const finalTransformations = {
    ...videoPresets[preset],
    ...transformation,
    quality: adaptiveQuality,
  }

  // Poster transformations
  const finalPosterTransformations = {
    quality: adaptiveQuality,
    format: 'webp' as const,
    ...posterTransformation,
  }

  // Smart loading based on connection speed
  const shouldAutoPlay = useCallback(() => {
    if (!autoPlay || !isInView) return false
    if (connectionSpeed === 'slow') return false
    return true
  }, [autoPlay, isInView, connectionSpeed])

  // Enhanced intersection observer with connection awareness
  useEffect(() => {
    if (priority || shouldLoad || !src || src.trim() === '') return
    
    const observerThreshold = connectionSpeed === 'slow' ? 0.5 : threshold
    const rootMargin = connectionSpeed === 'slow' ? '0px' : '100px'

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setIsInView(true)
          
          // Delay loading for slow connections
          const loadDelay = connectionSpeed === 'slow' ? 1000 : 0
          
          setTimeout(() => {
            setShouldLoad(true)
          }, loadDelay)
          
          observer.unobserve(entry.target)
        }
      },
      {
        threshold: observerThreshold,
        rootMargin
      }
    )

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => observer.disconnect()
  }, [priority, shouldLoad, threshold, connectionSpeed, src])

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current
    if (!video || !shouldLoad) return

    const handleLoadedData = () => {
      setIsLoaded(true)
      onLoad?.()
    }

    const handleCanPlay = () => {
      if (shouldAutoPlay()) {
        video.play().catch((error) => {
          console.warn('Video autoplay failed:', error)
        })
      }
    }

    const handleError = (error: Event) => {
      setHasError(true)
      onError?.(error)
      console.warn('ImageKit video failed to load:', src, error)
    }

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
    }
  }, [shouldLoad, shouldAutoPlay, src, onLoad, onError])

  // Early return for invalid src - now after all hooks
  if (!src || src.trim() === '') {
    return (
      <div
        className={cn(
          "bg-gradient-to-br from-gray-100 to-gray-200",
          "flex items-center justify-center text-gray-400",
          className
        )}
        style={{ width: '100%', height: '100%' }}
      >
        <div className="text-center">
          <svg fill="currentColor" viewBox="0 0 20 20" className="w-12 h-12 mx-auto mb-2">
            <path d="M8 5v10l8-5-8-5z" />
          </svg>
          <p className="text-xs">Video not available</p>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div 
        className={cn(
          "bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 text-sm border-2 border-dashed border-gray-300 rounded-lg",
          className
        )}
      >
        <div className="text-center p-4">
          <div className="w-8 h-8 mx-auto mb-2 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM4 8a1 1 0 011-1h1a1 1 0 010 2H5a1 1 0 01-1-1zm6 0a1 1 0 011-1h1a1 1 0 010 2h-1a1 1 0 01-1-1z" />
            </svg>
          </div>
          <p className="text-xs">Video failed to load</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Enhanced loading skeleton */}
      {!isLoaded && shouldLoad && (
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200",
            "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
            className
          )}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500">Loading video...</p>
              {connectionSpeed === 'slow' && (
                <p className="text-xs text-gray-400 mt-1">Optimizing for slow connection</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Poster placeholder when not loading */}
      {!shouldLoad && poster && (
        <div className={cn("relative", className)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${poster}?tr=${Object.entries(finalPosterTransformations)
              .map(([key, value]) => `${key}-${value}`)
              .join(',')}`}
            alt="Video thumbnail"
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-gray-700 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 5v10l8-5-8-5z" />
              </svg>
            </div>
          </div>
          {connectionSpeed === 'slow' && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              Tap to load
            </div>
          )}
        </div>
      )}

      {/* ImageKit optimized video */}
      {shouldLoad && src && (
        <Video
          ref={videoRef}
          src={src}
          path={src}
          className={cn(
            "transition-all duration-500 ease-out",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          transformation={[finalTransformations]}
          autoPlay={false} // We handle autoplay manually
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          controls={controls}
          preload={connectionSpeed === 'slow' ? 'none' : preload}
          poster={poster ? `${poster}?tr=${Object.entries(finalPosterTransformations)
            .map(([key, value]) => `${key}-${value}`)
            .join(',')}` : undefined}
        />
      )}

      {/* Development indicators */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {connectionSpeed} • Q{adaptiveQuality}
          </div>
          {isLoaded && (
            <div className="absolute top-2 right-2 bg-green-600/70 text-white px-2 py-1 rounded text-xs">
              ✓ Loaded
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Default export with error boundary
export default function ImageKitVideo(props: ImageKitVideoProps) {
  return (
    <ErrorBoundary>
      <ImageKitVideoComponent {...props} />
    </ErrorBoundary>
  )
}

// Also export the component without error boundary for cases where it's not needed
export { ImageKitVideoComponent } 