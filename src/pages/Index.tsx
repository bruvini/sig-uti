import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { PriorityDistribution } from "@/components/dashboard/PriorityDistribution";
import { BedOccupancy } from "@/components/dashboard/BedOccupancy";
import { RequestQueue } from "@/components/queue/RequestQueue";
import { RequestDetailModal } from "@/components/modals/RequestDetailModal";
import { EthicsNotice } from "@/components/shared/EthicsNotice";
import { mockRequests, mockStats } from "@/data/mockData";
import { ICURequest } from "@/types/icu";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

const Index = () => {
  const [selectedRequest, setSelectedRequest] = useState<ICURequest | null>(null);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Central de Regulação de Leitos UTI
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
            Sistema operacional
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Solicitações Pendentes"
            value={mockStats.pendingRequests}
            subtitle="Aguardando avaliação"
            icon={ClipboardList}
            variant="warning"
          />
          <StatCard
            title="Tempo Médio de Espera"
            value={`${mockStats.averageWaitTime}h`}
            subtitle="Para aprovação"
            icon={Clock}
            variant="primary"
          />
          <StatCard
            title="Aprovadas Hoje"
            value={mockStats.approvedToday}
            subtitle="+3 vs ontem"
            icon={CheckCircle}
            variant="success"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Negadas Hoje"
            value={mockStats.deniedToday}
            subtitle="Com justificativa CFM"
            icon={XCircle}
            variant="destructive"
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 lg:grid-cols-2">
          <PriorityDistribution data={mockStats.requestsByPriority} />
          <BedOccupancy
            available={mockStats.availableBeds}
            total={mockStats.totalBeds}
            occupancyRate={mockStats.occupancyRate}
          />
        </div>

        {/* Ethics Notice */}
        <EthicsNotice />

        {/* Queue Preview */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Fila de Espera</h2>
              <p className="text-sm text-muted-foreground">
                Solicitações ordenadas por prioridade CFM
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-priority-1" />
              <span className="text-muted-foreground">
                {mockRequests.filter((r) => r.cfmPriority <= 2 && r.status === "pending").length} pacientes urgentes
              </span>
            </div>
          </div>

          <RequestQueue
            requests={mockRequests}
            onSelectRequest={setSelectedRequest}
          />
        </div>

        {/* Request Detail Modal */}
        <RequestDetailModal
          request={selectedRequest}
          open={!!selectedRequest}
          onOpenChange={(open) => !open && setSelectedRequest(null)}
          onApprove={(req) => console.log("Approved:", req)}
          onDeny={(req, reason, obs) => console.log("Denied:", req, reason, obs)}
          onReevaluate={(req, priority, just) =>
            console.log("Reevaluated:", req, priority, just)
          }
        />
      </div>
    </MainLayout>
  );
};

export default Index;
