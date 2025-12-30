import { useState } from "react";
import { ICURequest, CFMPriority } from "@/types/icu";
import { RequestCard } from "./RequestCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, SortAsc } from "lucide-react";
import { cn } from "@/lib/utils";

interface RequestQueueProps {
  requests: ICURequest[];
  onSelectRequest: (request: ICURequest) => void;
}

export function RequestQueue({ requests, onSelectRequest }: RequestQueueProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"priority" | "time">("priority");

  const filteredRequests = requests
    .filter((req) => {
      const matchesSearch =
        req.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.patient.medicalRecord.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority =
        priorityFilter === "all" || req.cfmPriority === parseInt(priorityFilter);
      
      return matchesSearch && matchesPriority && req.status === "pending";
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        return a.cfmPriority - b.cfmPriority;
      }
      return new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime();
    });

  const urgentCount = filteredRequests.filter(r => r.cfmPriority <= 2).length;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente, prontuário ou diagnóstico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="1">Prioridade 1</SelectItem>
              <SelectItem value="2">Prioridade 2</SelectItem>
              <SelectItem value="3">Prioridade 3</SelectItem>
              <SelectItem value="4">Prioridade 4</SelectItem>
              <SelectItem value="5">Prioridade 5</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as "priority" | "time")}>
            <SelectTrigger className="w-40">
              <SortAsc className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Por Prioridade</SelectItem>
              <SelectItem value="time">Por Tempo de Espera</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">
          {filteredRequests.length} solicitações pendentes
        </span>
        {urgentCount > 0 && (
          <span className="flex items-center gap-1 font-medium text-priority-1">
            <span className="h-2 w-2 animate-pulse-soft rounded-full bg-priority-1" />
            {urgentCount} urgentes (P1/P2)
          </span>
        )}
      </div>

      {/* Queue */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredRequests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            onSelect={onSelectRequest}
          />
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Filter className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">
            Nenhuma solicitação encontrada
          </h3>
          <p className="text-sm text-muted-foreground">
            Ajuste os filtros ou aguarde novas solicitações.
          </p>
        </div>
      )}
    </div>
  );
}
