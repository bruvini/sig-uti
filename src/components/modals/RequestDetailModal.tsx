import { useState } from "react";
import { ICURequest, CFMPriority, CFM_PRIORITIES, DENIAL_REASONS } from "@/types/icu";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EthicsNotice } from "@/components/shared/EthicsNotice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowRight,
  Clock,
  User,
  MapPin,
  FileText,
  Stethoscope,
  AlertTriangle,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface RequestDetailModalProps {
  request: ICURequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (request: ICURequest) => void;
  onDeny?: (request: ICURequest, reason: string, observation?: string) => void;
  onReevaluate?: (request: ICURequest, newPriority: CFMPriority, justification: string) => void;
}

export function RequestDetailModal({
  request,
  open,
  onOpenChange,
  onApprove,
  onDeny,
  onReevaluate,
}: RequestDetailModalProps) {
  const [action, setAction] = useState<"none" | "approve" | "deny" | "reevaluate">("none");
  const [denialReason, setDenialReason] = useState("");
  const [denialObservation, setDenialObservation] = useState("");
  const [newPriority, setNewPriority] = useState<CFMPriority | null>(null);
  const [reevalJustification, setReevalJustification] = useState("");

  if (!request) return null;

  const priorityInfo = CFM_PRIORITIES[request.cfmPriority];
  const waitTime = formatDistanceToNow(request.requestDate, {
    locale: ptBR,
    addSuffix: false,
  });

  const handleApprove = () => {
    onApprove?.(request);
    toast.success("Solicitação aprovada", {
      description: `Leito de UTI autorizado para ${request.patient.name}`,
    });
    onOpenChange(false);
  };

  const handleDeny = () => {
    if (!denialReason) {
      toast.error("Selecione um motivo para a negativa");
      return;
    }
    onDeny?.(request, denialReason, denialObservation);
    toast.info("Solicitação negada", {
      description: "Registro de negativa salvo com sucesso",
    });
    onOpenChange(false);
  };

  const handleReevaluate = () => {
    if (!newPriority || !reevalJustification) {
      toast.error("Preencha todos os campos da reavaliação");
      return;
    }
    onReevaluate?.(request, newPriority, reevalJustification);
    toast.success("Reavaliação registrada", {
      description: `Nova prioridade: P${newPriority}`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <PriorityBadge priority={request.cfmPriority} size="lg" />
            <div>
              <DialogTitle>{request.patient.name}</DialogTitle>
              <DialogDescription>
                {request.patient.age} anos • {request.id}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Info */}
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Prontuário: {request.patient.medicalRecord}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Origem: {request.patient.originUnit}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Solicitante: {request.requestingPhysician}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Aguardando há {waitTime}</span>
            </div>
          </div>

          {/* Diagnosis */}
          <div>
            <h4 className="mb-2 flex items-center gap-2 font-medium">
              <Stethoscope className="h-4 w-4" />
              Diagnóstico
            </h4>
            <p className="rounded-lg bg-secondary p-3 text-sm">
              {request.patient.diagnosis}
            </p>
          </div>

          {/* Clinical Justification */}
          <div>
            <h4 className="mb-2 font-medium">Justificativa Clínica</h4>
            <p className="rounded-lg bg-secondary p-3 text-sm">
              {request.clinicalJustification}
            </p>
          </div>

          {/* Scores */}
          {(request.sofa || request.apache) && (
            <div className="flex gap-4">
              {request.sofa && (
                <div className="rounded-lg bg-secondary px-4 py-2">
                  <p className="text-xs text-muted-foreground">SOFA</p>
                  <p className="text-lg font-semibold">{request.sofa}</p>
                </div>
              )}
              {request.apache && (
                <div className="rounded-lg bg-secondary px-4 py-2">
                  <p className="text-xs text-muted-foreground">APACHE II</p>
                  <p className="text-lg font-semibold">{request.apache}</p>
                </div>
              )}
            </div>
          )}

          {/* CFM Priority Info */}
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Classificação CFM
                </p>
                <p className="mt-1 font-semibold">{priorityInfo.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {priorityInfo.description}
                </p>
              </div>
              <PriorityBadge priority={request.cfmPriority} size="lg" />
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-primary">
              <ArrowRight className="h-4 w-4" />
              <span className="font-medium">{priorityInfo.recommendation}</span>
            </div>
          </div>

          {/* Alerts */}
          {request.cfmPriority === 5 && (
            <div className="flex items-start gap-3 rounded-lg bg-priority-5-bg p-3 border border-priority-5/30">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-priority-5" />
              <div className="text-sm">
                <p className="font-medium text-priority-5">
                  Prioridade 5 - Cuidados Paliativos
                </p>
                <p className="text-muted-foreground">
                  Paciente não elegível para UTI. Encaminhar para equipe de
                  cuidados paliativos.
                </p>
              </div>
            </div>
          )}

          {/* History */}
          {request.history.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-2 font-medium">
                <History className="h-4 w-4" />
                Histórico
              </h4>
              <div className="space-y-2">
                {request.history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3 text-sm"
                  >
                    <div className="h-2 w-2 mt-1.5 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium">{entry.action}</p>
                      <p className="text-muted-foreground">
                        {entry.physician} •{" "}
                        {format(entry.date, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                      {entry.justification && (
                        <p className="mt-1 text-muted-foreground">
                          {entry.justification}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Selection */}
          {request.status === "pending" && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">Ação do Regulador</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={action === "approve" ? "default" : "outline"}
                  onClick={() => setAction("approve")}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Aprovar
                </Button>
                <Button
                  variant={action === "deny" ? "destructive" : "outline"}
                  onClick={() => setAction("deny")}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Negar
                </Button>
                <Button
                  variant={action === "reevaluate" ? "secondary" : "outline"}
                  onClick={() => setAction("reevaluate")}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reavaliar Prioridade
                </Button>
              </div>

              {/* Deny Form */}
              {action === "deny" && (
                <div className="space-y-4 rounded-lg border bg-destructive/5 p-4">
                  <div>
                    <Label>Motivo da Negativa (CFM)</Label>
                    <Select value={denialReason} onValueChange={setDenialReason}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione o motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {DENIAL_REASONS.map((reason) => (
                          <SelectItem key={reason.code} value={reason.code}>
                            {reason.description}
                            {reason.cfmBased && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                (CFM)
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Observação Clínica (opcional)</Label>
                    <Textarea
                      value={denialObservation}
                      onChange={(e) => setDenialObservation(e.target.value)}
                      placeholder="Observações adicionais..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleDeny} variant="destructive">
                    Confirmar Negativa
                  </Button>
                </div>
              )}

              {/* Reevaluate Form */}
              {action === "reevaluate" && (
                <div className="space-y-4 rounded-lg border bg-secondary/50 p-4">
                  <div>
                    <Label>Nova Prioridade CFM</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {([1, 2, 3, 4, 5] as CFMPriority[]).map((p) => (
                        <Button
                          key={p}
                          type="button"
                          variant={newPriority === p ? "default" : "outline"}
                          size="sm"
                          onClick={() => setNewPriority(p)}
                        >
                          P{p}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Justificativa da Reavaliação</Label>
                    <Textarea
                      value={reevalJustification}
                      onChange={(e) => setReevalJustification(e.target.value)}
                      placeholder="Descreva o motivo da alteração de prioridade..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleReevaluate}>
                    Confirmar Reavaliação
                  </Button>
                </div>
              )}

              {/* Approve Confirmation */}
              {action === "approve" && (
                <div className="space-y-4 rounded-lg border bg-success/5 p-4">
                  <p className="text-sm text-muted-foreground">
                    Ao aprovar, você está autorizando a admissão do paciente em
                    leito de UTI conforme classificação CFM.
                  </p>
                  <EthicsNotice variant="compact" />
                  <Button onClick={handleApprove} className="bg-success hover:bg-success/90">
                    Confirmar Aprovação
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
