'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Video, ZoomIn, ZoomOut, RotateCcw, RotateCw, MoveHorizontal, MoveVertical, Plane } from 'lucide-react';

interface VideoEffectsControlSidebarProps {
  onGenerate: (effect: string) => void;
  isGenerating: boolean;
  selectedEffect: string | null;
  onEffectSelect: (effect: string) => void;
}

type VideoEffect = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'zoom' | 'rotation' | 'pan' | 'tilt' | 'movement';
};

const videoEffects: VideoEffect[] = [
  // Zoom Effects
  {
    id: 'zoomIn',
    name: 'Zoom In',
    description: 'Smooth zoom-in from wide view to close-up details',
    icon: <ZoomIn className="h-5 w-5" />,
    category: 'zoom'
  },
  {
    id: 'zoomOut',
    name: 'Zoom Out',
    description: 'Smooth zoom-out from close-up to reveal full room',
    icon: <ZoomOut className="h-5 w-5" />,
    category: 'zoom'
  },
  
  // Movement Effects
  {
    id: 'flythrough',
    name: 'Flythrough',
    description: 'Cinematic flight through the interior space',
    icon: <Plane className="h-5 w-5" />,
    category: 'movement'
  },
  
  // Rotation Effects
  {
    id: 'rotateLeft',
    name: 'Rotate Left',
    description: 'Counterclockwise rotation around room center',
    icon: <RotateCcw className="h-5 w-5" />,
    category: 'rotation'
  },
  {
    id: 'rotateRight',
    name: 'Rotate Right',
    description: 'Clockwise rotation around room center',
    icon: <RotateCw className="h-5 w-5" />,
    category: 'rotation'
  },
  
  // Pan Effects
  {
    id: 'panLeft',
    name: 'Pan Left',
    description: 'Horizontal camera movement from right to left',
    icon: <MoveHorizontal className="h-5 w-5 rotate-180" />,
    category: 'pan'
  },
  {
    id: 'panRight',
    name: 'Pan Right',
    description: 'Horizontal camera movement from left to right',
    icon: <MoveHorizontal className="h-5 w-5" />,
    category: 'pan'
  },
  
  // Tilt Effects
  {
    id: 'tiltUp',
    name: 'Tilt Up',
    description: 'Vertical camera movement from down to up',
    icon: <MoveVertical className="h-5 w-5 rotate-180" />,
    category: 'tilt'
  },
  {
    id: 'tiltDown',
    name: 'Tilt Down',
    description: 'Vertical camera movement from up to down',
    icon: <MoveVertical className="h-5 w-5" />,
    category: 'tilt'
  }
];

const categoryColors = {
  zoom: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
  rotation: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
  pan: 'border-green-200 bg-green-50 hover:bg-green-100',
  tilt: 'border-orange-200 bg-orange-50 hover:bg-orange-100',
  movement: 'border-red-200 bg-red-50 hover:bg-red-100'
};

const categoryNames = {
  zoom: 'Zoom Effects',
  rotation: 'Rotation Effects',
  pan: 'Pan Effects',
  tilt: 'Tilt Effects',
  movement: 'Movement Effects'
};

export function VideoEffectsControlSidebar({
  onGenerate,
  isGenerating,
  selectedEffect,
  onEffectSelect,
}: VideoEffectsControlSidebarProps) {

  const handleGenerate = () => {
    if (selectedEffect) {
      onGenerate(selectedEffect);
    }
  };

  const groupedEffects = videoEffects.reduce((acc, effect) => {
    if (!acc[effect.category]) {
      acc[effect.category] = [];
    }
    acc[effect.category].push(effect);
    return acc;
  }, {} as Record<string, VideoEffect[]>);

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-blue-600" />
            Video Effects
          </CardTitle>
          <CardDescription>
            Choose a camera movement effect for your video generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Effects Grid */}
          <div className="space-y-4">
            {Object.entries(groupedEffects).map(([category, effects]) => (
              <div key={category}>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  {categoryNames[category as keyof typeof categoryNames]}
                  <span className="text-xs text-gray-500">({effects.length})</span>
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {effects.map((effect) => (
                    <button
                      key={effect.id}
                      onClick={() => onEffectSelect(effect.id)}
                      disabled={isGenerating}
                      className={`
                        p-3 rounded-lg border-2 text-left transition-all duration-200
                        ${selectedEffect === effect.id 
                          ? 'border-blue-500 bg-blue-100 shadow-md' 
                          : `${categoryColors[effect.category]} border-dashed`
                        }
                        ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          p-2 rounded-md 
                          ${selectedEffect === effect.id 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white text-gray-600'
                          }
                        `}>
                          {effect.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 text-sm">
                            {effect.name}
                          </h5>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            {effect.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Effect Preview */}
          {selectedEffect && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Selected Effect</h4>
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-500 text-white rounded">
                  {videoEffects.find(e => e.id === selectedEffect)?.icon}
                </div>
                <span className="text-sm font-medium text-blue-900">
                  {videoEffects.find(e => e.id === selectedEffect)?.name}
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                {videoEffects.find(e => e.id === selectedEffect)?.description}
              </p>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedEffect}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Video className="mr-2 h-4 w-4" />
                Generate Video
              </>
            )}
          </Button>

          {/* Info Section */}
          <div className="text-xs text-gray-500 space-y-2 p-3 bg-gray-50 rounded-lg">
            <p><strong>Duration:</strong> 5 seconds per video</p>
            <p><strong>Quality:</strong> HD 1080p output</p>
            <p><strong>Processing:</strong> 60-120 seconds</p>
            <p><strong>AI Model:</strong> Luma AI Dream Machine</p>
          </div>

          {/* Tips */}
          <div className="text-xs text-gray-600 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="font-medium text-yellow-800 mb-1">💡 Pro Tips:</p>
            <ul className="space-y-1 text-yellow-700">
              <li>• Use high-quality images for best results</li>
              <li>• Flythrough works great for spacious rooms</li>
              <li>• Zoom effects highlight specific details</li>
              <li>• Rotation shows complete room layout</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
