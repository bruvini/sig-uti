import { CFMPriority, CFM_PRIORITIES } from "@/types/icu";
import { cn } from "@/lib/utils";

interface PriorityDistributionProps {
  data: Record<CFMPriority, number>;
  className?: string;
}

export function PriorityDistribution({ data, className }: PriorityDistributionProps) {
  const total = Object.values(data).reduce((acc, val) => acc + val, 0);
  const priorities: CFMPriority[] = [1, 2, 3, 4, 5];

  return (
    <div className={cn("card-clinical p-5", className)}>
      <h3 className="text-sm font-semibold text-foreground">
        Distribuição por Prioridade CFM
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Total de {total} solicitações
      </p>

      <div className="space-y-3">
        {priorities.map((priority) => {
          const count = data[priority];
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const info = CFM_PRIORITIES[priority];

          return (
            <div key={priority} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={cn("priority-badge", info.color, "text-[10px] px-1.5 py-0.5")}>
                    P{priority}
                  </span>
                  <span className="text-muted-foreground hidden sm:inline">
                    {info.name}
                  </span>
                </div>
                <span className="font-medium tabular-nums">
                  {count} <span className="text-muted-foreground">({percentage.toFixed(0)}%)</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", {
                    "bg-priority-1": priority === 1,
                    "bg-priority-2": priority === 2,
                    "bg-priority-3": priority === 3,
                    "bg-priority-4": priority === 4,
                    "bg-priority-5": priority === 5,
                  })}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
