"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import Section from "@/components/section";

// Gallery data with room designs
const galleryData = [
  {
    id: 1,
    image: "/modern.webp",
    title: "Modern Living Room",
    description: "Contemporary design with clean lines and natural light"
  },
  {
    id: 2,
    image: "/coastal.webp",
    title: "Coastal Retreat",
    description: "Serene beach-inspired interior with ocean views"
  },
  {
    id: 3,
    image: "/vintage.webp",
    title: "Vintage Elegance",
    description: "Classic charm with modern comfort"
  },
  {
    id: 4,
    image: "/tropical.webp",
    title: "Tropical Paradise",
    description: "Lush greenery and vibrant colors"
  },
  {
    id: 5,
    image: "/industrial.webp",
    title: "Industrial Chic",
    description: "Raw materials meet sophisticated design"
  },
  {
    id: 6,
    image: "/neoclassic.webp",
    title: "Neoclassical Grandeur",
    description: "Timeless elegance with architectural details"
  },
  {
    id: 7,
    image: "/professional.webp",
    title: "Professional Office",
    description: "Productive workspace with modern amenities"
  },
  {
    id: 8,
    image: "/summer.webp",
    title: "Summer Breeze",
    description: "Light and airy seasonal design"
  },
  {
    id: 9,
    image: "/tribal.webp",
    title: "Tribal Fusion",
    description: "Cultural elements with contemporary style"
  }
];

// Duplicate the array to create seamless infinite scroll
const duplicatedGalleryData = [...galleryData, ...galleryData, ...galleryData];

function GalleryCard({ item, index }: { item: typeof galleryData[0], index: number }) {
  return (
    <motion.div
      className="relative flex-shrink-0 w-80 h-96 mx-4 rounded-xl overflow-hidden group cursor-pointer shadow-none"
      style={{ boxShadow: 'none' }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 30
      }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
    >
      {/* Image */}
      <div className="relative w-full h-full">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-xl font-bold mb-2">{item.title}</h3>
          <p className="text-sm text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            {item.description}
          </p>
        </div>
        
        {/* ArchiCassoAI Badge */}
        <div className="absolute top-4 right-4 bg-[#3b82f6] text-white px-3 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          ArchiCassoAI
        </div>
      </div>
    </motion.div>
  );
}

export default function GalleryCarousel() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let animationId: number;
    let lastTime = 0;
    const scrollSpeed = 0.2; // pixels per millisecond (slowed down)

    const animate = (currentTime: number) => {
      if (!isHovered) {
        const deltaTime = currentTime - lastTime;
        setScrollPosition(prev => {
          const newPosition = prev + scrollSpeed * deltaTime;
          // Reset position when we've scrolled through one complete set
          return newPosition >= galleryData.length * 320 ? 0 : newPosition;
        });
      }
      lastTime = currentTime;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isHovered]);

  return (
    <Section
      title="Gallery"
      subtitle="Rooms that ArchiCassoAI created"
      description="Explore our collection of stunning AI-generated interior designs"
      className="bg-white dark:bg-gray-900 overflow-hidden"
    >
      {/* Carousel Container */}
      <div 
        className="relative w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >



        
        {/* Scrolling Gallery */}
        <motion.div
          className="flex py-8"
          style={{
            transform: `translateX(-${scrollPosition}px)`,
          }}
          transition={{ 
            type: "tween", 
            ease: "linear",
            duration: 0.1
          }}
        >
          {duplicatedGalleryData.map((item, index) => (
            <GalleryCard key={`${item.id}-${index}`} item={item} index={index} />
          ))}
        </motion.div>
      </div>



      {/* Call to Action */}
      <motion.div 
        className="text-center mt-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        viewport={{ once: true }}
      >
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          Each design is uniquely generated by our AI, showcasing the endless possibilities 
          of interior transformation. Hover over any image to pause the carousel.
        </p>
      </motion.div>
    </Section>
  );
} 