import { z } from "zod";
import { Timestamp } from "firebase/firestore";

export const DischargeStatusEnum = z.enum([
  "candidate", // Atende critérios CFM
  "discharged", // Alta efetivada
  "clinical_mismatch", // Critério CFM Ok, mas Médico discorda
  "administrative_barrier", // Critério Ok, mas sem vaga enfermaria
  "not_candidate" // Não atendeu critérios (historical)
]);

export const ReviewHistoryEntrySchema = z.object({
    timestamp: z.custom<Timestamp>((val) => val instanceof Timestamp),
    userParams: z.string(),
    observation: z.string(),
    decision: z.string()
});

export const DischargeAssessmentSchema = z.object({
  id: z.string().optional(),
  patientName: z.string().min(1, "Nome do paciente é obrigatório"),
  unitId: z.string().min(1, "Unidade é obrigatória"),
  unitName: z.string().optional(), // Helper for display
  bedId: z.string().min(1, "Leito é obrigatório"),
  bedNumber: z.number().optional(), // Helper for display
  admissionDate: z.string().min(1, "Data de internação é obrigatória"), // ISO String for form, convert logic later
  assessmentCreatedAt: z.custom<Timestamp>((val) => val instanceof Timestamp).optional(),

  criteriaAnswers: z.object({
      hemodynamicStability: z.boolean(),
      respiratoryStability: z.boolean(),
      causeControlled: z.boolean(),
      neurologicalStability: z.boolean(),
      noOrganDysfunction: z.boolean()
  }),

  status: DischargeStatusEnum,

  reviewHistory: z.array(ReviewHistoryEntrySchema).optional()
});

export type DischargeAssessment = z.infer<typeof DischargeAssessmentSchema>;
export type DischargeStatus = z.infer<typeof DischargeStatusEnum>;
export type ReviewHistoryEntry = z.infer<typeof ReviewHistoryEntrySchema>;
