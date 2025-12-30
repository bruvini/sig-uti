import { Bed, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BedOccupancyProps {
  available: number;
  total: number;
  occupancyRate: number;
  className?: string;
}

export function BedOccupancy({ available, total, occupancyRate, className }: BedOccupancyProps) {
  const occupied = total - available;
  const isHighOccupancy = occupancyRate >= 85;
  const isCriticalOccupancy = occupancyRate >= 95;

  return (
    <div className={cn("card-clinical p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Ocupação de Leitos
          </h3>
          <p className="text-xs text-muted-foreground">
            UTI Adulto - Tempo real
          </p>
        </div>
        {isCriticalOccupancy && (
          <div className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
            <AlertTriangle className="h-3 w-3" />
            Crítico
          </div>
        )}
      </div>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="text-5xl font-bold tracking-tight">
            {available}
          </p>
          <p className="text-sm text-muted-foreground">
            leitos disponíveis
          </p>
        </div>
        <div className="text-right">
          <p className={cn(
            "text-3xl font-bold",
            isCriticalOccupancy ? "text-destructive" : isHighOccupancy ? "text-warning" : "text-success"
          )}>
            {occupancyRate}%
          </p>
          <p className="text-sm text-muted-foreground">ocupação</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>Ocupados: {occupied}</span>
          <span>Total: {total}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isCriticalOccupancy
                ? "bg-destructive"
                : isHighOccupancy
                ? "bg-warning"
                : "bg-success"
            )}
            style={{ width: `${occupancyRate}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[...Array(total)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex h-8 items-center justify-center rounded-md text-xs font-medium transition-colors",
              i < occupied
                ? "bg-primary/10 text-primary"
                : "bg-success/10 text-success"
            )}
          >
            <Bed className="h-4 w-4" />
          </div>
        )).slice(0, 12)}
        {total > 12 && (
          <div className="flex h-8 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
            +{total - 12}
          </div>
        )}
      </div>
    </div>
  );
}
