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
      // Neumorphic style - unchecked state (off)
      "data-[state=unchecked]:bg-[#ecf0f3]",
      "data-[state=unchecked]:shadow-[-8px_-4px_8px_0px_#ffffff,8px_4px_12px_0px_#d1d9e6,inset_4px_4px_4px_0px_#d1d9e6,inset_-4px_-4px_4px_0px_#ffffff]",
      // Neumorphic style - checked state (on)
      "data-[state=checked]:bg-[#ecf0f3]",
      "data-[state=checked]:shadow-[-8px_-4px_8px_0px_#ffffff,8px_4px_12px_0px_#d1d9e6,inset_4px_4px_4px_0px_#d1d9e6,inset_-4px_-4px_4px_0px_#ffffff]",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-[22px] w-[22px] rounded-full transition-all duration-300",
        "shadow-[-8px_-4px_8px_0px_#ffffff,8px_4px_12px_0px_#d1d9e6]",
        // Unchecked state - thumb on left
        "data-[state=unchecked]:translate-x-[4px] data-[state=unchecked]:bg-[#ecf0f3]",
        // Checked state - thumb on right with blue accent
        "data-[state=checked]:translate-x-[34px] data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-blue-400 data-[state=checked]:to-blue-500"
      )}
    />
  </SwitchPrimitives.Root>
))
NeumorphicSwitch.displayName = "NeumorphicSwitch"

export { NeumorphicSwitch }
