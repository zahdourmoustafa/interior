"use client";

import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background with og.png */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("/og.png")' }}
      />
      
      {/* Geometric patterns overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute bottom-0 left-0 w-64 h-64 border border-black/20 transform rotate-45 translate-x-[-50%] translate-y-[50%]" />
        <div className="absolute bottom-0 right-0 w-64 h-64 border border-black/20 transform -rotate-45 translate-x-[50%] translate-y-[50%]" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 border border-black/20 transform rotate-12" />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 border border-black/20 transform -rotate-12" />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          {/* Trustpilot Rating */}
          

          {/* Tagline */}
         

          {/* Main Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold text-black mb-4 leading-tight"
          >
            Bring Your Home To Life
            <br />
            <span className="text-black">With </span>
            <span className="text-blue-400">ArchiCassoAI.</span>
          </motion.h2>

          {/* Descriptive Text */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-lg text-black/90 max-w-2xl mx-auto mb-8"
          >
            Use ArchiCassoAI to redesign any home in seconds: AI decoration, AI Interior Design, Exterior AI, Landscaping AI, House AI.
          </motion.p>
          
          {/* Call to Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <Link
              href="/sign-in"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 text-lg font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              )}
            >
              Start Today
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 