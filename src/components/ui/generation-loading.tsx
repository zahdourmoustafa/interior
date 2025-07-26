'use client';

import { Loader2, Sparkles, Palette, Home, Building, PenTool, Sofa, Eraser, Video, Type } from 'lucide-react';
import { useState, useEffect } from 'react';

interface GenerationLoadingProps {
  feature: 'interior' | 'exterior' | 'sketch' | 'furnish' | 'remove' | 'video' | 'text';
  prompt?: string;
  className?: string;
}

export function GenerationLoading({ feature, prompt, className = "" }: GenerationLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Feature-specific configurations
  const featureConfig = {
    interior: {
      icon: Home,
      name: 'Interior Design',
      color: 'from-blue-900/90 to-purple-900/90',
      steps: [
        { icon: Sparkles, text: "Analyzing room layout...", duration: 3000 },
        { icon: Palette, text: "Designing interior...", duration: 5000 },
        { icon: Loader2, text: "Enhancing quality...", duration: 0 },
      ]
    },
    exterior: {
      icon: Building,
      name: 'Exterior Design',
      color: 'from-green-900/90 to-blue-900/90',
      steps: [
        { icon: Sparkles, text: "Analyzing structure...", duration: 3000 },
        { icon: Palette, text: "Designing exterior...", duration: 5000 },
        { icon: Loader2, text: "Enhancing quality...", duration: 0 },
      ]
    },
    sketch: {
      icon: PenTool,
      name: 'Sketch to Reality',
      color: 'from-orange-900/90 to-red-900/90',
      steps: [
        { icon: Sparkles, text: "Analyzing sketch...", duration: 3000 },
        { icon: Palette, text: "Creating realistic image...", duration: 5000 },
        { icon: Loader2, text: "Enhancing quality...", duration: 0 },
      ]
    },
    furnish: {
      icon: Sofa,
      name: 'Furnish Space',
      color: 'from-amber-900/90 to-orange-900/90',
      steps: [
        { icon: Sparkles, text: "Analyzing empty space...", duration: 3000 },
        { icon: Palette, text: "Adding furniture...", duration: 5000 },
        { icon: Loader2, text: "Enhancing quality...", duration: 0 },
      ]
    },
    remove: {
      icon: Eraser,
      name: 'Remove Object',
      color: 'from-red-900/90 to-pink-900/90',
      steps: [
        { icon: Sparkles, text: "Identifying object...", duration: 3000 },
        { icon: Palette, text: "Removing and filling...", duration: 5000 },
        { icon: Loader2, text: "Enhancing quality...", duration: 0 },
      ]
    },
    video: {
      icon: Video,
      name: 'Generate Video',
      color: 'from-purple-900/90 to-indigo-900/90',
      steps: [
        { icon: Sparkles, text: "Analyzing frames...", duration: 4000 },
        { icon: Palette, text: "Creating video...", duration: 8000 },
        { icon: Loader2, text: "Processing final video...", duration: 0 },
      ]
    },
    text: {
      icon: Type,
      name: 'Text to Design',
      color: 'from-teal-900/90 to-cyan-900/90',
      steps: [
        { icon: Sparkles, text: "Understanding prompt...", duration: 3000 },
        { icon: Palette, text: "Creating design...", duration: 5000 },
        { icon: Loader2, text: "Enhancing quality...", duration: 0 },
      ]
    }
  };

  const config = featureConfig[feature];
  const steps = config.steps;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (currentStep < steps.length - 1) {
      timeoutId = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, steps[currentStep].duration);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentStep, steps]);

  const CurrentStepIcon = steps[currentStep].icon;
  const FeatureIcon = config.icon;

  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${config.color} flex items-center justify-center rounded-md backdrop-blur-sm ${className}`}>
      <div className="text-center text-white max-w-xs px-4">
        {/* Feature Icon with Glow */}
        <div className="relative mb-3">
          <FeatureIcon className="h-8 w-8 mx-auto text-white/80" />
          <div className="absolute inset-0 h-8 w-8 mx-auto bg-white/10 rounded-full blur-lg" />
        </div>

        {/* Feature Name */}
        <p className="text-xs font-medium text-white/90 mb-4 uppercase tracking-wide">
          {config.name}
        </p>

        {/* Animated Step Icon */}
        <div className="relative mb-4">
          <CurrentStepIcon 
            className={`h-12 w-12 mx-auto ${
              currentStep === steps.length - 1 ? 'animate-spin' : 'animate-pulse'
            } text-white drop-shadow-lg`} 
          />
          {/* Glow effect */}
          <div className="absolute inset-0 h-12 w-12 mx-auto bg-white/20 rounded-full blur-xl animate-pulse" />
        </div>

        {/* Step Text */}
        <p className="font-semibold text-lg mb-3 animate-fade-in">
          {steps[currentStep].text}
        </p>

        {/* Prompt Preview */}
        {prompt && (
          <div className="bg-white/10 rounded-lg p-3 mb-4 backdrop-blur-sm">
            <p className="text-sm text-white/90 italic">
              &ldquo;{prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt}&rdquo;
            </p>
          </div>
        )}

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2 mb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                index <= currentStep 
                  ? 'bg-white scale-110 shadow-lg' 
                  : 'bg-white/30 scale-100'
              }`}
            />
          ))}
        </div>

        {/* Estimated Time */}
        <p className="text-xs text-white/70">
          {feature === 'video' ? 'This may take 2-3 minutes' : 'This may take 60-120 seconds'}
        </p>

        {/* Subtle Animation Border */}
        <div className="absolute inset-0 rounded-md border border-white/20 animate-pulse" />
      </div>
    </div>
  );
}
