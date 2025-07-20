'use client';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

const styles = [
  { id: 'modern', name: 'Modern', icon: '🏢', color: 'bg-blue-500' },
  { id: 'summer', name: 'Summer', icon: '🌞', color: 'bg-yellow-500' },
  { id: 'professional', name: 'Professional', icon: '💼', color: 'bg-gray-500' },
  { id: 'tropical', name: 'Tropical', icon: '🌴', color: 'bg-green-500' },
  { id: 'coastal', name: 'Coastal', icon: '🏖️', color: 'bg-cyan-500' },
  { id: 'vintage', name: 'Vintage', icon: '🏛️', color: 'bg-amber-500' },
  { id: 'industrial', name: 'Industrial', icon: '🏭', color: 'bg-slate-500' },
  { id: 'neoclassic', name: 'Neoclassic', icon: '🏛️', color: 'bg-purple-500' },
  { id: 'tribal', name: 'Tribal', icon: '🏺', color: 'bg-orange-500' },
];

interface StyleSelectorProps {
  selectedStyles: string[];
  onChange: (styles: string[]) => void;
}

export function StyleSelector({ selectedStyles, onChange }: StyleSelectorProps) {
  const toggleStyle = (styleId: string) => {
    if (selectedStyles.includes(styleId)) {
      onChange(selectedStyles.filter(id => id !== styleId));
    } else {
      onChange([...selectedStyles, styleId]);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {styles.map((style) => {
        const isSelected = selectedStyles.includes(style.id);
        return (
          <Card
            key={style.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              isSelected && 'ring-2 ring-primary'
            )}
            onClick={() => toggleStyle(style.id)}
          >
            <div className="p-4 text-center space-y-2">
              <div className="text-2xl">{style.icon}</div>
              <div className="text-sm font-medium">{style.name}</div>
              {isSelected && (
                <div className="absolute top-1 right-1">
                  <div className="bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-3 w-3" />
                  </div>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}