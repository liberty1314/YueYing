"use client";

import { Star, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingBadgeProps {
  rating: number;
  type?: "platform" | "user";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RatingBadge({
  rating,
  type = "platform",
  showLabel = false,
  size = "md",
  className,
}: RatingBadgeProps) {
  const sizeClasses = {
    sm: {
      container: "px-2 py-0.5 text-xs gap-1",
      icon: "h-3 w-3",
    },
    md: {
      container: "px-2 py-1 text-xs gap-1",
      icon: "h-3 w-3",
    },
    lg: {
      container: "px-3 py-1.5 text-sm gap-1.5",
      icon: "h-4 w-4",
    },
  };

  const isPlatform = type === "platform";
  
  return (
    <div
      className={cn(
        "flex items-center rounded-full backdrop-blur-sm font-semibold shadow-lg transition-all",
        sizeClasses[size].container,
        isPlatform
          ? "bg-black/80 text-white"
          : "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
        className
      )}
    >
      {isPlatform ? (
        <Star className={cn(sizeClasses[size].icon, "fill-yellow-400 text-yellow-400")} />
      ) : (
        <Heart className={cn(sizeClasses[size].icon, "fill-white text-white")} />
      )}
      <span>{rating.toFixed(1)}</span>
      {/* {showLabel && (
        <span className="text-[0.65rem] opacity-80 ml-0.5">
          {isPlatform ? "" : "我的"}
        </span>
      )} */}
    </div>
  );
}

