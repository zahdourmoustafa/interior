"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const images = [
  {
    src: "/p1.webp",
    alt: "Office space 1",
  },
  {
    src: "/p2.webp",
    alt: "Office space 2",
  },
  {
    src: "/p3.webp",
    alt: "Office space 3",
  },
  {
    src: "/p4.webp",
    alt: "Office space 4",
  },
  {
    src: "/p5.webp",
    alt: "Office space 5",
  },
  {
    src: "/summer.webp",
    alt: "Office space 6",
  },
];

const firstRow = images.slice(0, images.length / 2);
const secondRow = images.slice(images.length / 2);

const ImageCard = ({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) => {
  return (
    <div
      className={cn(
        "relative h-64 w-80 cursor-pointer overflow-hidden rounded-xl border",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <img 
        className="h-full w-full object-cover transition-transform hover:scale-105" 
        src={src} 
        alt={alt}
      />
    </div>
  );
};

const MarqueeRow = ({ 
  images, 
  reverse = false, 
  duration = 30 
}: { 
  images: typeof firstRow; 
  reverse?: boolean; 
  duration?: number; 
}) => {
  // Calculate the width needed for seamless loop
  // Each image is 320px (w-80) + 16px gap = 336px per image
  const imageWidth = 336; // 320px + 16px gap
  const totalWidth = images.length * imageWidth;
  
  return (
    <div className="flex overflow-hidden">
      <motion.div
        className="flex shrink-0 gap-4"
        animate={{
          x: reverse ? [0, -totalWidth] : [-totalWidth, 0],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: duration,
            ease: "linear",
          },
        }}
      >
        {/* First set of images */}
        {images.map((image, index) => (
          <ImageCard key={`first-${index}`} {...image} />
        ))}
        {/* Second set of images for seamless loop */}
        {images.map((image, index) => (
          <ImageCard key={`second-${index}`} {...image} />
        ))}
        {/* Third set to ensure no gaps */}
        {images.map((image, index) => (
          <ImageCard key={`third-${index}`} {...image} />
        ))}
      </motion.div>
    </div>
  );
};

export function MarqueeImages() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-8">
      <MarqueeRow images={firstRow} duration={30} />
      <div className="mt-4">
        <MarqueeRow images={secondRow} reverse duration={30} />
      </div>
      {/* Gradient masks for smooth fade effect */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10"></div>
    </div>
  );
}
