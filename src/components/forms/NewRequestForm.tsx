import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CFMPriority, CFM_PRIORITIES, CFMCriteria } from "@/types/icu";
import { calculateCFMPriority } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { EthicsNotice } from "@/components/shared/EthicsNotice";
import {
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const patientSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  age: z.number().min(0).max(150, "Idade inválida"),
  gender: z.enum(["M", "F", "O"]),
  medicalRecord: z.string().min(1, "Prontuário obrigatório"),
  originUnit: z.string().min(1, "Unidade de origem obrigatória"),
  diagnosis: z.string().min(10, "Diagnóstico deve ser mais detalhado"),
});

const requestSchema = z.object({
  patient: patientSchema,
  requestingPhysician: z.string().min(3, "Nome do médico obrigatório"),
  clinicalJustification: z.string().min(20, "Justificativa clínica detalhada obrigatória"),
  sofa: z.number().min(0).max(24).optional(),
  apache: z.number().min(0).max(71).optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface NewRequestFormProps {
  onSubmit: (data: RequestFormData & { cfmPriority: CFMPriority; cfmCriteria: CFMCriteria }) => void;
}

export function NewRequestForm({ onSubmit }: NewRequestFormProps) {
  const [step, setStep] = useState(1);
  const [cfmCriteria, setCfmCriteria] = useState<CFMCriteria>({
    needsLifeSupport: false,
    highRecoveryProbability: true,
    hasTherapeuticLimitation: false,
    isPotentiallyReversible: true,
  });

  const suggestedPriority = calculateCFMPriority(cfmCriteria);
  const [confirmedPriority, setConfirmedPriority] = useState<CFMPriority | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      patient: {
        gender: "M",
      },
    },
  });

  const handleCriteriaChange = (key: keyof CFMCriteria, value: boolean) => {
    setCfmCriteria((prev) => ({ ...prev, [key]: value }));
    setConfirmedPriority(null);
  };

  const handleFormSubmit = (data: RequestFormData) => {
    const finalPriority = confirmedPriority || suggestedPriority;
    onSubmit({
      ...data,
      cfmPriority: finalPriority,
      cfmCriteria,
    });
    toast.success("Solicitação enviada com sucesso", {
      description: `Prioridade CFM ${finalPriority} atribuída`,
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {step > s ? <CheckCircle className="h-5 w-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={cn(
                    "ml-4 h-0.5 w-16 transition-colors",
                    step > s ? "bg-primary" : "bg-secondary"
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-center gap-4 text-xs text-muted-foreground">
          <span className={cn("w-20 text-center", step === 1 && "text-primary font-medium")}>
            Paciente
          </span>
          <span className={cn("w-20 text-center", step === 2 && "text-primary font-medium")}>
            Critérios CFM
          </span>
          <span className={cn("w-20 text-center", step === 3 && "text-primary font-medium")}>
            Confirmação
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {/* Step 1: Patient Data */}
        {step === 1 && (
          <div className="card-clinical animate-fade-in p-6">
            <h2 className="mb-6 text-lg font-semibold">Dados do Paciente</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  {...register("patient.name")}
                  placeholder="Nome do paciente"
                  className="mt-1"
                />
                {errors.patient?.name && (
                  <p className="mt-1 text-xs text-destructive">{errors.patient.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  {...register("patient.age", { valueAsNumber: true })}
                  placeholder="Anos"
                  className="mt-1"
                />
                {errors.patient?.age && (
                  <p className="mt-1 text-xs text-destructive">{errors.patient.age.message}</p>
                )}
              </div>

              <div>
                <Label>Sexo</Label>
                <Select
                  onValueChange={(v) => setValue("patient.gender", v as "M" | "F" | "O")}
                  defaultValue="M"
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                    <SelectItem value="O">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="medicalRecord">Prontuário</Label>
                <Input
                  id="medicalRecord"
                  {...register("patient.medicalRecord")}
                  placeholder="Número do prontuário"
                  className="mt-1"
                />
                {errors.patient?.medicalRecord && (
                  <p className="mt-1 text-xs text-destructive">{errors.patient.medicalRecord.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="originUnit">Unidade de Origem</Label>
                <Select onValueChange={(v) => setValue("patient.originUnit", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pronto Socorro">Pronto Socorro</SelectItem>
                    <SelectItem value="Enfermaria">Enfermaria</SelectItem>
                    <SelectItem value="Centro Cirúrgico">Centro Cirúrgico</SelectItem>
                    <SelectItem value="Bloco Obstétrico">Bloco Obstétrico</SelectItem>
                    <SelectItem value="Hemodiálise">Hemodiálise</SelectItem>
                    <SelectItem value="Ambulatório">Ambulatório</SelectItem>
                    <SelectItem value="Transferência Externa">Transferência Externa</SelectItem>
                  </SelectContent>
                </Select>
                {errors.patient?.originUnit && (
                  <p className="mt-1 text-xs text-destructive">{errors.patient.originUnit.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="diagnosis">Diagnóstico Principal</Label>
                <Textarea
                  id="diagnosis"
                  {...register("patient.diagnosis")}
                  placeholder="Descreva o diagnóstico principal e comorbidades relevantes"
                  className="mt-1"
                  rows={3}
                />
                {errors.patient?.diagnosis && (
                  <p className="mt-1 text-xs text-destructive">{errors.patient.diagnosis.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="requestingPhysician">Médico Solicitante</Label>
                <Input
                  id="requestingPhysician"
                  {...register("requestingPhysician")}
                  placeholder="Nome e CRM"
                  className="mt-1"
                />
                {errors.requestingPhysician && (
                  <p className="mt-1 text-xs text-destructive">{errors.requestingPhysician.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="button" onClick={() => setStep(2)}>
                Próximo: Critérios CFM
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: CFM Criteria */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <EthicsNotice />

            <div className="card-clinical p-6">
              <h2 className="mb-2 text-lg font-semibold">
                Avaliação de Critérios CFM
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Responda às perguntas abaixo para definir a prioridade conforme
                Resolução CFM 2.156/2016
              </p>

              <div className="space-y-6">
                {/* Question 1 */}
                <div className="rounded-lg border bg-secondary/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        O paciente necessita de suporte à vida imediato?
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Ventilação mecânica, drogas vasoativas, suporte
                        hemodinâmico, etc.
                      </p>
                      <RadioGroup
                        className="mt-3 flex gap-4"
                        value={cfmCriteria.needsLifeSupport ? "yes" : "no"}
                        onValueChange={(v) =>
                          handleCriteriaChange("needsLifeSupport", v === "yes")
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="life-support-yes" />
                          <Label htmlFor="life-support-yes">Sim</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="life-support-no" />
                          <Label htmlFor="life-support-no">Não</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                {/* Question 2 */}
                <div className="rounded-lg border bg-secondary/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        Há alta probabilidade de recuperação com terapia intensiva?
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Considere idade biológica, comorbidades e prognóstico
                        geral.
                      </p>
                      <RadioGroup
                        className="mt-3 flex gap-4"
                        value={cfmCriteria.highRecoveryProbability ? "yes" : "no"}
                        onValueChange={(v) =>
                          handleCriteriaChange("highRecoveryProbability", v === "yes")
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="recovery-yes" />
                          <Label htmlFor="recovery-yes">Sim</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="recovery-no" />
                          <Label htmlFor="recovery-no">Não</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                {/* Question 3 */}
                <div className="rounded-lg border bg-secondary/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        Existe limitação de suporte terapêutico?
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Diretivas antecipadas de vontade, decisão compartilhada
                        com família, ordem de não reanimar, etc.
                      </p>
                      <RadioGroup
                        className="mt-3 flex gap-4"
                        value={cfmCriteria.hasTherapeuticLimitation ? "yes" : "no"}
                        onValueChange={(v) =>
                          handleCriteriaChange("hasTherapeuticLimitation", v === "yes")
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="limitation-yes" />
                          <Label htmlFor="limitation-yes">Sim</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="limitation-no" />
                          <Label htmlFor="limitation-no">Não</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                {/* Question 4 */}
                <div className="rounded-lg border bg-secondary/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      4
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        O quadro clínico é potencialmente reversível?
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Existe possibilidade de reversão da condição aguda com
                        tratamento adequado.
                      </p>
                      <RadioGroup
                        className="mt-3 flex gap-4"
                        value={cfmCriteria.isPotentiallyReversible ? "yes" : "no"}
                        onValueChange={(v) =>
                          handleCriteriaChange("isPotentiallyReversible", v === "yes")
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="reversible-yes" />
                          <Label htmlFor="reversible-yes">Sim</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="reversible-no" />
                          <Label htmlFor="reversible-no">Não</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggested Priority */}
              <div className="mt-6 rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Prioridade Sugerida pelo Sistema
                    </p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      {CFM_PRIORITIES[suggestedPriority].name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {CFM_PRIORITIES[suggestedPriority].description}
                    </p>
                  </div>
                  <PriorityBadge priority={suggestedPriority} size="lg" />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button type="button" onClick={() => setStep(3)}>
                  Próximo: Confirmação
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="card-clinical p-6">
              <h2 className="mb-6 text-lg font-semibold">
                Confirmação da Solicitação
              </h2>

              {/* Priority Confirmation */}
              <div className="mb-6 rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Prioridade CFM a ser atribuída
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {CFM_PRIORITIES[confirmedPriority || suggestedPriority].name}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {CFM_PRIORITIES[confirmedPriority || suggestedPriority].recommendation}
                    </p>
                  </div>
                  <PriorityBadge
                    priority={confirmedPriority || suggestedPriority}
                    size="lg"
                  />
                </div>

                {/* Override Priority */}
                <div className="mt-4 border-t pt-4">
                  <p className="mb-2 text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Deseja alterar a prioridade sugerida?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {([1, 2, 3, 4, 5] as CFMPriority[]).map((p) => (
                      <Button
                        key={p}
                        type="button"
                        variant={confirmedPriority === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => setConfirmedPriority(p)}
                        className="gap-1"
                      >
                        <PriorityBadge priority={p} showLabel={false} size="sm" />
                        {CFM_PRIORITIES[p].name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clinical Justification */}
              <div className="mb-6">
                <Label htmlFor="clinicalJustification">
                  Justificativa Clínica <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="clinicalJustification"
                  {...register("clinicalJustification")}
                  placeholder="Descreva a justificativa clínica para a solicitação de UTI, incluindo condição atual, indicação e objetivos do tratamento intensivo."
                  className="mt-1"
                  rows={4}
                />
                {errors.clinicalJustification && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.clinicalJustification.message}
                  </p>
                )}
              </div>

              {/* Scores */}
              <div className="mb-6 grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="sofa">Score SOFA (opcional)</Label>
                  <Input
                    id="sofa"
                    type="number"
                    {...register("sofa", { valueAsNumber: true })}
                    placeholder="0-24"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="apache">APACHE II (opcional)</Label>
                  <Input
                    id="apache"
                    type="number"
                    {...register("apache", { valueAsNumber: true })}
                    placeholder="0-71"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Palliative Alert */}
              {(confirmedPriority || suggestedPriority) === 5 && (
                <div className="mb-6 flex items-start gap-3 rounded-lg bg-priority-5-bg p-4 border border-priority-5/30">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-priority-5" />
                  <div>
                    <p className="font-medium text-priority-5">
                      Atenção: Prioridade 5 selecionada
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Pacientes com Prioridade 5 não são elegíveis para UTI,
                      exceto em caso de doação de órgãos. Considere
                      encaminhamento para equipe de Cuidados Paliativos.
                    </p>
                  </div>
                </div>
              )}

              <EthicsNotice variant="compact" />

              <div className="mt-6 flex items-center justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button type="submit" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Enviar Solicitação
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
