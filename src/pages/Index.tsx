import React from 'react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Topo: Cabeçalho (Header) */}
      <header className="w-full bg-white shadow-sm p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">SIG-UTI Dashboard</h1>
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
