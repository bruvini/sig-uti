import React, { useEffect, useState } from 'react';
import NewRequestModal from "@/components/NewRequestModal";
import RefusalModal from "@/components/RefusalModal";
import EvaluationModal from "@/components/EvaluationModal";
import EditDetailsModal from "@/components/EditDetailsModal";
import { subscribeToPendingRequests, subscribeToWaitingRequests } from "@/services/requestService";
import { RequestData } from "@/types/request";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
    LogOut
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  const [pendingRequests, setPendingRequests] = useState<(RequestData & { id: string })[]>([]);
  const [waitingRequests, setWaitingRequests] = useState<(RequestData & { id: string })[]>([]);

  // Modal States
  const [refusalModalOpen, setRefusalModalOpen] = useState(false);
  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState<(RequestData & { id: string }) | null>(null);
  const [isReview, setIsReview] = useState(false);

  useEffect(() => {
    const unsubPending = subscribeToPendingRequests((requests) => {
      setPendingRequests(requests);
    });
    const unsubWaiting = subscribeToWaitingRequests((requests) => {
        setWaitingRequests(requests);
    });
    return () => {
        unsubPending();
        unsubWaiting();
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
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* HEADER */}
      <header className="w-full bg-white shadow-sm p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-20">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            Cockpit de Regulação UTI
        </h1>
        <NewRequestModal />
      </header>

      <main className="flex-1 p-6 space-y-8 max-w-[1600px] mx-auto w-full">

        {/* 1. BLOCO EDUCATIVO (Flow Diagram) */}
        <section className="w-full bg-muted/30 border border-border rounded-lg p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Fluxo de Regulação</h3>
            <div className="flex flex-wrap items-center justify-between gap-4 md:gap-8 px-4">
                <div className="flex flex-col items-center gap-2 text-center group">
                    <div className="p-3 bg-white rounded-full border shadow-sm group-hover:border-blue-200 transition-colors">
                        <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Solicitação<br/>(Médico Assistente)</span>
                </div>

                <ArrowRight className="h-4 w-4 text-gray-300 hidden md:block" />

                <div className="flex flex-col items-center gap-2 text-center group">
                    <div className="p-3 bg-white rounded-full border shadow-sm group-hover:border-blue-200 transition-colors">
                        <Stethoscope className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Avaliação Técnica<br/>(NIR)</span>
                </div>

                <ArrowRight className="h-4 w-4 text-gray-300 hidden md:block" />

                <div className="flex flex-col items-center gap-2 text-center group">
                    <div className="p-3 bg-white rounded-full border shadow-sm group-hover:border-blue-200 transition-colors">
                        <ClipboardCheck className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Classificação<br/>(Critérios CFM)</span>
                </div>

                <ArrowRight className="h-4 w-4 text-gray-300 hidden md:block" />

                <div className="flex flex-col items-center gap-2 text-center group">
                    <div className="p-3 bg-white rounded-full border shadow-sm group-hover:border-blue-200 transition-colors">
                        <ListOrdered className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Fila de Espera<br/>(Prioridade)</span>
                </div>

                <ArrowRight className="h-4 w-4 text-gray-300 hidden md:block" />

                <div className="flex flex-col items-center gap-2 text-center group">
                    <div className="p-3 bg-white rounded-full border shadow-sm group-hover:border-blue-200 transition-colors">
                        <BedDouble className="h-5 w-5 text-gray-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Alocação de Leito<br/>(UTI)</span>
                </div>
            </div>
        </section>

        {/* 2. KPIs OPERACIONAIS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <Card className="bg-white shadow-sm border-gray-100">
             <CardContent className="p-4">
               <p className="text-sm text-gray-500">Total de Solicitações</p>
               <p className="text-2xl font-bold text-gray-800">{pendingRequests.length + waitingRequests.length}</p>
             </CardContent>
           </Card>
           <Card className="bg-white shadow-sm border-gray-100">
             <CardContent className="p-4">
               <p className="text-sm text-gray-500">Fila de Espera</p>
               <p className="text-2xl font-bold text-blue-600">{waitingRequests.length}</p>
             </CardContent>
           </Card>
           <Card className="bg-white shadow-sm border-gray-100">
             <CardContent className="p-4">
               <p className="text-sm text-gray-500">Ocupação Atual</p>
               <p className="text-2xl font-bold text-gray-800">--%</p>
             </CardContent>
           </Card>
           <Card className="bg-white shadow-sm border-gray-100">
             <CardContent className="p-4">
               <p className="text-sm text-gray-500">Altas em 24h</p>
               <p className="text-2xl font-bold text-green-600">--</p>
             </CardContent>
           </Card>
        </section>

        {/* 3. PENDÊNCIAS DE AVALIAÇÃO (Action Block) */}
        <section className="space-y-4">
             <div className="flex items-center gap-3">
                 <div className="h-8 w-1 bg-yellow-500 rounded-full" />
                 <h2 className="text-lg font-semibold tracking-tight text-gray-800">Pendências de Avaliação (NIR)</h2>
                 <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 font-mono">
                    {pendingRequests.length}
                 </Badge>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 min-h-[120px]">
                 {pendingRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400 border border-dashed border-gray-100 rounded-lg m-2 bg-gray-50">
                        <CheckCircle2 className="h-6 w-6 mb-2 opacity-20" />
                        <p className="text-sm">Caixa de entrada limpa</p>
                    </div>
                 ) : (
                     <ScrollArea className="max-h-[400px]">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                            {pendingRequests.map((req) => (
                                <div key={req.id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                                                {getRequestTypeLabel(req.requestType)}
                                            </Badge>
                                            <span className="text-[10px] text-gray-400 font-mono">
                                                {req.createdAt ? new Date(req.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Now'}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-sm truncate" title={req.patientName}>{req.patientName}</h3>
                                        <p className="text-xs text-gray-500 mb-2">CNS: {req.cns}</p>

                                        <div className="mb-3">
                                            {req.requestType === 'surgical' ? (
                                                <p className="text-xs text-gray-600 truncate" title={req.surgeryType}>
                                                   {req.surgeryType}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-gray-600 line-clamp-2" title={req.clinicalReason}>
                                                   {req.clinicalReason}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 justify-end pt-2 border-t mt-auto">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleRefuse(req)}
                                                >
                                                    <XCircle className="h-5 w-5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Recusar Solicitação</p>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                                    onClick={() => handleEvaluate(req)}
                                                >
                                                    <ClipboardCheck className="h-5 w-5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Avaliar Prioridade</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            ))}
                         </div>
                     </ScrollArea>
                 )}
             </div>
        </section>

        {/* 4. ZONA DE GUERRA (Split View) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* COLUNA ESQUERDA: FILAS DE ESPERA */}
            <div className="lg:col-span-2 space-y-8">

                {/* 4.1 Fila de Internação / Enfermarias */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             <div className="h-6 w-1 bg-blue-500 rounded-full" />
                             <h2 className="text-lg font-semibold tracking-tight text-gray-800">Pacientes Internados / Enfermarias</h2>
                         </div>
                         <Badge variant="outline" className="font-mono text-gray-600">{inpatientQueue.length}</Badge>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <ScrollArea className="h-[300px]">
                            {inpatientQueue.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-400 text-sm p-8">
                                    Nenhum paciente nesta fila.
                                </div>
                            ) : (
                                <div className="p-4 space-y-2">
                                     {inpatientQueue.map((req) => (
                                        <div key={req.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-blue-200 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Badge className={`${getPriorityBadgeColor(req.cfmPriority)} text-white border-0 h-9 w-9 rounded-full flex items-center justify-center p-0 shadow-sm text-sm`}>
                                                            P{req.cfmPriority}
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Prioridade {req.cfmPriority}</TooltipContent>
                                                </Tooltip>

                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-sm text-gray-900">{req.patientName}</p>
                                                        {req.sisregId && <Badge variant="secondary" className="text-[10px] h-4 px-1 text-gray-500">SISREG {req.sisregId}</Badge>}
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate max-w-[250px] md:max-w-[400px]">
                                                        {req.clinicalReason}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-gray-500" onClick={() => handleEdit(req)}>
                                                    <Edit2 className="h-3 w-3 mr-1" /> Editar
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-blue-600 font-medium" onClick={() => handleReview(req)}>Revisar</Button>
                                            </div>
                                        </div>
                                     ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>

                {/* 4.2 Fila Cirúrgica / Eletivos */}
                <div className="space-y-4">
                     <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             <div className="h-6 w-1 bg-green-500 rounded-full" />
                             <h2 className="text-lg font-semibold tracking-tight text-gray-800">Pacientes Cirúrgicos / Eletivos</h2>
                         </div>
                         <Badge variant="outline" className="font-mono text-gray-600">{surgicalQueue.length}</Badge>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <ScrollArea className="h-[250px]">
                            {surgicalQueue.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-400 text-sm p-8">
                                    Nenhum paciente nesta fila.
                                </div>
                            ) : (
                                <div className="p-4 space-y-2">
                                     {surgicalQueue.map((req) => (
                                        <div key={req.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-green-200 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Badge className={`${getPriorityBadgeColor(req.cfmPriority)} text-white border-0 h-9 w-9 rounded-full flex items-center justify-center p-0 shadow-sm text-sm`}>
                                                            P{req.cfmPriority}
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Prioridade {req.cfmPriority}</TooltipContent>
                                                </Tooltip>

                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-sm text-gray-900">{req.patientName}</p>
                                                        {req.sisregId && <Badge variant="secondary" className="text-[10px] h-4 px-1 text-gray-500">SISREG {req.sisregId}</Badge>}
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate max-w-[250px] md:max-w-[400px]">
                                                        {req.surgeryType} - {req.surgeonName}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-gray-500" onClick={() => handleEdit(req)}>
                                                    <Edit2 className="h-3 w-3 mr-1" /> Editar
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-blue-600 font-medium" onClick={() => handleReview(req)}>Revisar</Button>
                                            </div>
                                        </div>
                                     ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>

            </div>

            {/* COLUNA DIREITA: LEITOS */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                     <div className="h-6 w-1 bg-purple-500 rounded-full" />
                     <h2 className="text-lg font-semibold tracking-tight text-gray-800">Disponibilidade de Leitos (UTI)</h2>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex items-center justify-center relative overflow-hidden bg-grid-slate-100">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/80 backdrop-blur-sm max-w-xs mx-auto">
                        <BedDouble className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                        <h4 className="font-medium text-gray-600">Mapa de Leitos</h4>
                        <p className="text-sm text-gray-400 mt-2">Funcionalidade de gestão visual de leitos e isolamentos em desenvolvimento.</p>
                    </div>
                </div>
            </div>

        </div>

        {/* 5. BLOCO DE SAÍDA / GIRO DE LEITO */}
        <section className="border border-green-200 bg-green-50/50 rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full text-green-700">
                    <LogOut className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-green-900">Critérios de Alta / Giro de Leito</h3>
                    <p className="text-sm text-green-700">Pacientes em Desmame / Previsão de Alta nas próximas 24h</p>
                </div>
            </div>
            <Button variant="outline" className="border-green-300 text-green-800 hover:bg-green-100">
                Ver Lista de Altas
            </Button>
        </section>

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
    </div>
  );
};

export default Dashboard;
