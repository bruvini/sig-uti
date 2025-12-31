import React, { useState, useEffect } from "react";
import { updateRequest } from "@/services/requestService";
import { RequestData } from "@/types/request";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InfoIcon, AlertTriangleIcon, Trash2 } from "lucide-react";
import { Timestamp } from "firebase/firestore";

interface EvaluationModalProps {
    request: RequestData & { id: string };
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isReview?: boolean;
}

const EvaluationModal: React.FC<EvaluationModalProps> = ({ request, open, onOpenChange, isReview = false }) => {
    const { toast } = useToast();

    // State for questions
    const [needsSupport, setNeedsSupport] = useState<string | undefined>(undefined);
    const [highRecovery, setHighRecovery] = useState<string | undefined>(undefined);
    const [hasLimitation, setHasLimitation] = useState<string | undefined>(undefined);
    const [isPalliative, setIsPalliative] = useState<boolean>(false);

    const [calculatedPriority, setCalculatedPriority] = useState<number | null>(null);
    const [calculationReason, setCalculationReason] = useState<string>("");

    // Exit State
    const [showExitOptions, setShowExitOptions] = useState(false);
    const [exitReason, setExitReason] = useState<string>("");

    // Load existing data if review
    useEffect(() => {
        if (isReview && request.cfmAnswers) {
            setNeedsSupport(request.cfmAnswers.needsSupport ? "yes" : "no");
            setHighRecovery(request.cfmAnswers.highRecovery ? "yes" : "no");
            setHasLimitation(request.cfmAnswers.hasLimitation ? "yes" : "no");
            setIsPalliative(!!request.cfmAnswers.isPalliative);
        } else if (!open) {
            // Reset when closed
            setNeedsSupport(undefined);
            setHighRecovery(undefined);
            setHasLimitation(undefined);
            setIsPalliative(false);
            setCalculatedPriority(null);
            setCalculationReason("");
            setShowExitOptions(false);
            setExitReason("");
        }
    }, [open, isReview, request]);

    // Calculation Logic
    useEffect(() => {
        if (isPalliative) {
            setCalculatedPriority(5);
            setCalculationReason("Motivo: Paciente em fase terminal / cuidados paliativos exclusivos.");
            return;
        }

        if (needsSupport === undefined || highRecovery === undefined || hasLimitation === undefined) {
            setCalculatedPriority(null);
            setCalculationReason("");
            return;
        }

        const S = needsSupport === "yes";
        const R = highRecovery === "yes";
        const L = hasLimitation === "yes";

        // Logic based on CFM 2.156/2016 interpretation
        if (S) {
            if (R && !L) {
                setCalculatedPriority(1);
                setCalculationReason("Motivo: Requer suporte à vida + Alta probabilidade de recuperação + Sem limitação terapêutica.");
            } else {
                setCalculatedPriority(3);
                setCalculationReason("Motivo: Requer suporte à vida, mas com baixa recuperação ou limitação terapêutica.");
            }
        } else {
            // S=N
            if (R && !L) {
                setCalculatedPriority(2);
                setCalculationReason("Motivo: Monitorização intensiva + Alta probabilidade de recuperação + Sem limitação terapêutica.");
            } else {
                setCalculatedPriority(4);
                setCalculationReason("Motivo: Estável, mas com baixa recuperação ou limitação terapêutica.");
            }
        }

    }, [needsSupport, highRecovery, hasLimitation, isPalliative]);

    const handleConfirm = async () => {
        if (calculatedPriority === null) return;

        // Defensive validation (Bugfix)
        if (!isPalliative && (needsSupport === undefined || highRecovery === undefined || hasLimitation === undefined)) {
             toast({
                title: "Dados incompletos",
                description: "Por favor, responda todas as perguntas do checklist.",
                variant: "destructive"
            });
            return;
        }

        try {
            const previousPriority = request.cfmPriority;

            // Explicit boolean conversion to avoid undefined
            const answers = {
                needsSupport: needsSupport === "yes",
                highRecovery: highRecovery === "yes",
                hasLimitation: hasLimitation === "yes",
                isPalliative: !!isPalliative
            };

            await updateRequest(request.id, {
                status: 'waiting_bed',
                cfmPriority: calculatedPriority,
                cfmAnswers: answers,
                evaluatedAt: Timestamp.now()
            }, {
                action: isReview ? 'revised_priority' : 'evaluated',
                previousPriority: previousPriority,
                newPriority: calculatedPriority,
                userParams: 'Médico Regulador'
            });

            toast({
                title: isReview ? "Prioridade Atualizada" : "Prioridade Confirmada",
                description: `Paciente classificado como PRIORIDADE ${calculatedPriority}.`,
            });
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro",
                description: "Falha ao salvar a regulação. Verifique sua conexão.",
                variant: "destructive"
            });
        }
    };

    const handleDiscard = async () => {
        if (!exitReason) return;

        try {
            await updateRequest(request.id, {
                status: 'canceled', // Remove from waiting list
                exitReason: exitReason as any,
                exitNote: "Removido via revisão de fila"
            }, {
                action: 'discarded',
                reason: exitReason,
                userParams: 'Médico Regulador'
            });
             toast({
                title: "Solicitação Finalizada",
                description: "Paciente removido da fila com sucesso.",
            });
            onOpenChange(false);
        } catch (error) {
             toast({
                title: "Erro",
                description: "Falha ao remover paciente.",
                variant: "destructive"
            });
        }
    };

    const getPriorityColor = (p: number) => {
        switch(p) {
            case 1: return "text-red-600 bg-red-100 border-red-200";
            case 2: return "text-orange-600 bg-orange-100 border-orange-200";
            case 3: return "text-yellow-600 bg-yellow-100 border-yellow-200";
            case 4: return "text-blue-600 bg-blue-100 border-blue-200";
            case 5: return "text-gray-600 bg-gray-100 border-gray-200";
            default: return "text-gray-600";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Protocolo de Priorização de Vagas - CFM 2.156/2016</DialogTitle>
                    <DialogDescription>
                        Regulação para: <b>{request.patientName}</b> ({request.cns})
                    </DialogDescription>
                </DialogHeader>

                {/* Discard Mode Toggle (Only in Review) */}
                {isReview && !showExitOptions && (
                    <div className="flex justify-end">
                         <Button variant="destructive" size="sm" onClick={() => setShowExitOptions(true)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Descartar / Remover da Fila
                         </Button>
                    </div>
                )}

                {showExitOptions ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 space-y-4">
                        <h3 className="text-red-800 font-semibold flex items-center gap-2">
                             <Trash2 className="h-5 w-5" />
                             Remover Paciente da Fila
                        </h3>
                        <p className="text-sm text-red-700">Selecione o motivo para remover esta solicitação da lista de espera.</p>

                        <div className="space-y-2">
                            <Label>Motivo da Saída</Label>
                            <Select onValueChange={setExitReason}>
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Selecione o motivo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="discharge">Melhora Clínica / Alta</SelectItem>
                                    <SelectItem value="death">Óbito</SelectItem>
                                    <SelectItem value="transfer">Transferência Externa</SelectItem>
                                    <SelectItem value="error">Erro de Cadastro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="ghost" onClick={() => setShowExitOptions(false)}>Cancelar</Button>
                            <Button variant="destructive" disabled={!exitReason} onClick={handleDiscard}>Confirmar Remoção</Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <Alert className="bg-blue-50 border-blue-200">
                            <InfoIcon className="h-4 w-4 text-blue-600" />
                            <AlertTitle className="text-blue-800">Diretriz Clínica</AlertTitle>
                            <AlertDescription className="text-blue-700 text-sm mt-1 leading-relaxed">
                                Este protocolo baseia-se na Resolução CFM nº 2.156/2016, servindo como norteador clínico e administrativo para auxiliar na decisão de priorização. A classificação sugerida não impede a regulação e pode ser revisada periodicamente pela equipe médica conforme a evolução do quadro.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-6 py-4">
                            {/* Toggle for Palliative/Terminal */}
                            <div className="flex items-center justify-between space-x-2 border p-4 rounded-lg bg-gray-50">
                                <Label htmlFor="palliative-mode" className="flex flex-col space-y-1">
                                    <span className="font-semibold">Fase Terminal / Cuidados Paliativos Exclusivos?</span>
                                    <span className="font-normal text-xs text-muted-foreground">Paciente sem possibilidade terapêutica de cura.</span>
                                </Label>
                                <Switch id="palliative-mode" checked={isPalliative} onCheckedChange={setIsPalliative} />
                            </div>

                            {!isPalliative && (
                                <>
                                    <div className="space-y-3">
                                        <Label className="text-base">1. O paciente necessita de intervenção de suporte à vida?</Label>
                                        <p className="text-xs text-gray-500">Ex: Ventilação Mecânica, Drogas Vasoativas, Monitorização Invasiva.</p>
                                        <RadioGroup value={needsSupport} onValueChange={setNeedsSupport} className="flex gap-4">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="yes" id="support-yes" />
                                                <Label htmlFor="support-yes">Sim</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="no" id="support-no" />
                                                <Label htmlFor="support-no">Não</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-base">2. O paciente tem alta probabilidade de recuperação?</Label>
                                        <p className="text-xs text-gray-500">Considerar comorbidades prévias e estado funcional anterior.</p>
                                        <RadioGroup value={highRecovery} onValueChange={setHighRecovery} className="flex gap-4">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="yes" id="recovery-yes" />
                                                <Label htmlFor="recovery-yes">Sim</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="no" id="recovery-no" />
                                                <Label htmlFor="recovery-no">Não</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-base">3. Existe limitação terapêutica?</Label>
                                        <p className="text-xs text-gray-500">Ordem de não reanimar, diretivas antecipadas de vontade.</p>
                                        <RadioGroup value={hasLimitation} onValueChange={setHasLimitation} className="flex gap-4">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="yes" id="limitation-yes" />
                                                <Label htmlFor="limitation-yes">Sim</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="no" id="limitation-no" />
                                                <Label htmlFor="limitation-no">Não</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </>
                            )}

                            {/* Result Block */}
                            {calculatedPriority && (
                                <div className={`mt-6 p-4 rounded-lg border ${getPriorityColor(calculatedPriority)}`}>
                                    <div className="flex items-center gap-3">
                                        <AlertTriangleIcon className="h-6 w-6" />
                                        <div>
                                            <p className="text-sm font-semibold uppercase">Resultado Calculado</p>
                                            <p className="text-2xl font-bold">PRIORIDADE {calculatedPriority}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs mt-2 opacity-80 font-medium border-t border-black/10 pt-2">
                                        {calculationReason}
                                    </p>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                            <Button onClick={handleConfirm} disabled={!calculatedPriority}>
                                {isReview ? "Confirmar Priorização" : "Confirmar Priorização"}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default EvaluationModal;
