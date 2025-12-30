import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { RequestQueue } from "@/components/queue/RequestQueue";
import { RequestDetailModal } from "@/components/modals/RequestDetailModal";
import { mockRequests } from "@/data/mockData";
import { ICURequest } from "@/types/icu";

const QueuePage = () => {
  const [selectedRequest, setSelectedRequest] = useState<ICURequest | null>(null);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fila de Espera</h1>
          <p className="text-muted-foreground">
            Gerencie as solicitações de leitos de UTI pendentes
          </p>
        </div>

        <RequestQueue
          requests={mockRequests}
          onSelectRequest={setSelectedRequest}
        />

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

export default QueuePage;
