import { Scale, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EthicsNoticeProps {
  variant?: "default" | "compact";
  className?: string;
}

export function EthicsNotice({ variant = "default", className }: EthicsNoticeProps) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg bg-info/10 px-3 py-2 text-xs text-muted-foreground",
          className
        )}
      >
        <Scale className="h-4 w-4 text-info" />
        <span>
          Decisões baseadas exclusivamente em critérios clínicos (CFM 2.156/2016)
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-info/20 bg-info/5 p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info/10">
          <Scale className="h-5 w-5 text-info" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            Resolução CFM nº 2.156/2016
          </h3>
          <p className="text-sm text-muted-foreground">
            As decisões de admissão em UTI devem ser baseadas exclusivamente em
            critérios clínicos objetivos. <strong>Idade, sexo, orientação sexual,
            condição social, etnia ou religião não são critérios de decisão.</strong>
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>O médico regulador é o responsável final pela decisão clínica.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
