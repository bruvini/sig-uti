import { MainLayout } from "@/components/layout/MainLayout";
import { mockRequests } from "@/data/mockData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { Search, Download, Filter } from "lucide-react";
import { useState } from "react";

const AuditPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Flatten all history entries from all requests
  const allAuditEntries = mockRequests.flatMap((req) =>
    req.history.map((entry) => ({
      ...entry,
      patientName: req.patient.name,
      patientId: req.patient.medicalRecord,
      requestId: req.id,
      priority: req.cfmPriority,
    }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredEntries = allAuditEntries.filter(
    (entry) =>
      entry.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.physician.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Auditoria</h1>
            <p className="text-muted-foreground">
              Registro de todas as ações realizadas no sistema
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por paciente, médico ou ação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Audit Table */}
        <div className="card-clinical overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Profissional</TableHead>
                <TableHead className="max-w-[300px]">Justificativa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-xs">
                    {format(entry.date, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{entry.patientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.patientId}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={entry.priority} size="sm" />
                  </TableCell>
                  <TableCell>
                    <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium">
                      {entry.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{entry.physician}</TableCell>
                  <TableCell className="max-w-[300px] text-sm text-muted-foreground">
                    {entry.justification}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              Nenhum registro encontrado para os filtros aplicados.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AuditPage;
