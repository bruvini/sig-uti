import { ICURequest, CFM_PRIORITIES } from "@/types/icu";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  User, 
  MapPin, 
  FileText, 
  ChevronRight,
  AlertCircle,
  Heart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RequestCardProps {
  request: ICURequest;
  onSelect: (request: ICURequest) => void;
  className?: string;
}

export function RequestCard({ request, onSelect, className }: RequestCardProps) {
  const waitTime = formatDistanceToNow(request.requestDate, {
    locale: ptBR,
    addSuffix: false,
  });

  const isUrgent = request.cfmPriority <= 2;
  const isPalliative = request.cfmPriority === 5;
  const priorityInfo = CFM_PRIORITIES[request.cfmPriority];

  return (
    <div
      className={cn(
        "card-clinical group overflow-hidden transition-all duration-200 hover:shadow-md",
        isUrgent && "ring-2 ring-priority-1/30",
        isPalliative && "ring-2 ring-priority-5/30",
        className
      )}
    >
      {/* Priority Strip */}
      <div
        className={cn("h-1.5", {
          "bg-priority-1": request.cfmPriority === 1,
          "bg-priority-2": request.cfmPriority === 2,
          "bg-priority-3": request.cfmPriority === 3,
          "bg-priority-4": request.cfmPriority === 4,
          "bg-priority-5": request.cfmPriority === 5,
        })}
      />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <PriorityBadge priority={request.cfmPriority} pulse={isUrgent} />
            <div>
              <h3 className="font-semibold text-foreground">
                {request.patient.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {request.patient.age} anos • {request.patient.gender === "M" ? "Masculino" : request.patient.gender === "F" ? "Feminino" : "Outro"}
              </p>
            </div>
          </div>
          <StatusBadge status={request.status} />
        </div>

        {/* Alerts */}
        {isPalliative && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-priority-5-bg p-2 text-xs text-priority-5">
            <Heart className="h-4 w-4" />
            <span className="font-medium">Encaminhamento para Cuidados Paliativos recomendado</span>
          </div>
        )}

        {(request.cfmPriority === 2 || request.cfmPriority === 4) && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-info/10 p-2 text-xs text-info">
            <AlertCircle className="h-4 w-4" />
            <span>Candidato potencial para Unidade Semi-Intensiva</span>
          </div>
        )}

        {/* Info Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="truncate">{request.patient.medicalRecord}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{request.patient.originUnit}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="truncate">{request.requestingPhysician}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Aguardando há {waitTime}</span>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="mt-3">
          <p className="text-sm font-medium text-foreground">
            {request.patient.diagnosis}
          </p>
        </div>

        {/* Scores */}
        {(request.sofa || request.apache) && (
          <div className="mt-3 flex items-center gap-4 text-xs">
            {request.sofa && (
              <div className="rounded-md bg-secondary px-2 py-1">
                <span className="text-muted-foreground">SOFA:</span>{" "}
                <span className="font-semibold">{request.sofa}</span>
              </div>
            )}
            {request.apache && (
              <div className="rounded-md bg-secondary px-2 py-1">
                <span className="text-muted-foreground">APACHE II:</span>{" "}
                <span className="font-semibold">{request.apache}</span>
              </div>
            )}
          </div>
        )}

        {/* Recommendation */}
        <div className="mt-3 rounded-lg bg-secondary/50 p-2 text-xs">
          <span className="font-medium text-muted-foreground">Recomendação CFM:</span>{" "}
          <span className="text-foreground">{priorityInfo.recommendation}</span>
        </div>

        {/* Action */}
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelect(request)}
            className="gap-1 text-primary hover:text-primary"
          >
            Avaliar
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
