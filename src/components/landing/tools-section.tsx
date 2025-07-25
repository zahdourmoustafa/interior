"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ImageComparisonSlider } from "@/components/redecorate/image-comparison-slider";
import Section from "@/components/section";
import Image from "next/image";

const toolsData = [
  {
    id: "room-makeover",
    title: "Redecorate Interior",
    description: "Give any room a complete style transformation in seconds. From modern minimalist to cozy farmhouse - explore endless design possibilities and find your perfect aesthetic match.",
    beforeImage: "/before3.jpeg",
    afterImage: "/after3.png",
    isVideo: false,
    ctaText: "Start Makeover",
    href: "/sign-in"
  },
  {
    id: "exterior-ai",
    title: "Redecorate Exterior ",
    description: "Redesign and visualize your exterior designs in seconds. Transform your building facades and outdoor spaces with AI-powered design suggestions.",
    beforeImage: "/before4.webp",
    afterImage: "/after4.webp",
    isVideo: false,
    ctaText: "Try Exterior AI",
    href: "/sign-in"
  },
  

  {
    id: "remove-object",
    title: "Object Remover",
    description: "Effortlessly eliminate unwanted furniture, clutter, or objects from any room. Clean up your space instantly and see the true potential of your interior design without distractions.",
    beforeImage: "/before.jpg",
    afterImage: "/after6.png",
    isVideo: false,
    ctaText: "Remove Objects",
    href: "/sign-in"
  },
  {
    id: "furnish-space",
    title: "Smart Furnishing",
    description: "Transform empty rooms into fully furnished, magazine-worthy spaces. Our AI analyzes your room's dimensions and style to suggest perfect furniture placement and decor combinations.",
    beforeImage: "/after5.webp",
    afterImage: "/before5.webp",
    isVideo: false,
    ctaText: "Furnish My Space",
    href: "/sign-in"
  },

];

const videoProductionData = [
  {
    id: 1,
    image: "/bedroom.webp",
    videoSrc: "/bedroom_video.mp4"
  },
  {
    id: 2,
    image: "/outside.webp",
    videoSrc: "/outside_video.mp4"
  },
  {
    id: 3,
    image: "/waterpool.webp",
    videoSrc: "/waterpool_video.mp4"
  }
];

function ToolCard({ tool, index }: { tool: typeof toolsData[0], index: number }) {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 30
      }}
      viewport={{ once: true }}
    >
      <div className="relative h-[400px] w-full overflow-hidden rounded-lg group">
        <ImageComparisonSlider 
          beforeImage={tool.beforeImage!} 
          afterImage={tool.afterImage!}
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900">
          {tool.title}{" "}
          <span className="border rounded-md p-1 text-sm bg-[#3b82f6] text-white border-[#3b82f6]">
            AI
          </span>
        </h3>
        <p className="text-base text-gray-600 leading-relaxed">
          {tool.description}
        </p>
        <div className="pt-2">
          <Button 
            size="lg" 
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
            onClick={() => window.location.href = tool.href}
          >
            {tool.ctaText}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function VideoProductionCard({ data, index }: { data: typeof videoProductionData[0], index: number }) {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 30
      }}
      viewport={{ once: true }}
    >
      <div className="relative">
        <Image
          src={data.image}
          alt="Original photo"
          width={400}
          height={300}
          className="h-64 w-full rounded-lg object-cover"
        />
        <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-md text-sm font-medium">
          Original photo
        </div>
      </div>
      <div className="relative">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-64 w-full rounded-lg object-cover"
        >
          <source src={data.videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-1 rounded-md text-sm font-medium">
          Video by ArchiCassoAI
        </div>
      </div>
    </motion.div>
  );
}

export default function ToolsSection() {
  return (
    <Section
      title="AI Tools"
      subtitle="AI render tools to level up your interior design workflow"
      description="12+ tools, 40+ styles to render or redesign in seconds"
      className="bg-gray-50 dark:bg-gray-900"
    >
      {/* Hero CTA Buttons */}
      <motion.div 
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      >
        <Button size="lg" className="bg-[#3b82f6] hover:bg-[#2563eb] text-white">
          Explore AI tools
        </Button>
        <Button size="lg" variant="outline" className="border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6] hover:text-white">
          Explore Gallery
        </Button>
      </motion.div>

      {/* Hero Image */}
      <motion.div 
        className="mb-20"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        viewport={{ once: true }}
      >
        <div className="relative w-full h-[600px] rounded-lg shadow-2xl overflow-hidden">
          <ImageComparisonSlider 
            beforeImage="/test.jpg" 
            afterImage="/after-test.png"
            className="w-full h-full"
          />
        </div>
      </motion.div>

      {/* Sketch to Image AI Content - Hero */}
      <motion.div 
        className="text-center mb-20"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Sketch to Image{" "}
          <span className="border rounded-md p-2 text-sm bg-[#3b82f6] text-white border-[#3b82f6]">
            AI
          </span>
        </h2>
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-3xl mx-auto">
          Transform your hand-drawn or digital sketches into stunning, fully rendered shots. Unlock the power of generating design variations from a single sketch.
        </p>
        
        <Button 
          size="lg" 
          className="bg-[#3b82f6] hover:bg-[#2563eb] text-white text-lg px-8 py-3 mb-8"
          onClick={() => window.location.href = "/sign-in"}
        >
          Try Sketch to Image
        </Button>
      </motion.div>

      {/* Tools Grid */}
      <div className="grid md:grid-cols-2 gap-16 mb-32">
        {toolsData.map((tool, index) => (
          <ToolCard key={tool.id} tool={tool} index={index} />
        ))}
      </div>

             {/* Redecorate Your Room AI Content - End of Tools */}
               <motion.div 
          className="text-center mb-32"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Generate Video From Images <span className="border rounded-md p-2 text-sm bg-[#3b82f6] text-white border-[#3b82f6]">AI</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-4xl mx-auto">
                        Transform any static image into a stunning 10-second video with one click in just 2 seconds. Our AI analyzes your image and creates smooth, cinematic motion that brings your designs to life. Perfect for showcasing architectural projects, interior transformations, or any space you want to animate with professional-quality results.
          </p>
          <Button 
            size="lg" 
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white text-lg px-8 py-3 mb-8"
            onClick={() => window.location.href = "/sign-in"}
          >
            Generate Video Now
          </Button>
                 {/* Before/After Slider */}
         <div>
           <div className="relative w-full h-[600px] rounded-lg shadow-2xl overflow-hidden">
             <ImageComparisonSlider 
               beforeImage="/vid-before.png" 
               afterImage="/thumb.mp4"
               className="w-full h-full"
             />
           </div>
         </div>
      </motion.div>

      {/* Video Production Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
            Video production
          </h2>
          <p className="text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Transform your photos into animated videos in just a few seconds
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {videoProductionData.map((data, index) => (
            <VideoProductionCard key={data.id} data={data} index={index} />
          ))}
        </div>
      </motion.div>
    </Section>
  );
} 