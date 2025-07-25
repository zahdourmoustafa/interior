# ImageKit.io Integration Setup

This document outlines how to set up and use ImageKit.io for optimized image and video delivery in the ArchiCassoAI application.

## Overview

ImageKit.io provides real-time image and video optimization, transformation, and CDN delivery. Our integration includes:

- 🚀 **Real-time image optimization** - WebP/AVIF format conversion
- 📱 **Responsive images** - Automatic srcset generation for different screen sizes  
- 🎥 **Video optimization** - Adaptive streaming based on connection speed
- ⚡ **Smart loading** - Intersection observer with connection-aware loading
- 🎨 **On-the-fly transformations** - Resize, crop, quality adjustment
- 📈 **Performance monitoring** - Built-in optimization metrics

## Setup Instructions

### 1. Create ImageKit Account

1. Go to [ImageKit.io](https://imagekit.io) and create an account
2. Complete account verification
3. Note your **URL Endpoint** from the dashboard (e.g., `https://ik.imagekit.io/your_id`)

### 2. Get API Keys

From your ImageKit dashboard:

1. Navigate to **Developer** → **API Keys**
2. Copy the following credentials:
   - **URL Endpoint**: `https://ik.imagekit.io/your_imagekit_id`
   - **Public Key**: Your public API key
   - **Private Key**: Your private API key (keep secure)

### 3. Environment Configuration

Create or update your `.env.local` file:

```bash
# ImageKit.io Configuration
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_imagekit_id"
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="public_your_public_key_here"
IMAGEKIT_PRIVATE_KEY="private_your_private_key_here"
```

⚠️ **Security Note**: Private key should only be used server-side for uploads/authentication.

### 4. Upload Your Assets

Upload your images and videos to ImageKit through:

**Option A: Web Dashboard**
1. Go to **Media Library** in ImageKit dashboard
2. Upload your assets via drag-and-drop
3. Organize in folders (e.g., `/landing-page/`, `/gallery/`)

**Option B: API Upload** (for automation)
```bash
curl -X POST "https://upload.imagekit.io/api/v1/files/upload" \
  -u "private_key:" \
  -F "file=@/path/to/image.jpg" \
  -F "fileName=modern-room.jpg" \
  -F "folder=/landing-page/"
```

### 5. Update Image References

Replace your current image paths with ImageKit paths:

**Before:**
```typescript
src="/modern.webp"
```

**After:**
```typescript
src="/modern.webp"  // ImageKit will serve from your endpoint
```

## Component Usage

### ImageKitImage Component

```typescript
import ImageKitImage from '@/components/ui/imagekit-image'

<ImageKitImage
  src="/modern.webp"
  alt="Modern living room design"
  width={800}
  height={600}
  preset="hero"                    // Predefined optimization preset
  priority={true}                  // High priority loading
  responsive={true}                // Generate responsive srcset
  sizes="(max-width: 768px) 100vw, 80vw"
  transformation={{                // Custom transformations
    quality: 90,
    format: 'webp'
  }}
/>
```

### ImageKitVideo Component

```typescript
import ImageKitVideo from '@/components/ui/imagekit-video'

<ImageKitVideo
  src="/bedroom_video.mp4"
  poster="/bedroom.webp"
  preset="gallery"                 // Video optimization preset
  autoPlay={true}
  loop={true}
  muted={true}
  adaptive={true}                  // Connection-aware quality
  transformation={{
    quality: 85,
    format: 'mp4'
  }}
/>
```

## Optimization Presets

### Image Presets

| Preset | Quality | Format | Use Case |
|--------|---------|--------|----------|
| `hero` | 90% | WebP | Hero sections, key visuals |
| `gallery` | 85% | WebP | Gallery images, general content |
| `thumbnail` | 80% | WebP | Small previews, avatars |
| `background` | 75% | WebP | Background images |

### Video Presets

| Preset | Quality | Format | Use Case |
|--------|---------|--------|----------|
| `hero` | 90% | MP4 | Hero videos, key content |
| `gallery` | 80% | MP4 | General video content |
| `thumbnail` | 70% | MP4 | Video previews |

## Advanced Features

### Connection-Aware Loading

The components automatically detect user connection speed and adjust:

- **Fast connections**: Full quality, immediate loading
- **Medium connections**: Reduced quality, normal loading  
- **Slow connections**: Minimal quality, delayed loading with user confirmation

### Responsive Image Generation

Automatically generates srcset for common breakpoints:
```
384w, 640w, 750w, 828w, 1080w, 1200w, 1920w, 2048w, 3840w
```

### Custom Transformations

Apply real-time transformations:

```typescript
transformation={{
  width: 800,
  height: 600,
  crop: 'maintain_ratio',
  quality: 90,
  format: 'webp',
  blur: 2,                    // Blur effect
  sharpen: 1,                 // Sharpen filter
  contrast: 1.2,              // Contrast adjustment
  brightness: 1.1,            // Brightness adjustment
  saturation: 1.1,            // Saturation boost
  'border-width': 5,          // Add border
  'border-color': 'FF0000'    // Border color (hex)
}}
```

## Performance Monitoring

### Development Mode

In development, components show optimization info:
- Format used (WebP, AVIF, JPG)
- Quality level applied
- Connection speed detected

### Production Analytics

ImageKit provides built-in analytics:
- Bandwidth savings
- Format distribution
- Geographic performance
- Cache hit rates

Access at: **ImageKit Dashboard** → **Analytics**

## Best Practices

### 1. Folder Organization
```
/landing-page/
  /hero/
  /gallery/
  /features/
/dashboard/
  /uploads/
  /generated/
/assets/
  /icons/
  /backgrounds/
```

### 2. Image Naming
- Use descriptive names: `modern-living-room.webp`
- Include dimensions for clarity: `hero-1920x1080.webp`
- Use consistent naming patterns

### 3. Optimization Tips
- Use `priority={true}` for above-the-fold images
- Set appropriate `sizes` for responsive images
- Choose the right preset for your use case
- Use lazy loading for below-the-fold content

### 4. SEO Considerations
- Always provide descriptive `alt` text
- Use appropriate image dimensions
- Implement structured data for rich snippets

## Troubleshooting

### Common Issues

**Images not loading:**
1. Check environment variables are set correctly
2. Verify ImageKit URL endpoint is accessible
3. Ensure images are uploaded to ImageKit

**Slow loading:**
1. Check if using appropriate preset
2. Verify connection-aware features are working
3. Consider using lower quality for faster loading

**Transformation not applied:**
1. Check transformation syntax
2. Verify transformation is supported
3. Clear ImageKit cache if needed

### Debug Mode

Enable debug logging in development:

```typescript
// In your component
{process.env.NODE_ENV === 'development' && (
  <div className="debug-info">
    ImageKit Debug: {JSON.stringify(transformations)}
  </div>
)}
```

## Support

- **ImageKit Documentation**: [https://docs.imagekit.io](https://docs.imagekit.io)
- **ImageKit Support**: [https://imagekit.io/support](https://imagekit.io/support)
- **Component Issues**: Check our GitHub repository issues

## Migration Checklist

- [ ] ImageKit account created and verified
- [ ] Environment variables configured
- [ ] Assets uploaded to ImageKit
- [ ] Components updated to use ImageKitImage/ImageKitVideo
- [ ] Landing page components tested
- [ ] Performance metrics verified
- [ ] SEO impact assessed

## Next Steps

After successful integration:

1. **Monitor Performance**: Use ImageKit analytics to track improvements
2. **Optimize Further**: Fine-tune presets based on real usage data
3. **Scale Up**: Consider ImageKit's advanced features like AI-based cropping
4. **Automation**: Set up automated uploads for new content 