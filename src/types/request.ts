import { z } from "zod";
import { Timestamp } from "firebase/firestore";

// Enums
export const RequestTypeEnum = z.enum(["surgical", "inpatient", "emergency"]);
export const RequestStatusEnum = z.enum([
  "pending_review",
  "refused_nir",
  "waiting_bed",
  "finished", // Successfully bed assigned (future)
  "canceled"  // Removed from queue (death, discharge, transfer, error)
]);
export const EmergencySectorEnum = z.enum(["CEDUG", "Centro Cirúrgico"]);

// Audit Interface
export interface AuditEntry {
  action: string;
  previousPriority?: number;
  newPriority?: number;
  reason?: string;
  timestamp: Timestamp;
  userParams: string;
}

// Base Schema
const BaseRequestSchema = z.object({
  patientName: z.string().min(1, "Nome do paciente é obrigatório"),
  cns: z.string().min(1, "CNS é obrigatório"),
  requestType: RequestTypeEnum,
  status: RequestStatusEnum.default("pending_review"),
  createdAt: z.custom<Timestamp>((val) => val instanceof Timestamp).optional(),

  // New Fields for Regulation/Evaluation
  refusalReason: z.string().optional(),
  cfmPriority: z.number().min(1).max(5).optional(),
  cfmAnswers: z.record(z.boolean()).optional(), // { needsSupport: true, ... }
  evaluatedAt: z.custom<Timestamp>((val) => val instanceof Timestamp).optional(),

  // Fields for Exit/Discard
  exitReason: z.enum(["death", "transfer", "discharge", "error", "bed_assigned"]).optional(),
  exitNote: z.string().optional(),

  // SISREG Integration
  sisregId: z.string().optional(),
  clinicalDetails: z.string().optional(),

  auditHistory: z.array(z.custom<AuditEntry>()).optional(),
});

// Specific Schemas
const SurgicalSchema = z.object({
  requestType: z.literal("surgical"),
  surgeryDate: z.string().min(1, "Data da cirurgia é obrigatória"),
  surgeonName: z.string().min(1, "Nome do cirurgião é obrigatório"),
  surgeryType: z.string().min(1, "Procedimento é obrigatório"),
});

const InpatientSchema = z.object({
  requestType: z.literal("inpatient"),
  sector: z.string().min(1, "Setor é obrigatório"),
  bed: z.string().min(1, "Leito é obrigatório"),
  requestingPhysician: z.string().min(1, "Médico solicitante é obrigatório"),
  clinicalReason: z.string().min(1, "Motivo clínico é obrigatório"),
  requestDate: z.string().min(1, "Data da solicitação é obrigatória"),
  requestTime: z.string().min(1, "Hora da solicitação é obrigatória"),
});

const EmergencySchema = z.object({
  requestType: z.literal("emergency"),
  sector: EmergencySectorEnum,
  requestingPhysician: z.string().min(1, "Médico solicitante é obrigatório"),
  clinicalReason: z.string().min(1, "Motivo clínico é obrigatório"),
  requestDate: z.string().min(1, "Data da solicitação é obrigatória"),
  requestTime: z.string().min(1, "Hora da solicitação é obrigatória"),
});

// Discriminated Union
export const RequestSchema = z.intersection(
  BaseRequestSchema,
  z.discriminatedUnion("requestType", [
    SurgicalSchema,
    InpatientSchema,
    EmergencySchema,
  ])
);

export type RequestData = z.infer<typeof RequestSchema>;
export type RequestType = z.infer<typeof RequestTypeEnum>;
export type RequestStatus = z.infer<typeof RequestStatusEnum>;
export type EmergencySector = z.infer<typeof EmergencySectorEnum>;
