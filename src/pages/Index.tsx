import React, { useEffect, useState } from 'react';
import NewRequestModal from "@/components/NewRequestModal";
import RefusalModal from "@/components/RefusalModal";
import EvaluationModal from "@/components/EvaluationModal";
import { subscribeToPendingRequests, subscribeToWaitingRequests } from "@/services/requestService";
import { RequestData } from "@/types/request";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Clock, Activity, AlertCircle, CheckCircle2 } from "lucide-react";

const Dashboard = () => {
  const [pendingRequests, setPendingRequests] = useState<(RequestData & { id: string })[]>([]);
  const [waitingRequests, setWaitingRequests] = useState<(RequestData & { id: string })[]>([]);

  // Modal States
  const [refusalModalOpen, setRefusalModalOpen] = useState(false);
  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full bg-white shadow-sm p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            SIG-UTI Dashboard
        </h1>
        <NewRequestModal />
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* KPI Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
               <p className="text-sm text-gray-500">Pendentes de Avaliação</p>
               <p className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
           </div>
           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
               <p className="text-sm text-gray-500">Aguardando Vaga</p>
               <p className="text-2xl font-bold text-blue-600">{waitingRequests.length}</p>
           </div>
           {/* Placeholders for future real stats */}
           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
               <p className="text-sm text-gray-500">Ocupação Atual</p>
               <p className="text-2xl font-bold text-gray-800">--%</p>
           </div>
           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
               <p className="text-sm text-gray-500">Altas nas últimas 24h</p>
               <p className="text-2xl font-bold text-green-600">--</p>
           </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Column: Queues */}
          <div className="flex flex-col gap-6">

            {/* Pending Requests Block */}
            <div className="bg-white rounded-lg shadow-sm border border-l-4 border-l-yellow-500 border-gray-200 flex flex-col max-h-[500px]">
                <div className="p-4 border-b bg-yellow-50/30 flex justify-between items-center">
                    <h2 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        Pendências de Avaliação (NIR)
                    </h2>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                        {pendingRequests.length}
                    </Badge>
                </div>

                <ScrollArea className="flex-1 p-4">
                    {pendingRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-gray-400 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50">
                            <CheckCircle2 className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">Nenhuma pendência no momento</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingRequests.map((req) => (
                                <div key={req.id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{req.patientName}</h3>
                                            <p className="text-sm text-gray-500">CNS: {req.cns}</p>
                                        </div>
                                        <Badge variant="outline" className="capitalize">
                                            {getRequestTypeLabel(req.requestType)}
                                        </Badge>
                                    </div>

                                    <div className="mb-4">
                                        {req.requestType === 'surgical' ? (
                                             <p className="text-sm text-gray-600">
                                                <span className="font-medium">Procedimento:</span> {req.surgeryType}
                                             </p>
                                        ) : (
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                <span className="font-medium">Motivo:</span> {req.clinicalReason}
                                            </p>
                                        )}
                                         <p className="text-xs text-gray-400 mt-1">
                                            Solicitado em: {req.requestDate ? `${req.requestDate} ${req.requestTime || ''}` : 'Data Sistema'}
                                         </p>
                                    </div>

                                    <div className="flex gap-2 pt-2 border-t">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleRefuse(req)}
                                        >
                                            Recusar
                                        </Button>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                                            onClick={() => handleEvaluate(req)}
                                        >
                                            Avaliar
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Surgical Queue */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col max-h-[400px]">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                   <h2 className="font-semibold text-lg text-gray-700">Fila Cirúrgica</h2>
                   <Badge variant="outline">{surgicalQueue.length}</Badge>
                </div>
                <ScrollArea className="flex-1 p-4">
                    {surgicalQueue.length === 0 ? (
                        <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
                            Fila vazia
                        </div>
                    ) : (
                        <div className="space-y-3">
                             {surgicalQueue.map((req) => (
                                <div key={req.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <Badge className={`${getPriorityBadgeColor(req.cfmPriority)} text-white border-0 h-8 w-8 rounded-full flex items-center justify-center p-0`}>
                                            P{req.cfmPriority}
                                        </Badge>
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">{req.patientName}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-[150px]">{req.surgeryType}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleReview(req)}>Revisar</Button>
                                </div>
                             ))}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Inpatient Queue */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col max-h-[400px]">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                   <h2 className="font-semibold text-lg text-gray-700">Fila de Internação</h2>
                   <Badge variant="outline">{inpatientQueue.length}</Badge>
                </div>
                <ScrollArea className="flex-1 p-4">
                     {inpatientQueue.length === 0 ? (
                        <div className="flex items-center justify-center h-24 text-gray-400 text-sm">
                            Fila vazia
                        </div>
                    ) : (
                        <div className="space-y-3">
                             {inpatientQueue.map((req) => (
                                <div key={req.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <Badge className={`${getPriorityBadgeColor(req.cfmPriority)} text-white border-0 h-8 w-8 rounded-full flex items-center justify-center p-0`}>
                                            P{req.cfmPriority}
                                        </Badge>
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">{req.patientName}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-[150px]">{req.clinicalReason}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleReview(req)}>Revisar</Button>
                                </div>
                             ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
          </div>

          {/* Right Column: Bed Management (Mocked for now) */}
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex-1">
              <h2 className="font-semibold text-lg mb-2 text-gray-700">Leitos Disponíveis</h2>
              <div className="flex items-center justify-center h-32 bg-gray-50 rounded border border-dashed border-gray-200">
                <p className="text-gray-400">Leitos Vagos Disponíveis</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex-1">
              <h2 className="font-semibold text-lg mb-2 text-gray-700">Altas Pendentes</h2>
              <div className="flex items-center justify-center h-32 bg-gray-50 rounded border border-dashed border-gray-200">
                <p className="text-gray-400">Leitos Passíveis de Alta</p>
              </div>
            </div>
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
          </>
      )}
    </div>
  );
};

export default Dashboard;
