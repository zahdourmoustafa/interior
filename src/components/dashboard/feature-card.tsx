"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  backgroundImage: string;
  
  badgeText?: string;
  badgeVariant?: "new" | "pro";
  minutes?: number;
  generation?: number;
}

export function FeatureCard({
  title,
  description,
  href,
  backgroundImage,
  
  badgeText,
  badgeVariant,
  minutes = 1,
  generation = 1,
}: FeatureCardProps) {
  return (
    <Card className="group overflow-hidden bg-white rounded-xl shadow-sm h-full flex flex-col border-0">
      {/* Top Image Section */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={backgroundImage}
          alt={title}
          fill
          className="object-cover"
        />

        {/* Title Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white drop-shadow-md">
              {title} <span className="ml-1">| AI</span>
            </h3>
          </div>
        </div>

        {/* Badge */}
        {badgeVariant && (
          <div className="absolute top-3 right-3">
            <Badge 
              className={`text-xs font-medium px-2 py-1 uppercase ${
                badgeVariant === "new" 
                  ? "bg-[#3b82f6] text-white" 
                  : "bg-[#E74C3C] text-white"
              }`}
            >
              {badgeText || badgeVariant}
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-grow">
        <p className="text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Stats Section */}
      <div className="px-4 py-2 text-xs text-gray-500 flex items-center">
        <span>{minutes} minute(s)</span>
        <span className="mx-1">•</span>
        <span>{generation} generation</span>
      </div>

      {/* Launch Button */}
      <div className="p-4 pt-0">
        <Link href={href}>
          <Button className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-lg text-sm font-medium h-8">
            Launch Tool
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
