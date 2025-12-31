import { z } from "zod";
import { Timestamp } from "firebase/firestore";

// Enums
export const BedStatusEnum = z.enum([
  "closed",
  "clean",
  "maintenance",
  "discharge_confirmed",
  "discharge_unconfirmed",
  "occupied"
]);

export const UnitSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome da unidade é obrigatório"),
  description: z.string().optional(),
  createdAt: z.custom<Timestamp>((val) => val instanceof Timestamp).optional(),
});

export const BedSchema = z.object({
  id: z.string().optional(),
  unitId: z.string().min(1, "Unidade é obrigatória"),
  unitName: z.string().optional(), // Denormalized for easier display
  bedNumber: z.number().min(1, "Número do leito inválido"),
  status: BedStatusEnum.default("closed"),
  currentPatientId: z.string().optional().nullable(),
  updatedAt: z.custom<Timestamp>((val) => val instanceof Timestamp).optional(),
});

export type Unit = z.infer<typeof UnitSchema>;
export type Bed = z.infer<typeof BedSchema>;
export type BedStatus = z.infer<typeof BedStatusEnum>;
