"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

const NeumorphicSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-[30px] w-[60px] shrink-0 cursor-pointer items-center rounded-[15px] border-0 transition-all duration-300",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      // Neumorphic style - unchecked state
      "data-[state=unchecked]:bg-transparent",
      "data-[state=unchecked]:shadow-[8px_4px_12px_0px_rgba(209,217,230,1),-8px_-4px_8px_0px_rgba(255,255,255,1),inset_-4px_-4px_4px_0px_rgba(255,255,255,1),inset_4px_4px_4px_0px_rgba(209,217,230,1)]",
      // Neumorphic style - checked state
      "data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-600",
      "data-[state=checked]:shadow-[inset_2px_2px_5px_0px_rgba(0,0,0,0.2),inset_-2px_-2px_5px_0px_rgba(255,255,255,0.1)]",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-[22px] w-[22px] rounded-full transition-all duration-300",
        "shadow-[2px_2px_5px_0px_rgba(0,0,0,0.15),-2px_-2px_5px_0px_rgba(255,255,255,0.7)]",
        // Unchecked state - thumb on left
        "data-[state=unchecked]:translate-x-[4px] data-[state=unchecked]:bg-gradient-to-br data-[state=unchecked]:from-gray-100 data-[state=unchecked]:to-gray-200",
        // Checked state - thumb on right
        "data-[state=checked]:translate-x-[34px] data-[state=checked]:bg-white"
      )}
    />
  </SwitchPrimitives.Root>
))
NeumorphicSwitch.displayName = "NeumorphicSwitch"

export { NeumorphicSwitch }
