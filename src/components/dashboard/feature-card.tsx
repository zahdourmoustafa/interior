'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  color: string;
  gradient?: string;
  comingSoon?: boolean;
}

export function FeatureCard({
  title,
  description,
  icon,
  href,
  color,
  gradient,
  comingSoon = false,
}: FeatureCardProps) {
  return (
    <Link href={href}>
      <Card 
        className={cn(
          "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
          comingSoon && "opacity-60 cursor-not-allowed"
        )}
      >
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300",
          gradient || `${color} to-transparent`
        )} />
        
        <CardHeader className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className={cn(
                "p-3 rounded-lg transition-transform duration-300 group-hover:scale-110",
                color
              )}>
                {icon}
              </div>
              <div>
                <CardTitle className="text-xl mb-1">{title}</CardTitle>
                <CardDescription className="text-sm">
                  {description}
                </CardDescription>
              </div>
            </div>
            
            {comingSoon && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                Coming Soon
              </span>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Click to start creating
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="group-hover:bg-primary/10 transition-colors"
              disabled={comingSoon}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}