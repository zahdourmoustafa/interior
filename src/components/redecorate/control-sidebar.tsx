"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";



// Room Type Icons as SVG components
const LivingRoomIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="w-6 h-6"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <path d="M6 8h4v4H6zM14 8h4v4h-4z" />
  </svg>
);

const KitchenIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="w-6 h-6"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <rect x="6" y="6" width="3" height="3" />
    <rect x="15" y="6" width="3" height="3" />
    <rect x="6" y="15" width="12" height="3" />
  </svg>
);

const BedroomIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="w-6 h-6"
  >
    <path d="M3 12h18v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z" />
    <path d="M3 12V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const KidsRoomIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="w-6 h-6"
  >
    <rect x="3" y="12" width="18" height="8" rx="2" />
    <path d="M7 12V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
    <circle cx="8" cy="8" r="1" />
    <circle cx="16" cy="8" r="1" />
    <path d="M12 4v4" />
  </svg>
);

const DiningRoomIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="w-6 h-6"
  >
    <circle cx="12" cy="12" r="8" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
    <path d="M16 8l-8 8" />
    <path d="M8 8l8 8" />
  </svg>
);

const HomeOfficeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="w-6 h-6"
  >
    <rect x="2" y="4" width="20" height="12" rx="2" />
    <rect x="6" y="8" width="12" height="4" />
    <path d="M6 20h12" />
    <path d="M10 16v4" />
    <path d="M14 16v4" />
  </svg>
);

const GameRoomIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="w-6 h-6"
  >
    <path d="M2 8a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <circle cx="8" cy="12" r="2" />
    <path d="M16 10l2 2-2 2" />
    <path d="M18 12h-2" />
  </svg>
);

const BathRoomIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="w-6 h-6"
  >
    <path d="M2 12h20" />
    <path d="M2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6" />
    <path d="M7 12V8a5 5 0 0 1 10 0v4" />
    <circle cx="12" cy="8" r="1" />
  </svg>
);

const roomTypes = [
  { id: "living-room", name: "Living Room", icon: LivingRoomIcon },
  { id: "kitchen", name: "Kitchen", icon: KitchenIcon },
  { id: "bedroom", name: "Bedroom", icon: BedroomIcon },
  { id: "kids-room", name: "Kids Room", icon: KidsRoomIcon },
  { id: "dining-room", name: "Dining Room", icon: DiningRoomIcon },
  { id: "home-office", name: "Home Office", icon: HomeOfficeIcon },
  { id: "game-room", name: "Game Room", icon: GameRoomIcon },
  { id: "bath-room", name: "Bath Room", icon: BathRoomIcon },
];

interface ControlSidebarProps {
  title?: string;
  description?: string;
  selectedRoomType?: string | null;
  onRoomTypeSelect?: (roomType: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  showRoomType?: boolean;
  showDesignStyle?: boolean;
  
  prompt?: string;
  onPromptChange?: (prompt: string) => void;
  promptPlaceholder?: string;
  onReset?: () => void;
  isResettable?: boolean;
  generateButtonText?: string;
  generateButtonDisabled?: boolean;
  isDrawingMode?: boolean;
  onDrawingModeChange?: (isDrawingMode: boolean) => void;
}

export function ControlSidebar({
  title = "Room Type",
  description = "Select the room type for your design",
  selectedRoomType,
  onRoomTypeSelect,
  onGenerate,
  isGenerating,
  showRoomType = true,
  
  prompt,
  onPromptChange,
  promptPlaceholder = "Describe your design...",
  onReset,
  isResettable,
  generateButtonText = "Generate",
  generateButtonDisabled,
  isDrawingMode,
  onDrawingModeChange,
  children,
}: ControlSidebarProps & { children?: React.ReactNode }) {
  const [expandedSections, setExpandedSections] = useState({
    roomType: true,
    prompt: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="w-80 bg-white border-l flex flex-col h-full overflow-y-auto">
      {/* Title and Description */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {/* Draw Mode Toggle */}
      {onDrawingModeChange !== undefined && (
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <Label htmlFor="drawing-mode-switch" className="font-medium text-gray-900">
              Draw Mode
            </Label>
            <Switch
              id="drawing-mode-switch"
              checked={isDrawingMode}
              onCheckedChange={onDrawingModeChange}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Turn on to brush on the image.
          </p>
        </div>
      )}

      {/* Children (for Brush Controls etc) */}
      {children}

      {/* Prompt Input Section */}
      {prompt !== undefined && onPromptChange && (
        <div className="border-b">
          <button
            onClick={() => toggleSection("prompt")}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="font-medium text-gray-900">Description</span>
            {expandedSections.prompt ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {expandedSections.prompt && (
            <div className="px-4 pb-4">
              <Textarea
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                placeholder={promptPlaceholder}
                className="min-h-[120px] resize-none"
              />
            </div>
          )}
        </div>
      )}

      {/* Room Type Section */}
      {showRoomType && selectedRoomType !== undefined && onRoomTypeSelect && (
        <div className="border-b">
          <button
            onClick={() => toggleSection("roomType")}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <span className="font-medium text-gray-900">Room Type</span>
            {expandedSections.roomType ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {expandedSections.roomType && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-4 gap-2">
                {roomTypes.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => onRoomTypeSelect(room.id)}
                    className={cn(
                      "p-3 rounded-lg border-2 text-center transition-all duration-200",
                      selectedRoomType === room.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="mb-1 flex justify-center">
                      <room.icon />
                    </div>
                    <div className="text-xs text-gray-700 leading-tight">
                      {room.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generate Button */}
      <div className="mt-auto p-4 space-y-2">
        {isResettable && onReset && (
          <Button
            onClick={onReset}
            variant="outline"
            className="w-full"
          >
            Reset to Original
          </Button>
        )}
        <Button
          onClick={onGenerate}
          disabled={isGenerating || 
                   (generateButtonDisabled !== undefined ? generateButtonDisabled : 
                    ((showRoomType && !selectedRoomType) || (prompt !== undefined && !prompt?.trim())))}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-medium"
        >
          {isGenerating ? "Generating..." : generateButtonText || "Generate"}
        </Button>
      </div>
    </div>
  );
}
