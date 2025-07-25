"use client";

import Features from "@/components/features-horizontal";
import Section from "@/components/section";
import { Palette, Camera, Wand2, Settings } from "lucide-react";

const data = [
  {
    id: 1,
    title: "AI-Powered Design Engine",
    content: "Transform your space with intelligent design recommendations.",
    image: "/after2.png",
    icon: <Wand2 className="h-6 w-6 text-primary" />,
  },
  {
    id: 2,
    title: "Style Matching Technology",
    content: "Find your perfect aesthetic with our advanced style analysis.",
    image: "/after4.webp",
    icon: <Palette className="h-6 w-6 text-primary" />,
  },
  {
    id: 3,
    title: "Virtual Room Staging",
    content: "See your space transformed before making any changes.",
    image: "/vintage.webp",
    icon: <Camera className="h-6 w-6 text-primary" />,
  },
  {
    id: 4,
    title: "Customizable Solutions",
    content: "Tailor every design element to your personal preferences.",
    image: "/tropical.webp",
    icon: <Settings className="h-6 w-6 text-primary" />,
  },
];

export default function FeaturesSection() {
  return (
    <Section title="Features" subtitle="Advanced Tools for Perfect Interior Design">
      <Features collapseDelay={5000} linePosition="bottom" data={data} />
    </Section>
  );
} 