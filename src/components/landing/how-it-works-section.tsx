import Features from "@/components/features-vertical";
import Section from "@/components/section";
import { Upload, Sparkles, Zap } from "lucide-react";

const data = [
  {
    id: 1,
    title: "1. Upload Your Space",
    content:
      "Simply upload photos of your room to our secure platform. We support various image formats and automatically analyze your space dimensions and current layout.",
    image: "/before2.jpeg",
    icon: <Upload className="w-6 h-6 text-primary" />,
  },
  {
    id: 2,
    title: "2. Choose Your Style",
    content:
      "Our advanced AI algorithms analyze your preferences and suggest design styles that match your taste. From modern to vintage, we have options for every aesthetic.",
    image: "/coastal.webp",
    icon: <Zap className="w-6 h-6 text-primary" />,
  },
  {
    id: 3,
    title: "3. Get Your Design",
    content:
      "Receive stunning, photorealistic designs and 3D visualizations of your transformed space. Use these designs to make confident decorating decisions.",
    image: "/after2.png",
    icon: <Sparkles className="w-6 h-6 text-primary" />,
  },
];

export default function HowItWorksSection() {
  return (
    <Section title="How it works" subtitle="Just 3 steps to transform your space">
      <Features data={data} />
    </Section>
  );
} 