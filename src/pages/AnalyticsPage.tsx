import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { PriorityDistribution } from "@/components/dashboard/PriorityDistribution";
import { mockStats } from "@/data/mockData";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  XCircle,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const weeklyData = [
  { day: "Seg", aprovadas: 12, negadas: 3, reavaliadas: 2 },
  { day: "Ter", aprovadas: 15, negadas: 4, reavaliadas: 3 },
  { day: "Qua", aprovadas: 10, negadas: 2, reavaliadas: 1 },
  { day: "Qui", aprovadas: 18, negadas: 5, reavaliadas: 4 },
  { day: "Sex", aprovadas: 14, negadas: 3, reavaliadas: 2 },
  { day: "Sáb", aprovadas: 8, negadas: 2, reavaliadas: 1 },
  { day: "Dom", aprovadas: 6, negadas: 1, reavaliadas: 0 },
];

const waitTimeData = [
  { priority: "P1", tempo: 1.2 },
  { priority: "P2", tempo: 2.8 },
  { priority: "P3", tempo: 5.4 },
  { priority: "P4", tempo: 8.2 },
  { priority: "P5", tempo: 12.1 },
];

const denialReasons = [
  { name: "Critérios CFM", value: 35, color: "hsl(210, 70%, 50%)" },
  { name: "Limitação terapêutica", value: 25, color: "hsl(25, 95%, 53%)" },
  { name: "Baixa recuperação", value: 20, color: "hsl(45, 93%, 47%)" },
  { name: "Semi-intensiva", value: 15, color: "hsl(142, 70%, 40%)" },
  { name: "Outros", value: 5, color: "hsl(215, 15%, 55%)" },
];

const AnalyticsPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Indicadores</h1>
          <p className="text-muted-foreground">
            Métricas alinhadas à Resolução CFM 2.156/2016
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Solicitações"
            value={mockStats.totalRequests}
            subtitle="Este mês"
            icon={BarChart3}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Taxa de Aprovação"
            value="76%"
            subtitle="Média mensal"
            icon={CheckCircle}
            variant="success"
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Tempo Médio Espera"
            value={`${mockStats.averageWaitTime}h`}
            subtitle="Geral"
            icon={Clock}
            variant="primary"
          />
          <StatCard
            title="Reavaliações"
            value="23"
            subtitle="Mudanças de prioridade"
            icon={RefreshCw}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Weekly Activity */}
          <div className="card-clinical p-5">
            <h3 className="mb-4 font-semibold">Atividade Semanal</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="aprovadas" fill="hsl(142, 70%, 40%)" name="Aprovadas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="negadas" fill="hsl(0, 72%, 51%)" name="Negadas" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reavaliadas" fill="hsl(210, 70%, 50%)" name="Reavaliadas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Wait Time by Priority */}
          <div className="card-clinical p-5">
            <h3 className="mb-4 font-semibold">Tempo Médio de Espera por Prioridade (horas)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={waitTimeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" fontSize={12} />
                <YAxis dataKey="priority" type="category" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value}h`, 'Tempo médio']}
                />
                <Bar dataKey="tempo" radius={[0, 4, 4, 0]}>
                  {waitTimeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`hsl(var(--priority-${index + 1}))`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Distribution */}
          <PriorityDistribution data={mockStats.requestsByPriority} />

          {/* Denial Reasons */}
          <div className="card-clinical p-5">
            <h3 className="mb-4 font-semibold">Motivos de Negativa</h3>
            <div className="flex items-center gap-8">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={denialReasons}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {denialReasons.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Percentual']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {denialReasons.map((reason) => (
                  <div key={reason.name} className="flex items-center gap-2 text-sm">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: reason.color }}
                    />
                    <span className="flex-1 text-muted-foreground">{reason.name}</span>
                    <span className="font-medium">{reason.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
