import { CFMPriority, CFM_PRIORITIES } from "@/types/icu";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PriorityBadgeProps {
  priority: CFMPriority;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
  pulse?: boolean;
}

export function PriorityBadge({
  priority,
  size = "md",
  showLabel = true,
  className,
  pulse = false,
}: PriorityBadgeProps) {
  const info = CFM_PRIORITIES[priority];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "priority-badge",
            info.color,
            sizeClasses[size],
            pulse && priority <= 2 && "animate-pulse-soft",
            className
          )}
        >
          P{priority}
          {showLabel && <span className="ml-1 hidden sm:inline">CFM</span>}
        </span>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-semibold">{info.name}</p>
          <p className="text-xs text-muted-foreground">{info.description}</p>
          <p className="text-xs font-medium text-primary">{info.recommendation}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
