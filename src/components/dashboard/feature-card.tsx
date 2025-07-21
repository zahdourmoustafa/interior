"use client";

import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  backgroundImage: string;
  features: string[];
}

export function FeatureCard({
  title,
  description,
  icon,
  href,
  backgroundImage,
  features,
}: FeatureCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg bg-white border border-gray-200 rounded-2xl h-full">
      {/* Top Image Section */}
      <div className="relative h-48 overflow-hidden rounded-t-2xl">
        <Image
          src={backgroundImage}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Available Badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 text-xs font-medium px-2 py-1">
            Available
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col justify-between h-[calc(100%-12rem)]">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
            {description}
          </p>

          {/* Feature Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {features.slice(0, 3).map((feature, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-gray-100 text-gray-600 hover:bg-gray-100 text-xs font-normal px-2 py-1"
              >
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        {/* Launch Button */}
        <div className="mt-auto">
          <Link href={href} className="block">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
              Launch App
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
