import React, { useEffect, useState } from 'react';
import NewRequestModal from "@/components/NewRequestModal";
import RefusalModal from "@/components/RefusalModal";
import EvaluationModal from "@/components/EvaluationModal";
import EditDetailsModal from "@/components/EditDetailsModal";
import BedAvailability from "@/components/BedAvailability";
import { subscribeToPendingRequests, subscribeToWaitingRequests, subscribeToRegulatedRequests } from "@/services/requestService";
import { confirmAdmission, cancelRegulation } from "@/services/bedService";

import { RequestData } from "@/types/request";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea"; // New import
import {
    Activity,
    Clock,
    CheckCircle2,
    XCircle,
    ClipboardCheck,
    Edit2,
    FileText,
    Stethoscope,
    ListOrdered,
    BedDouble,
    ArrowRight,
    LogOut,
    Ambulance,
    MapPin,
    AlertTriangle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

const Dashboard = () => {
  const [pendingRequests, setPendingRequests] = useState<(RequestData & { id: string })[]>([]);
  const [waitingRequests, setWaitingRequests] = useState<(RequestData & { id: string })[]>([]);
  const [regulatedRequests, setRegulatedRequests] = useState<(RequestData & { id: string })[]>([]);

  // Modal States
  const [refusalModalOpen, setRefusalModalOpen] = useState(false);
  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Cancel Regulation State
  const [cancelRegOpen, setCancelRegOpen] = useState(false);
  const [cancelRegRequest, setCancelRegRequest] = useState<(RequestData & { id: string }) | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const [selectedRequest, setSelectedRequest] = useState<(RequestData & { id: string }) | null>(null);
  const [isReview, setIsReview] = useState(false);

  useEffect(() => {
    const unsubPending = subscribeToPendingRequests(setPendingRequests);
    const unsubWaiting = subscribeToWaitingRequests(setWaitingRequests);
    const unsubRegulated = subscribeToRegulatedRequests(setRegulatedRequests);
    return () => {
        unsubPending();
        unsubWaiting();
        unsubRegulated();
    };
  }, []);

  const handleRefuse = (req: RequestData & { id: string }) => {
      setSelectedRequest(req);
      setRefusalModalOpen(true);
  };

  const handleEvaluate = (req: RequestData & { id: string }) => {
      setSelectedRequest(req);
      setIsReview(false);
      setEvaluationModalOpen(true);
  };

  const handleReview = (req: RequestData & { id: string }) => {
    setSelectedRequest(req);
    setIsReview(true);
    setEvaluationModalOpen(true);
  };

  const handleEdit = (req: RequestData & { id: string }) => {
    setSelectedRequest(req);
    setEditModalOpen(true);
  };

  const handleAdmission = async (reqId: string) => {
      try {
          await confirmAdmission(reqId);
      } catch (e) {
          console.error(e);
      }
  };

  const handleCancelRegulationClick = (req: RequestData & { id: string }) => {
      setCancelRegRequest(req);
      setCancelRegOpen(true);
  }

  const confirmCancelRegulation = async () => {
      if (!cancelRegRequest || !cancelRegRequest.assignedBedId || cancelReason.length < 5) return;
      try {
          await cancelRegulation(cancelRegRequest.id, cancelRegRequest.assignedBedId, cancelReason);
          setCancelRegOpen(false);
          setCancelRegRequest(null);
          setCancelReason("");
      } catch (e) {
          console.error(e);
      }
  }

  const getRequestTypeLabel = (type: string) => {
      switch(type) {
          case 'surgical': return 'Cirúrgico';
          case 'inpatient': return 'Internado';
          case 'emergency': return 'Emergência';
          default: return type;
      }
  };

  const getPriorityBadgeColor = (p?: number) => {
    switch(p) {
        case 1: return "bg-red-500 hover:bg-red-600";
        case 2: return "bg-orange-500 hover:bg-orange-600";
        case 3: return "bg-yellow-500 hover:bg-yellow-600";
        case 4: return "bg-blue-500 hover:bg-blue-600";
        case 5: return "bg-gray-500 hover:bg-gray-600";
        default: return "bg-gray-400";
    }
  };

  const surgicalQueue = waitingRequests.filter(r => r.requestType === 'surgical');
  const inpatientQueue = waitingRequests.filter(r => r.requestType === 'inpatient' || r.requestType === 'emergency');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-hidden h-screen">
      {/* HEADER */}
      <header className="w-full bg-white shadow-sm p-3 border-b border-gray-200 flex justify-between items-center shrink-0 z-20">
        <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Cockpit de Regulação
        </h1>
        <div className="flex gap-2">
            <NewRequestModal />
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4 max-w-[1920px] mx-auto w-full overflow-y-auto">

        {/* TOP SECTION (Reduced Height) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* KPI 1 */}
            <Card className="bg-white shadow-sm border-gray-100">
                <CardContent className="p-3 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">Pendências</p>
                        <p className="text-xl font-bold text-yellow-600">{pendingRequests.length}</p>
                    </div>
                    <Clock className="h-4 w-4 text-yellow-200" />
                </CardContent>
            </Card>
             {/* KPI 2 */}
             <Card className="bg-white shadow-sm border-gray-100">
                <CardContent className="p-3 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">Fila Espera</p>
                        <p className="text-xl font-bold text-blue-600">{waitingRequests.length}</p>
                    </div>
                    <ListOrdered className="h-4 w-4 text-blue-200" />
                </CardContent>
            </Card>
             {/* KPI 3 */}
             <Card className="bg-white shadow-sm border-gray-100">
                <CardContent className="p-3 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">Em Trânsito</p>
                        <p className="text-xl font-bold text-orange-600">{regulatedRequests.length}</p>
                    </div>
                    <Ambulance className="h-4 w-4 text-orange-200" />
                </CardContent>
            </Card>
             {/* KPI 4 */}
             <Card className="bg-white shadow-sm border-gray-100">
                <CardContent className="p-3 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">Altas 24h</p>
                        <p className="text-xl font-bold text-green-600">--</p>
                    </div>
                    <LogOut className="h-4 w-4 text-green-200" />
                </CardContent>
            </Card>
        </div>

        {/* PENDING REQUESTS (Compact) */}
        {pendingRequests.length > 0 && (
            <div className="bg-yellow-50/50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-yellow-800">Novas Solicitações</h3>
                    <Badge variant="secondary" className="bg-yellow-100 text-[10px] h-5">{pendingRequests.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {pendingRequests.map((req) => (
                        <div key={req.id} className="bg-white p-3 rounded border shadow-sm flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-sm truncate" title={req.patientName}>{req.patientName}</span>
                                <Badge variant="outline" className="text-[10px] h-4 px-1">{getRequestTypeLabel(req.requestType)}</Badge>
                            </div>
                            <div className="flex justify-end gap-1 mt-auto">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRefuse(req)}>
                                    <XCircle className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" onClick={() => handleEvaluate(req)}>
                                    <ClipboardCheck className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* REGULATED (Compact) */}
        {regulatedRequests.length > 0 && (
             <div className="bg-orange-50/50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-orange-800">Em Trânsito / Admissão</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {regulatedRequests.map(req => (
                        <div key={req.id} className="bg-white p-3 rounded border border-orange-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="font-bold text-sm">{req.patientName}</p>
                                <p className="text-[10px] text-gray-500">Leito Definido</p>
                            </div>
                            <div className="flex gap-1">
                                <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => handleCancelRegulationClick(req)}>Cancelar</Button>
                                <Button size="sm" className="h-7 text-[10px] bg-green-600 hover:bg-green-700" onClick={() => handleAdmission(req.id)}>Admitir</Button>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        )}

        {/* WAR ZONE: SPLIT VIEW (FIXED HEIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-320px)] min-h-[400px]">

            {/* LEFT: PATIENT QUEUE (7/12) */}
            <div className="lg:col-span-7 flex flex-col gap-4 h-full overflow-hidden">

                {/* QUEUE 1: INPATIENT */}
                <div className="flex-1 bg-white rounded-lg border shadow-sm flex flex-col overflow-hidden">
                    <div className="p-3 border-b bg-gray-50 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-1 bg-blue-500 rounded-full" />
                            <h3 className="font-semibold text-sm">Internados / Enfermarias</h3>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{inpatientQueue.length}</Badge>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-3 space-y-2">
                            {inpatientQueue.map((req) => (
                                <div key={req.id} className="flex items-center justify-between p-2 bg-white border rounded hover:border-blue-300 transition-colors">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <Badge className={`${getPriorityBadgeColor(req.cfmPriority)} text-white border-0 h-7 w-7 rounded-full flex items-center justify-center p-0 text-xs shrink-0`}>
                                            P{req.cfmPriority}
                                        </Badge>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-sm truncate">{req.patientName}</p>
                                                {req.sisregId && <Badge variant="secondary" className="text-[10px] h-4 px-1">SISREG {req.sisregId}</Badge>}
                                            </div>
                                            {/* LOCATION PIN */}
                                            {(req.requestType === 'inpatient' || req.requestType === 'emergency') && (req.sector || req.bed) && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="truncate">Setor: {req.sector} • Leito: {req.bed}</span>
                                                </div>
                                            )}
                                            <p className="text-[10px] text-gray-400 mt-0.5 truncate">{req.clinicalReason}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={() => handleEdit(req)}>
                                            <Edit2 className="h-3 w-3 mr-1" /> Editar
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-blue-600 font-medium" onClick={() => handleReview(req)}>Revisar</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* QUEUE 2: SURGICAL */}
                <div className="flex-1 bg-white rounded-lg border shadow-sm flex flex-col overflow-hidden">
                    <div className="p-3 border-b bg-gray-50 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-1 bg-green-500 rounded-full" />
                            <h3 className="font-semibold text-sm">Cirúrgicos / Eletivos</h3>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{surgicalQueue.length}</Badge>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-3 space-y-2">
                            {surgicalQueue.map((req) => (
                                <div key={req.id} className="flex items-center justify-between p-2 bg-white border rounded hover:border-green-300 transition-colors">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <Badge className={`${getPriorityBadgeColor(req.cfmPriority)} text-white border-0 h-7 w-7 rounded-full flex items-center justify-center p-0 text-xs shrink-0`}>
                                            P{req.cfmPriority}
                                        </Badge>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm truncate">{req.patientName}</p>
                                            <p className="text-xs text-gray-500 truncate">{req.surgeryType}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={() => handleEdit(req)}>
                                            <Edit2 className="h-3 w-3 mr-1" /> Editar
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-blue-600 font-medium" onClick={() => handleReview(req)}>Revisar</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

            </div>

            {/* RIGHT: BED MANAGEMENT (5/12) */}
            <div className="lg:col-span-5 h-full overflow-hidden flex flex-col">
                <BedAvailability />
            </div>

        </div>

      </main>

      {/* Render Modals */}
      {selectedRequest && (
          <>
            <RefusalModal
                requestId={selectedRequest.id}
                patientName={selectedRequest.patientName}
                open={refusalModalOpen}
                onOpenChange={setRefusalModalOpen}
            />
            <EvaluationModal
                request={selectedRequest}
                open={evaluationModalOpen}
                onOpenChange={setEvaluationModalOpen}
                isReview={isReview}
            />
            <EditDetailsModal
                request={selectedRequest}
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
            />
          </>
      )}

      {/* Cancel Regulation Dialog */}
      <Dialog open={cancelRegOpen} onOpenChange={setCancelRegOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" /> Cancelar Regulação?
                  </DialogTitle>
                  <DialogDescription>
                      O paciente voltará para a fila de espera e o leito ficará disponível novamente.
                      Justificativa obrigatória.
                  </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                  <Textarea
                      placeholder="Motivo do cancelamento..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                  />
              </div>
              <DialogFooter>
                  <Button variant="ghost" onClick={() => setCancelRegOpen(false)}>Voltar</Button>
                  <Button variant="destructive" onClick={confirmCancelRegulation} disabled={cancelReason.length < 5}>Confirmar Cancelamento</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
