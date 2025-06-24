import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both"
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, orientation = "vertical", ...props }, ref) => {
    const scrollbarStyles = {
      vertical: "overflow-y-auto overflow-x-hidden",
      horizontal: "overflow-x-auto overflow-y-hidden",
      both: "overflow-auto"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative",
          scrollbarStyles[orientation],
          "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
          "hover:scrollbar-thumb-gray-400",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ScrollArea.displayName = "ScrollArea"

// Optional: Viewport component for more control
const ScrollAreaViewport = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("h-full w-full", className)} {...props} />
))
ScrollAreaViewport.displayName = "ScrollAreaViewport"

export { ScrollArea, ScrollAreaViewport }