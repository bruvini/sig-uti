import { z } from "zod";
import { Timestamp } from "firebase/firestore";

// Enums
export const RequestTypeEnum = z.enum(["surgical", "inpatient", "emergency"]);
export const RequestStatusEnum = z.enum(["pending_review", "approved", "rejected"]);
export const EmergencySectorEnum = z.enum(["CEDUG", "Centro Cirúrgico"]);

// Base Schema
const BaseRequestSchema = z.object({
  patientName: z.string().min(1, "Nome do paciente é obrigatório"),
  cns: z.string().min(1, "CNS é obrigatório"),
  requestType: RequestTypeEnum,
  status: RequestStatusEnum.default("pending_review"),
  createdAt: z.custom<Timestamp>((val) => val instanceof Timestamp).optional(), // Optional because it's set by server
});

// Specific Schemas
const SurgicalSchema = z.object({
  requestType: z.literal("surgical"),
  surgeryDate: z.string().min(1, "Data da cirurgia é obrigatória"), // Keeping as string for input, can be converted later if needed
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
export type EmergencySector = z.infer<typeof EmergencySectorEnum>;
