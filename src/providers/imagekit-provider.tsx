"use client"

import { ImageKitProvider } from '@imagekit/next'
import { imagekitConfig } from '@/lib/imagekit'

interface ImageKitWrapperProps {
  children: React.ReactNode
}

export default function ImageKitWrapper({ children }: ImageKitWrapperProps) {
  return (
    <ImageKitProvider
      urlEndpoint={imagekitConfig.urlEndpoint}
    >
      {children}
    </ImageKitProvider>
  )
} 