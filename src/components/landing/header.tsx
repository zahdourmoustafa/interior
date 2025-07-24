"use client";

import GlassNavigation, { interiorAIPreset } from "@/components/ui/glass-navigation";

export default function Header() {
  return (
    <GlassNavigation
      {...interiorAIPreset}
      position="top"
      glassIntensity="medium"
      animationDelay={0.5}
      enableHover={true}
      showLogo={true}
      className="w-auto"
    />
  );
} 