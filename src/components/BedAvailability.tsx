import React, { useState, useEffect } from "react";
import { Bed, BedStatus, BedStatusEnum } from "@/types/bed";
import { RequestData } from "@/types/request";
import { subscribeToBeds, updateBedStatus, assignPatientToBed, subscribeToUnits } from "@/services/bedService";
import { subscribeToWaitingRequests } from "@/services/requestService";
import { useToast } from "@/components/ui/use-toast";
import StructureManager from "./StructureManager";
import InformAvailabilityModal from "./InformAvailabilityModal";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { BedDouble, CheckCircle, AlertTriangle, MoreVertical } from "lucide-react";

// Helper to sort requests by priority
const sortRequests = (reqs: RequestData[]) => {
    return [...reqs].sort((a, b) => {
        const pA = a.cfmPriority || 99;
        const pB = b.cfmPriority || 99;
        if (pA !== pB) return pA - pB;
        return 0;
    });
};

const BedAvailability = () => {
    const { toast } = useToast();
    const [beds, setBeds] = useState<(Bed & { id: string })[]>([]);
    const [waitingRequests, setWaitingRequests] = useState<(RequestData & { id: string })[]>([]);

    // Regulation Modal State
    const [selectedBed, setSelectedBed] = useState<(Bed & { id: string }) | null>(null);
    const [regulationOpen, setRegulationOpen] = useState(false);

    // Justification Logic
    const [justificationOpen, setJustificationOpen] = useState(false);
    const [pendingAssignment, setPendingAssignment] = useState<{ reqId: string, bedId: string, unitId: string } | null>(null);
    const [justificationText, setJustificationText] = useState("");

    useEffect(() => {
        const unsubBeds = subscribeToBeds(setBeds);
        const unsubReqs = subscribeToWaitingRequests(setWaitingRequests);
        return () => {
            unsubBeds();
            unsubReqs();
        };
    }, []);

    // Filter Logic: Only show available beds
    const availableBeds = beds.filter(b =>
        ['clean', 'discharge_confirmed', 'discharge_unconfirmed'].includes(b.status)
    );

    const handleBedClick = (bed: Bed & { id: string }) => {
        setSelectedBed(bed);
        setRegulationOpen(true);
    };

    const handleSelectPatient = (req: RequestData & { id: string }) => {
        if (!selectedBed) return;

        const sorted = sortRequests(waitingRequests);
        const topPriority = sorted[0]?.cfmPriority || 99;
        const selectedPriority = req.cfmPriority || 99;

        // Anti-Pattern Check
        if (selectedPriority > topPriority) {
            setPendingAssignment({ reqId: req.id, bedId: selectedBed.id, unitId: selectedBed.unitId });
            setJustificationOpen(true);
        } else {
            // Normal Flow
            executeAssignment(req.id, selectedBed.id, selectedBed.unitId);
        }
    };

    const executeAssignment = async (reqId: string, bedId: string, unitId: string, justification?: string) => {
        try {
            await assignPatientToBed(reqId, bedId, unitId, justification);
            toast({
                title: "Regulação Confirmada!",
                description: "Paciente alocado ao leito. Aguardando admissão física."
            });
            setRegulationOpen(false);
            setJustificationOpen(false);
            setJustificationText("");
            setPendingAssignment(null);
        } catch (e) {
            toast({ title: "Erro na regulação", description: "Falha na transação.", variant: "destructive" });
        }
    };

    const handleJustificationConfirm = () => {
        if (justificationText.length < 10) {
            toast({ title: "Justificativa muito curta", variant: "destructive" });
            return;
        }
        if (pendingAssignment) {
            executeAssignment(pendingAssignment.reqId, pendingAssignment.bedId, pendingAssignment.unitId, justificationText);
        }
    };

    const getStatusColor = (status: BedStatus) => {
        switch(status) {
            case 'clean': return "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 cursor-pointer shadow-sm hover:shadow-md";
            case 'discharge_confirmed': return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200 cursor-pointer shadow-sm hover:shadow-md";
            case 'discharge_unconfirmed': return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 cursor-pointer";
            default: return "bg-gray-50 opacity-50"; // Should not be seen ideally
        }
    };

    const getStatusLabel = (status: string) => {
        switch(status) {
            case 'clean': return "Limpo/Disponível";
            case 'discharge_confirmed': return "Alta Confirmada";
            case 'discharge_unconfirmed': return "Previsão de Alta";
            default: return status;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                     <div className="h-6 w-1 bg-purple-500 rounded-full" />
                     <h2 className="text-lg font-semibold tracking-tight text-gray-800">Oferta de Vagas</h2>
                </div>
                <div className="flex gap-2">
                    <InformAvailabilityModal />
                    <StructureManager />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 min-h-[400px]">
                {availableBeds.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                        <BedDouble className="h-10 w-10 mb-2 opacity-20" />
                        <p>Nenhuma vaga ofertada no momento.</p>
                        <p className="text-xs mt-2">Clique em "Informar Disponibilidade" para abrir leitos.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {availableBeds.map(bed => (
                            <div
                                key={bed.id}
                                className={`p-4 rounded-lg border text-center relative group transition-all ${getStatusColor(bed.status)}`}
                                onClick={() => handleBedClick(bed)}
                            >
                                <p className="text-xs font-semibold uppercase opacity-70 truncate">{bed.unitName}</p>
                                <h4 className="text-3xl font-bold my-2">{bed.bedNumber}</h4>
                                <Badge variant="outline" className="bg-white/50 text-[10px] whitespace-nowrap border-0">
                                    {getStatusLabel(bed.status)}
                                </Badge>
                                <p className="text-[10px] mt-2 opacity-60">Toque para regular</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* REGULATION DIALOG */}
            <Dialog open={regulationOpen} onOpenChange={setRegulationOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Regular Paciente</DialogTitle>
                        <DialogDescription>
                            Selecionando paciente para o <b>Leito {selectedBed?.bedNumber}</b> ({selectedBed?.unitName}).
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="h-[400px] border rounded-md p-4">
                        {waitingRequests.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">Fila vazia.</div>
                        ) : (
                            <div className="space-y-2">
                                {sortRequests(waitingRequests).map((req, index) => (
                                    <div key={req.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-bold text-gray-400">#{index + 1}</span>
                                                <Badge className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center p-0 ${req.cfmPriority === 1 ? 'bg-red-500' : 'bg-gray-500'}`}>
                                                    {req.cfmPriority}
                                                </Badge>
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{req.patientName}</p>
                                                <p className="text-xs text-gray-500">{req.clinicalReason || req.surgeryType}</p>
                                            </div>
                                        </div>
                                        <Button size="sm" onClick={() => handleSelectPatient(req)}>Selecionar</Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* JUSTIFICATION ALERT */}
            <AlertDialog open={justificationOpen} onOpenChange={setJustificationOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-yellow-600">
                            <AlertTriangle className="h-5 w-5" /> Quebra de Prioridade Detectada
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Você está selecionando um paciente com prioridade inferior ao topo da fila.
                            Conforme a Resolução CFM, é obrigatório justificar esta decisão técnica.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <Textarea
                        placeholder="Descreva o motivo clínico para a inversão de prioridade (mínimo 10 caracteres)..."
                        value={justificationText}
                        onChange={(e) => setJustificationText(e.target.value)}
                        className="min-h-[100px]"
                    />

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleJustificationConfirm}
                            disabled={justificationText.length < 10}
                            className="bg-yellow-600 hover:bg-yellow-700"
                        >
                            Confirmar com Justificativa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default BedAvailability;
