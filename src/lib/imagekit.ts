export const imagekitConfig = {
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  // Server-side only (for upload auth)
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
}

// Common transformation presets for different use cases
export const transformationPresets = {
  // Hero images - high quality, optimized loading
  hero: {
    quality: 90,
    format: 'webp' as const,
    progressive: true,
  },
  
  // Gallery images - balanced quality and size  
  gallery: {
    quality: 85,
    format: 'webp' as const,
    progressive: true,
  },
  
  // Thumbnails - smaller, faster loading
  thumbnail: {
    quality: 80,
    format: 'webp' as const,
    crop: 'maintain_ratio' as const,
  },
  
  // Background images - optimized for size
  background: {
    quality: 75,
    format: 'webp' as const,
    blur: 2, // Slight blur for backgrounds
  },
  
  // Profile/avatar images
  avatar: {
    quality: 85,
    format: 'webp' as const,
    crop: 'force' as const,
    cropMode: 'extract' as const,
  }
}

// Video transformation presets
export const videoPresets = {
  // Hero videos - high quality
  hero: {
    quality: 90,
    format: 'mp4' as const,
  },
  
  // Gallery videos - balanced
  gallery: {
    quality: 80,
    format: 'mp4' as const,
  },
  
  // Thumbnail videos - small previews
  thumbnail: {
    quality: 70,
    format: 'mp4' as const,
  }
}

// Generate responsive srcset with ImageKit transformations
export const generateResponsiveSrcSet = (
  src: string,
  preset: keyof typeof transformationPresets = 'gallery'
) => {
  const baseTransforms = transformationPresets[preset]
  const breakpoints = [384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]
  
  return breakpoints.map(width => {
    const transforms = {
      ...baseTransforms,
      width,
      'c-at_max': true, // Crop at max to maintain aspect ratio
    }
    
    const transformString = Object.entries(transforms)
      .map(([key, value]) => `${key}-${value}`)
      .join(',')
    
    return `${src}?tr=${transformString} ${width}w`
  }).join(', ')
}

// Generate blur placeholder for better UX
export const generateImageKitBlurPlaceholder = (
  src: string, 
  width: number = 40, 
  height: number = 40
) => {
  const transforms = {
    width,
    height,
    blur: 20,
    quality: 20,
    format: 'webp' as const
  }
  
  const transformString = Object.entries(transforms)
    .map(([key, value]) => `${key}-${value}`)
    .join(',')
  
  return `${src}?tr=${transformString}`
}

// Utility to build ImageKit URL with transformations
export const buildImageKitUrl = (
  src: string,
  transformations: Record<string, string | number | boolean> = {},
  preset?: keyof typeof transformationPresets
) => {
  let allTransforms = { ...transformations }
  
  if (preset) {
    allTransforms = { ...transformationPresets[preset], ...transformations }
  }
  
  if (Object.keys(allTransforms).length === 0) {
    return src
  }
  
  const transformString = Object.entries(allTransforms)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}-${value}`)
    .join(',')
  
  return `${src}?tr=${transformString}`
}

// Smart format detection based on browser support
// Returns consistent format to avoid SSR hydration mismatches
export const getOptimalFormat = () => {
  // Always return 'webp' for consistency between server and client
  // This prevents hydration mismatches while still providing good optimization
  return 'webp' as const
}

// Client-side format detection for advanced use cases
export const getClientOptimalFormat = () => {
  if (typeof window === 'undefined') return 'webp' as const
  
  try {
    // Check WebP support using canvas
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const webpSupported = canvas.toDataURL('image/webp').indexOf('webp') > -1
    
    if (webpSupported) return 'webp' as const
    return 'jpg' as const
  } catch {
    return 'webp' as const
  }
}

interface NetworkConnection {
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g'
}

interface ExtendedNavigator extends Navigator {
  connection?: NetworkConnection
}

// Connection-aware quality adjustment
export const getConnectionAwareQuality = () => {
  if (typeof navigator === 'undefined') return 85 // Default for SSR
  
  const connection = (navigator as ExtendedNavigator).connection
  if (!connection) return 85
  
  switch (connection.effectiveType) {
    case 'slow-2g':
    case '2g':
      return 60
    case '3g':
      return 75
    default:
      return 85
  }
} 