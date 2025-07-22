"use client";

import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface ImageEditorProps {
  image: string | null;
  onMaskChange: (mask: string) => void;
  brushSize: number;
  brushOpacity: number;
  clearMask: () => void;
  isDrawingMode: boolean;
}

export function ImageEditor({
  image,
  onMaskChange,
  brushSize,
  brushOpacity,
  clearMask,
  isDrawingMode,
}: ImageEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

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

          // Clear mask canvas
          maskContext.clearRect(0, 0, width, height);

          imageRef.current = img;
        }
      };
    }
  }, [image]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    setIsDrawing(true);
    const maskCanvas = maskCanvasRef.current;
    const maskContext = maskCanvas?.getContext("2d");

    if (maskContext) {
      const { x, y } = getCanvasCoordinates(e);
      maskContext.beginPath();
      maskContext.moveTo(x, y);

      // Draw a dot at the starting point
      maskContext.fillStyle = `rgba(255, 0, 0, ${brushOpacity})`;
      maskContext.beginPath();
      maskContext.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      maskContext.fill();

      // Generate mask data
      generateMaskData();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawingMode) return;

    const maskCanvas = maskCanvasRef.current;
    const maskContext = maskCanvas?.getContext("2d");

    if (maskContext) {
      const { x, y } = getCanvasCoordinates(e);

      // Draw line
      maskContext.lineTo(x, y);
      maskContext.strokeStyle = `rgba(255, 0, 0, ${brushOpacity})`;
      maskContext.lineWidth = brushSize;
      maskContext.lineCap = "round";
      maskContext.lineJoin = "round";
      maskContext.stroke();

      // Generate mask data
      generateMaskData();
    }
  };

  const stopDrawing = () => {
    if (!isDrawingMode) return;
    setIsDrawing(false);
    generateMaskData();
  };

  const generateMaskData = () => {
    const maskCanvas = maskCanvasRef.current;
    if (maskCanvas) {
      const mask = maskCanvas.toDataURL("image/png");
      onMaskChange(mask);
    }
  };

  useEffect(() => {
    const maskCanvas = maskCanvasRef.current;
    const maskContext = maskCanvas?.getContext("2d");

    if (maskContext && maskCanvas) {
      maskContext.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      onMaskChange("");
    }
  }, [clearMask, onMaskChange]);

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
    </div>
  );
}
