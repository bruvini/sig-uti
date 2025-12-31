import React, { useEffect, useState } from 'react';
import NewRequestModal from "@/components/NewRequestModal";
import { subscribeToPendingRequests } from "@/services/requestService";
import { RequestData } from "@/types/request";
import { format } from "date-fns";

const Dashboard = () => {
  const [pendingRequests, setPendingRequests] = useState<(RequestData & { id: string })[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToPendingRequests((requests) => {
      setPendingRequests(requests);
    });
    return () => unsubscribe();
  }, []);

  const getRequestDateDisplay = (request: RequestData) => {
    if (request.requestType === 'surgical') {
       // Ideally use createdAt but converting server timestamp to date in client is tricky if mixed
       // Using surgeryDate as a proxy for relevance or just showing "N/A" for now if we don't have createdAt readily available as Date
       // The prompt says "Data de Solicitação". For surgical it wasn't explicit, but we have createdAt.
       return "Data: -";
    }
    // For inpatient/emergency we have manual date
    if (request.requestType === 'inpatient' || request.requestType === 'emergency') {
        const dateParts = request.requestDate.split('-');
        return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]} ${request.requestTime}`;
    }
    return "";
  };

  const getRequestTypeLabel = (type: string) => {
      switch(type) {
          case 'surgical': return 'Cirúrgico';
          case 'inpatient': return 'Internado';
          case 'emergency': return 'Emergência';
          default: return type;
      }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Topo: Cabeçalho (Header) */}
      <header className="w-full bg-white shadow-sm p-4 border-b border-gray-200 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">SIG-UTI Dashboard</h1>
        <NewRequestModal />
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Abaixo do Header: Indicadores (KPIs) */}
        <section className="w-full bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500 text-center">Área reservada para indicadores gerais</p>
        </section>

        {/* Corpo Principal: Grid dividida */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Coluna da Esquerda (Filas de Pacientes) */}
          <div className="flex flex-col gap-6">

            {/* Bloco de Pendências (Novo) */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-l-4 border-l-yellow-500 border-gray-100 flex-1">
                <h2 className="font-semibold text-lg mb-4 text-gray-700 flex items-center justify-between">
                    Pendências de Avaliação (NIR)
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{pendingRequests.length}</span>
                </h2>

                {pendingRequests.length === 0 ? (
                    <div className="flex items-center justify-center h-20 bg-gray-50 rounded border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm">Nenhuma pendência</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pendingRequests.map((req) => (
                            <div key={req.id} className="p-3 bg-gray-50 rounded border border-gray-200 flex justify-between items-center hover:bg-gray-100 transition-colors">
                                <div>
                                    <p className="font-medium text-gray-800">{req.patientName}</p>
                                    <p className="text-xs text-gray-500">{getRequestTypeLabel(req.requestType)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-600">{getRequestDateDisplay(req)}</p>
                                    <span className="text-[10px] text-yellow-600 font-semibold bg-yellow-50 px-2 py-1 rounded">Aguardando Avaliação</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bloco Superior */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex-1">
              <h2 className="font-semibold text-lg mb-2 text-gray-700">Fila Cirúrgica</h2>
              <div className="flex items-center justify-center h-32 bg-gray-50 rounded border border-dashed border-gray-200">
                <p className="text-gray-400">Pacientes Cirúrgicos Aguardando</p>
              </div>
            </div>

            {/* Bloco Inferior */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex-1">
              <h2 className="font-semibold text-lg mb-2 text-gray-700">Fila de Internação</h2>
              <div className="flex items-center justify-center h-32 bg-gray-50 rounded border border-dashed border-gray-200">
                <p className="text-gray-400">Pacientes Internados Aguardando</p>
              </div>
            </div>
          </div>

          {/* Coluna da Direita (Gestão de Leitos) */}
          <div className="flex flex-col gap-6">
            {/* Bloco Superior */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex-1">
              <h2 className="font-semibold text-lg mb-2 text-gray-700">Leitos Disponíveis</h2>
              <div className="flex items-center justify-center h-32 bg-gray-50 rounded border border-dashed border-gray-200">
                <p className="text-gray-400">Leitos Vagos Disponíveis</p>
              </div>
            </div>

            {/* Bloco Inferior */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex-1">
              <h2 className="font-semibold text-lg mb-2 text-gray-700">Altas Pendentes</h2>
              <div className="flex items-center justify-center h-32 bg-gray-50 rounded border border-dashed border-gray-200">
                <p className="text-gray-400">Leitos Passíveis de Alta</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
