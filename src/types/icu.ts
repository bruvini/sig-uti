// CFM Priority Levels based on Resolution 2.156/2016
export type CFMPriority = 1 | 2 | 3 | 4 | 5;

export interface CFMPriorityInfo {
  level: CFMPriority;
  name: string;
  description: string;
  recommendation: string;
  color: string;
}

export const CFM_PRIORITIES: Record<CFMPriority, CFMPriorityInfo> = {
  1: {
    level: 1,
    name: "Prioridade 1",
    description: "Necessita de suporte à vida imediato, com alta probabilidade de recuperação e sem limitação terapêutica.",
    recommendation: "Indicação absoluta para UTI",
    color: "priority-1",
  },
  2: {
    level: 2,
    name: "Prioridade 2",
    description: "Necessita de monitorização intensiva por alto risco de intervenção imediata, sem limitação terapêutica.",
    recommendation: "UTI ou Unidade Semi-Intensiva",
    color: "priority-2",
  },
  3: {
    level: 3,
    name: "Prioridade 3",
    description: "Necessita de suporte à vida, porém com baixa probabilidade de recuperação ou limitação terapêutica.",
    recommendation: "Avaliar benefício da UTI",
    color: "priority-3",
  },
  4: {
    level: 4,
    name: "Prioridade 4",
    description: "Necessita de monitorização intensiva com limitação de intervenção terapêutica.",
    recommendation: "Unidade Semi-Intensiva preferencial",
    color: "priority-4",
  },
  5: {
    level: 5,
    name: "Prioridade 5",
    description: "Fase de terminalidade, sem possibilidade de recuperação. Não elegível para UTI, exceto doação de órgãos.",
    recommendation: "Cuidados Paliativos",
    color: "priority-5",
  },
};

export type RequestStatus = 
  | "pending" 
  | "approved" 
  | "denied" 
  | "transferred" 
  | "cancelled"
  | "reevaluation";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "M" | "F" | "O";
  medicalRecord: string;
  originUnit: string;
  diagnosis: string;
}

export interface CFMCriteria {
  needsLifeSupport: boolean;
  highRecoveryProbability: boolean;
  hasTherapeuticLimitation: boolean;
  isPotentiallyReversible: boolean;
  isOrganDonor?: boolean;
}

export interface ICURequest {
  id: string;
  patient: Patient;
  requestDate: Date;
  requestingPhysician: string;
  cfmPriority: CFMPriority;
  cfmCriteria: CFMCriteria;
  status: RequestStatus;
  clinicalJustification: string;
  sofa?: number;
  apache?: number;
  history: AuditEntry[];
}

export interface AuditEntry {
  id: string;
  date: Date;
  action: string;
  physician: string;
  previousPriority?: CFMPriority;
  newPriority?: CFMPriority;
  justification: string;
}

export interface DenialReason {
  code: string;
  description: string;
  cfmBased: boolean;
}

export const DENIAL_REASONS: DenialReason[] = [
  { code: "CFM_CRITERIA", description: "Critérios CFM não atendidos", cfmBased: true },
  { code: "THERAPEUTIC_LIMIT", description: "Limitação terapêutica definida", cfmBased: true },
  { code: "LOW_RECOVERY", description: "Baixa probabilidade de recuperação com terapia intensiva", cfmBased: true },
  { code: "PALLIATIVE", description: "Indicação de cuidados paliativos", cfmBased: true },
  { code: "ALTERNATIVE_CARE", description: "Alternativa assistencial adequada disponível", cfmBased: true },
  { code: "SEMI_INTENSIVE", description: "Perfil para Unidade Semi-Intensiva", cfmBased: true },
  { code: "CLINICAL_STABILITY", description: "Paciente clinicamente estável", cfmBased: false },
  { code: "OTHER", description: "Outro motivo (especificar)", cfmBased: false },
];

export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  approvedToday: number;
  deniedToday: number;
  averageWaitTime: number;
  requestsByPriority: Record<CFMPriority, number>;
  occupancyRate: number;
  availableBeds: number;
  totalBeds: number;
}
