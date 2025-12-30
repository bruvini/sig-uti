import { ICURequest, DashboardStats, CFMPriority } from "@/types/icu";

export const mockRequests: ICURequest[] = [
  {
    id: "REQ-001",
    patient: {
      id: "PAT-001",
      name: "Maria Silva Santos",
      age: 67,
      gender: "F",
      medicalRecord: "MR-2024-001234",
      originUnit: "Pronto Socorro",
      diagnosis: "Sepse de foco pulmonar",
    },
    requestDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    requestingPhysician: "Dr. Carlos Eduardo Lima",
    cfmPriority: 1,
    cfmCriteria: {
      needsLifeSupport: true,
      highRecoveryProbability: true,
      hasTherapeuticLimitation: false,
      isPotentiallyReversible: true,
    },
    status: "pending",
    clinicalJustification: "Paciente com sepse grave, necessitando de vasopressores e ventilação mecânica. Quadro potencialmente reversível com tratamento intensivo.",
    sofa: 8,
    apache: 22,
    history: [
      {
        id: "AUD-001",
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
        action: "Solicitação criada",
        physician: "Dr. Carlos Eduardo Lima",
        justification: "Solicitação inicial de leito de UTI",
      },
    ],
  },
  {
    id: "REQ-002",
    patient: {
      id: "PAT-002",
      name: "João Pedro Oliveira",
      age: 45,
      gender: "M",
      medicalRecord: "MR-2024-001235",
      originUnit: "Centro Cirúrgico",
      diagnosis: "Pós-operatório de revascularização miocárdica",
    },
    requestDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
    requestingPhysician: "Dra. Ana Paula Ferreira",
    cfmPriority: 2,
    cfmCriteria: {
      needsLifeSupport: false,
      highRecoveryProbability: true,
      hasTherapeuticLimitation: false,
      isPotentiallyReversible: true,
    },
    status: "pending",
    clinicalJustification: "Pós-operatório imediato de CRM, necessita monitorização intensiva nas primeiras 24-48h.",
    sofa: 4,
    apache: 12,
    history: [
      {
        id: "AUD-002",
        date: new Date(Date.now() - 4 * 60 * 60 * 1000),
        action: "Solicitação criada",
        physician: "Dra. Ana Paula Ferreira",
        justification: "Monitorização pós-operatória",
      },
    ],
  },
  {
    id: "REQ-003",
    patient: {
      id: "PAT-003",
      name: "Antônia Rodrigues",
      age: 82,
      gender: "F",
      medicalRecord: "MR-2024-001236",
      originUnit: "Enfermaria",
      diagnosis: "Insuficiência cardíaca descompensada",
    },
    requestDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
    requestingPhysician: "Dr. Roberto Mendes",
    cfmPriority: 3,
    cfmCriteria: {
      needsLifeSupport: true,
      highRecoveryProbability: false,
      hasTherapeuticLimitation: false,
      isPotentiallyReversible: true,
    },
    status: "pending",
    clinicalJustification: "IC classe IV, múltiplas comorbidades. Baixa probabilidade de recuperação completa, mas quadro potencialmente estabilizável.",
    sofa: 6,
    apache: 28,
    history: [
      {
        id: "AUD-003",
        date: new Date(Date.now() - 6 * 60 * 60 * 1000),
        action: "Solicitação criada",
        physician: "Dr. Roberto Mendes",
        justification: "Descompensação aguda de ICC",
      },
    ],
  },
  {
    id: "REQ-004",
    patient: {
      id: "PAT-004",
      name: "Francisco Almeida",
      age: 58,
      gender: "M",
      medicalRecord: "MR-2024-001237",
      originUnit: "Pronto Socorro",
      diagnosis: "Cetoacidose diabética",
    },
    requestDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
    requestingPhysician: "Dra. Mariana Costa",
    cfmPriority: 2,
    cfmCriteria: {
      needsLifeSupport: false,
      highRecoveryProbability: true,
      hasTherapeuticLimitation: false,
      isPotentiallyReversible: true,
    },
    status: "pending",
    clinicalJustification: "CAD grave com pH 7.1, necessita monitorização intensiva e correção metabólica.",
    sofa: 5,
    apache: 15,
    history: [
      {
        id: "AUD-004",
        date: new Date(Date.now() - 1 * 60 * 60 * 1000),
        action: "Solicitação criada",
        physician: "Dra. Mariana Costa",
        justification: "Emergência metabólica",
      },
    ],
  },
  {
    id: "REQ-005",
    patient: {
      id: "PAT-005",
      name: "Tereza Nascimento",
      age: 91,
      gender: "F",
      medicalRecord: "MR-2024-001238",
      originUnit: "Enfermaria",
      diagnosis: "Neoplasia pulmonar avançada com metástases",
    },
    requestDate: new Date(Date.now() - 3 * 60 * 60 * 1000),
    requestingPhysician: "Dr. Paulo Henrique",
    cfmPriority: 5,
    cfmCriteria: {
      needsLifeSupport: true,
      highRecoveryProbability: false,
      hasTherapeuticLimitation: true,
      isPotentiallyReversible: false,
    },
    status: "pending",
    clinicalJustification: "Paciente em fase terminal, família optou por cuidados de conforto. Encaminhamento para equipe de cuidados paliativos.",
    sofa: 12,
    history: [
      {
        id: "AUD-005",
        date: new Date(Date.now() - 3 * 60 * 60 * 1000),
        action: "Solicitação criada",
        physician: "Dr. Paulo Henrique",
        justification: "Avaliação de critérios CFM",
      },
    ],
  },
];

export const mockStats: DashboardStats = {
  totalRequests: 47,
  pendingRequests: 5,
  approvedToday: 8,
  deniedToday: 2,
  averageWaitTime: 4.2,
  requestsByPriority: {
    1: 12,
    2: 18,
    3: 9,
    4: 5,
    5: 3,
  },
  occupancyRate: 87,
  availableBeds: 4,
  totalBeds: 30,
};

export function calculateCFMPriority(criteria: {
  needsLifeSupport: boolean;
  highRecoveryProbability: boolean;
  hasTherapeuticLimitation: boolean;
  isPotentiallyReversible: boolean;
  isOrganDonor?: boolean;
}): CFMPriority {
  const { needsLifeSupport, highRecoveryProbability, hasTherapeuticLimitation, isPotentiallyReversible, isOrganDonor } = criteria;

  // Priority 5: Terminal phase, no recovery possibility
  if (!isPotentiallyReversible && !highRecoveryProbability && !isOrganDonor) {
    return 5;
  }

  // Priority 1: Needs life support, high recovery probability, no therapeutic limitation
  if (needsLifeSupport && highRecoveryProbability && !hasTherapeuticLimitation) {
    return 1;
  }

  // Priority 2: Needs intensive monitoring (no life support), high risk, no limitation
  if (!needsLifeSupport && highRecoveryProbability && !hasTherapeuticLimitation) {
    return 2;
  }

  // Priority 3: Needs life support but low recovery or has limitation
  if (needsLifeSupport && (!highRecoveryProbability || hasTherapeuticLimitation)) {
    return 3;
  }

  // Priority 4: Needs monitoring with therapeutic limitation
  if (!needsLifeSupport && hasTherapeuticLimitation) {
    return 4;
  }

  // Default to Priority 3 if unclear
  return 3;
}
