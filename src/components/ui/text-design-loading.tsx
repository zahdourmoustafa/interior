'use client';

import { Loader2, Sparkles, Palette } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

interface TextDesignLoadingProps {
  prompt?: string;
}

export function TextDesignLoading({ prompt }: TextDesignLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = useMemo(() => [
    { icon: Sparkles, text: "Analyzing prompt...", duration: 3000 },
    { icon: Palette, text: "Creating design...", duration: 5000 },
    { icon: Loader2, text: "Enhancing quality...", duration: 0 }, // 0 means it stays until completion
  ], []);

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

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-blue-900/90 flex items-center justify-center rounded-md backdrop-blur-sm">
      <div className="text-center text-white max-w-xs px-4">
        {/* Animated Icon */}
        <div className="relative mb-4">
          <CurrentIcon 
            className={`h-12 w-12 mx-auto ${
              currentStep === 2 ? 'animate-spin' : 'animate-pulse'
            } text-white`} 
          />
          {/* Glow effect */}
          <div className="absolute inset-0 h-12 w-12 mx-auto bg-white/20 rounded-full blur-xl animate-pulse" />
        </div>

        {/* Step Text */}
        <p className="font-semibold text-lg mb-2 animate-fade-in">
          {steps[currentStep].text}
        </p>

        {/* Prompt Preview */}
        {prompt && (
          <p className="text-sm text-white/80 italic truncate">
            &ldquo;{prompt.length > 40 ? prompt.substring(0, 40) + '...' : prompt}&rdquo;
          </p>
        )}

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2 mt-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index <= currentStep 
                  ? 'bg-white scale-110' 
                  : 'bg-white/30 scale-100'
              }`}
            />
          ))}
        </div>

        {/* Estimated Time */}
        <p className="text-xs text-white/60 mt-3">
          This may take 60-120 seconds
        </p>
      </div>
    </div>
  );
}
