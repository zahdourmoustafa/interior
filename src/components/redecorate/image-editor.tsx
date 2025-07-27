"use client";

import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface ImageEditorProps {
  image: string | null;
  onMaskChange: (mask: string) => void;
  brushSize: number;
  brushOpacity: number;
  isDrawingMode: boolean;
}

export interface ImageEditorRef {
  clearMask: () => void;
}

export const ImageEditor = forwardRef<ImageEditorRef, ImageEditorProps>(({
  image,
  onMaskChange,
  brushSize,
  brushOpacity,
  isDrawingMode,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  // Expose clearMask function through ref
  useImperativeHandle(ref, () => ({
    clearMask: () => {
      const maskCanvas = maskCanvasRef.current;
      const maskContext = maskCanvas?.getContext("2d");

      if (maskContext && maskCanvas) {
        maskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        setupMaskContext(maskContext);
        onMaskChange("");
      }
    }
  }));

  // Initialize canvases when image loads
  useEffect(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const context = canvas?.getContext("2d");
    const maskContext = maskCanvas?.getContext("2d");
    const container = containerRef.current;

    if (context && maskContext && image && container) {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        if (canvas && maskCanvas) {
          // Set canvas dimensions based on image
          const maxWidth = container.offsetWidth;
          const maxHeight = container.offsetHeight;

          let width = img.width;
          let height = img.height;

          // Scale down if needed
          if (width > maxWidth) {
            const ratio = maxWidth / width;
            width = maxWidth;
            height = height * ratio;
          }

          if (height > maxHeight) {
            const ratio = maxHeight / height;
            height = maxHeight;
            width = width * ratio;
          }

          canvas.width = width;
          canvas.height = height;
          maskCanvas.width = width;
          maskCanvas.height = height;

          setCanvasSize({ width, height });

          // Draw image on main canvas
          context.drawImage(img, 0, 0, width, height);

          // Clear mask canvas and set up drawing context
          maskContext.clearRect(0, 0, width, height);
          setupMaskContext(maskContext);

          imageRef.current = img;
        }
      };
    }
  }, [image]);

  // Set up mask context with proper settings
  const setupMaskContext = (context: CanvasRenderingContext2D) => {
    context.lineCap = "round";
    context.lineJoin = "round";
    context.globalCompositeOperation = "source-over";
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const drawLine = (context: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }) => {
    context.strokeStyle = `rgba(255, 0, 0, ${brushOpacity})`;
    context.lineWidth = brushSize;
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
  };

  const drawDot = (context: CanvasRenderingContext2D, point: { x: number; y: number }) => {
    context.fillStyle = `rgba(255, 0, 0, ${brushOpacity})`;
    context.beginPath();
    context.arc(point.x, point.y, brushSize / 2, 0, Math.PI * 2);
    context.fill();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    
    const maskCanvas = maskCanvasRef.current;
    const maskContext = maskCanvas?.getContext("2d");
    
    if (maskContext) {
      const point = getCanvasCoordinates(e);
      setIsDrawing(true);
      setLastPoint(point);
      
      // Draw initial dot
      drawDot(maskContext, point);
      
      // Generate mask data immediately
      generateMaskData();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawingMode || !lastPoint) return;

    const maskCanvas = maskCanvasRef.current;
    const maskContext = maskCanvas?.getContext("2d");

    if (maskContext) {
      const currentPoint = getCanvasCoordinates(e);
      
      // Draw line from last point to current point
      drawLine(maskContext, lastPoint, currentPoint);
      
      // Update last point
      setLastPoint(currentPoint);
      
      // Generate mask data
      generateMaskData();
    }
  };

  const stopDrawing = () => {
    if (!isDrawingMode) return;
    setIsDrawing(false);
    setLastPoint(null);
    
    // Generate final mask data
    generateMaskData();
  };

  const generateMaskData = () => {
    const maskCanvas = maskCanvasRef.current;
    if (maskCanvas) {
      const mask = maskCanvas.toDataURL("image/png");
      onMaskChange(mask);
    }
  };

  const handleDownload = async () => {
    if (!image) return;
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `interior-design-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download image");
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full h-full">
      <div
        className="relative mb-4 group"
        style={{ width: canvasSize.width, height: canvasSize.height }}
      >
        {/* Main image canvas */}
        <canvas ref={canvasRef} className="absolute top-0 left-0 z-0" />

        {/* Mask drawing canvas */}
        <canvas
          ref={maskCanvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className={`absolute top-0 left-0 z-10 ${isDrawingMode ? 'cursor-crosshair' : 'cursor-default'}`}
        />
        
        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isDrawingMode && (
        <div className="text-sm text-gray-600 mt-2">
          Click and drag to paint over the object you want to remove
        </div>
      )}
    </div>
  );
});

ImageEditor.displayName = 'ImageEditor';
