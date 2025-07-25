#!/usr/bin/env node

/**
 * Media Optimization Script
 * This script helps identify and optimize large media files in the public directory
 */

const fs = require('fs');
const path = require('path');

const publicDir = path.join(process.cwd(), 'public');
const maxImageSize = 500 * 1024; // 500KB
const maxVideoSize = 2 * 1024 * 1024; // 2MB

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeMediaFiles() {
  console.log('🔍 Analyzing media files in /public directory...\n');
  
  const files = fs.readdirSync(publicDir);
  const largeFiles = [];
  const recommendations = [];

  files.forEach(file => {
    const filePath = path.join(publicDir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isFile()) {
      const ext = path.extname(file).toLowerCase();
      const size = stats.size;
      
      // Check images
      if (['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext)) {
        if (size > maxImageSize) {
          largeFiles.push({ file, size, type: 'image' });
          
          if (ext === '.png' && size > 1024 * 1024) {
            recommendations.push(`📸 Convert ${file} to WebP format for better compression`);
          }
          if (ext === '.jpg' || ext === '.jpeg') {
            recommendations.push(`📸 Optimize ${file} with 85% quality or convert to WebP`);
          }
        }
      }
      
      // Check videos
      if (['.mp4', '.webm', '.mov'].includes(ext)) {
        if (size > maxVideoSize) {
          largeFiles.push({ file, size, type: 'video' });
          recommendations.push(`🎥 Compress ${file} or create multiple quality versions`);
        }
      }
    }
  });

  // Display results
  if (largeFiles.length > 0) {
    console.log('⚠️  Large files found:');
    largeFiles.forEach(({ file, size, type }) => {
      console.log(`   ${type === 'video' ? '🎥' : '📸'} ${file}: ${formatBytes(size)}`);
    });
    console.log('');
  }

  if (recommendations.length > 0) {
    console.log('💡 Optimization recommendations:');
    recommendations.forEach(rec => console.log(`   ${rec}`));
    console.log('');
  }

  // Optimization commands
  console.log('🛠️  Optimization commands:');
  console.log('');
  console.log('For images (requires imagemagick):');
  console.log('   convert image.png -quality 85 -format webp image.webp');
  console.log('');
  console.log('For videos (requires ffmpeg):');
  console.log('   ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset fast -c:a aac output.mp4');
  console.log('   ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 output.webm');
  console.log('');
  console.log('📦 Or use online tools:');
  console.log('   Images: TinyPNG, Squoosh.app');
  console.log('   Videos: Handbrake, CloudConvert');
}

analyzeMediaFiles(); 