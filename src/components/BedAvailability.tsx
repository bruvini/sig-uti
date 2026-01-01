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
import {
    BedDouble,
    CheckCircle,
    AlertTriangle,
    MoreVertical,
    UserPlus,
    RefreshCw,
    XCircle,
    Info
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

    // Removal Logic
    const [removalOpen, setRemovalOpen] = useState(false);
    const [bedToRemove, setBedToRemove] = useState<(Bed & { id: string }) | null>(null);
    const [removalReason, setRemovalReason] = useState("");

    useEffect(() => {
        const unsubBeds = subscribeToBeds(setBeds);
        const unsubReqs = subscribeToWaitingRequests(setWaitingRequests);
        return () => {
            unsubBeds();
            unsubReqs();
        };
    }, []);

    // Filter Logic: Show clean, discharge*, and maintenance (New Rule)
    const availableBeds = beds.filter(b =>
        ['clean', 'discharge_confirmed', 'discharge_unconfirmed', 'maintenance'].includes(b.status)
    );

    const handleRegularPatient = (bed: Bed & { id: string }) => {
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
            executeAssignment(req.id, selectedBed.id, selectedBed.unitId, selectedBed.status);
        }
    };

    const executeAssignment = async (reqId: string, bedId: string, unitId: string, bedStatus: BedStatus, justification?: string) => {
        try {
            await assignPatientToBed(reqId, bedId, unitId, bedStatus, justification);
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
            // We need the bed status for pending assignment. We can find it in 'beds' or store in pendingAssignment
            const bed = beds.find(b => b.id === pendingAssignment.bedId);
            if (bed) {
                executeAssignment(pendingAssignment.reqId, pendingAssignment.bedId, pendingAssignment.unitId, bed.status, justificationText);
            }
        }
    };

    const handleStatusChange = async (bedId: string, status: BedStatus) => {
        try {
            await updateBedStatus(bedId, status);
            toast({ title: "Status atualizado" });
        } catch(e) {
            toast({ title: "Erro ao atualizar", variant: "destructive" });
        }
    }

    const handleRemoveAvailability = (bed: Bed & { id: string }) => {
        setBedToRemove(bed);
        setRemovalOpen(true);
    };

    const confirmRemoval = async () => {
        if (!bedToRemove || removalReason.length < 5) return;
        try {
            await updateBedStatus(bedToRemove.id, 'closed', removalReason);
            toast({ title: "Leito removido da disponibilidade" });
            setRemovalOpen(false);
            setRemovalReason("");
            setBedToRemove(null);
        } catch(e) {
            toast({ title: "Erro ao remover", variant: "destructive" });
        }
    };

    const getStatusLabel = (status: string) => {
        switch(status) {
            case 'clean': return "Limpo / Disponível";
            case 'discharge_confirmed': return "Alta Confirmada";
            case 'discharge_unconfirmed': return "Previsão de Alta";
            case 'maintenance': return "Em Mecânica";
            default: return status;
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch(status) {
            case 'clean': return "bg-green-500 text-white border-transparent hover:bg-green-600";
            case 'discharge_confirmed': return "bg-yellow-500 text-white border-transparent hover:bg-yellow-600";
            case 'discharge_unconfirmed': return "bg-blue-400 text-white border-transparent hover:bg-blue-500";
            case 'maintenance': return "bg-amber-600 text-white border-transparent hover:bg-amber-700";
            default: return "bg-gray-500 text-white";
        }
    }

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                     <div className="h-6 w-1 bg-purple-500 rounded-full" />
                     <h2 className="text-lg font-semibold tracking-tight text-gray-800">Oferta de Vagas</h2>
                </div>
                <div className="flex gap-2">
                    <InformAvailabilityModal />
                    <StructureManager />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
                {availableBeds.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                        <BedDouble className="h-10 w-10 mb-2 opacity-20" />
                        <p>Nenhuma vaga ofertada.</p>
                    </div>
                ) : (
                    <ScrollArea className="flex-1">
                        <div className="flex flex-col gap-2 p-2">
                            {availableBeds.map(bed => (
                                <div key={bed.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors bg-white shadow-sm">
                                    {/* LEFT: Info */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex flex-col items-start gap-1">
                                            <Badge variant="outline" className={`text-[10px] whitespace-nowrap px-2 py-0.5 rounded-full ${getStatusBadgeColor(bed.status)}`}>
                                                {getStatusLabel(bed.status)}
                                            </Badge>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xs font-semibold text-gray-500 uppercase">{bed.unitName}</span>
                                                <span className="text-sm font-bold text-gray-900">Leito {bed.bedNumber}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CENTER: Timestamp */}
                                    <div className="hidden md:block text-xs text-gray-400">
                                        {bed.updatedAt ? `Atualizado às ${new Date(bed.updatedAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : '-'}
                                    </div>

                                    {/* RIGHT: Actions */}
                                    <div className="flex items-center gap-1">
                                        <TooltipWrapper text="Regular Paciente">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleRegularPatient(bed)}>
                                                <UserPlus className="h-4 w-4" />
                                            </Button>
                                        </TooltipWrapper>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
                                                    <RefreshCw className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleStatusChange(bed.id, 'maintenance')}>
                                                    Em Mecânica
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(bed.id, 'discharge_confirmed')}>
                                                    Alta Confirmada
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(bed.id, 'clean')}>
                                                    Limpo / Pronto
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        <TooltipWrapper text="Remover Disponibilidade">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleRemoveAvailability(bed)}>
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </TooltipWrapper>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
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

            {/* REMOVAL DIALOG */}
            <Dialog open={removalOpen} onOpenChange={setRemovalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" /> Remover Disponibilidade?
                        </DialogTitle>
                        <DialogDescription>
                            O leito será removido da lista de vagas e voltará para o status "Fechado".
                            Esta ação requer justificativa.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Motivo da remoção (ex: Erro de cadastro, Manutenção imprevista)..."
                            value={removalReason}
                            onChange={(e) => setRemovalReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setRemovalOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={confirmRemoval} disabled={removalReason.length < 5}>
                            Confirmar Remoção
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Simple Tooltip Wrapper
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
const TooltipWrapper = ({ children, text }: { children: React.ReactNode, text: string }) => (
    <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent><p>{text}</p></TooltipContent>
    </Tooltip>
);

export default BedAvailability;
