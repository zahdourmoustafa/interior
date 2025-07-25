"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { siteConfig, type PricingPlan } from "@/lib/config";
import SubscribeButton from "./subscribe-button";

export default function PricingSection() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          {/* Toggle Buttons */}
          <motion.div 
            className="flex items-center justify-center gap-0 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                "px-8 py-3 rounded-l-full text-sm font-medium transition-all duration-300",
                !isYearly 
                  ? "bg-[#3b82f6] text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                "px-8 py-3 rounded-r-full text-sm font-medium transition-all duration-300 relative",
                isYearly 
                  ? "bg-[#8b5cf6] text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <span className="flex items-center gap-1">
                🔥 2 Months Free
              </span>
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {siteConfig.pricing.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={cn(
                "relative bg-white rounded-3xl p-8 transition-all duration-300",
                plan.isPopular 
                  ? "border-2 border-[#3b82f6] shadow-xl scale-105" 
                  : "border border-gray-200 shadow-lg hover:shadow-xl"
              )}
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
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              {plan.isPopular && (
                <motion.div 
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <span className="bg-[#3b82f6] text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1">
                    🔥 Most Popular
                  </span>
                </motion.div>
              )}
              
              <motion.div 
                className="text-left mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-gray-400 line-through text-lg">
                      {isYearly ? ((plan as PricingPlan).yearlyOriginalPrice || plan.originalPrice) : plan.originalPrice}
                    </span>
                    <span className="text-4xl font-bold text-gray-900">
                      {isYearly ? plan.yearlyPrice : plan.price}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    per month, billed {isYearly ? "yearly" : "monthly"}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="text-lg font-bold text-gray-900 mb-2">{plan.credits}</div>
                  <div className="bg-[#8b5cf6] text-white text-sm px-3 py-1 rounded-full inline-block">
                    2X credits for limited time
                  </div>
                </div>
              </motion.div>

              <motion.ul 
                className="space-y-4 mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                viewport={{ once: true }}
              >
                {plan.features.map((feature, featureIndex) => (
                  <motion.li 
                    key={feature} 
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.4 + index * 0.1 + featureIndex * 0.05 
                    }}
                    viewport={{ once: true }}
                  >
                    <Check className="h-5 w-5 text-[#22c55e] flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                viewport={{ once: true }}
              >
                <SubscribeButton 
                  plan={plan}
                  isYearly={isYearly}
                  className={cn(
                    "w-full py-3 text-sm font-medium rounded-xl transition-all duration-200",
                    plan.isPopular
                      ? "bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                      : "bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                  )}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 