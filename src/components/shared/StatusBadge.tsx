import { RequestStatus } from "@/types/icu";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Clock, ArrowRight, Ban, RefreshCw } from "lucide-react";

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

const statusConfig: Record<RequestStatus, { label: string; icon: React.ElementType; className: string }> = {
  pending: {
    label: "Aguardando",
    icon: Clock,
    className: "bg-warning/10 text-warning border-warning/30",
  },
  approved: {
    label: "Aprovado",
    icon: CheckCircle,
    className: "bg-success/10 text-success border-success/30",
  },
  denied: {
    label: "Negado",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  transferred: {
    label: "Transferido",
    icon: ArrowRight,
    className: "bg-info/10 text-info border-info/30",
  },
  cancelled: {
    label: "Cancelado",
    icon: Ban,
    className: "bg-muted text-muted-foreground border-muted-foreground/30",
  },
  reevaluation: {
    label: "Reavaliação",
    icon: RefreshCw,
    className: "bg-primary/10 text-primary border-primary/30",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
