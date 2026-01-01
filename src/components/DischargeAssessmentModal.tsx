import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addDischargeAssessment } from "@/services/dischargeService";
import { subscribeToUnits, subscribeToBeds } from "@/services/bedService";
import { Unit, Bed } from "@/types/bed";
import { useToast } from "@/components/ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stethoscope } from "lucide-react";

// Form Schema based on DischargeAssessmentSchema but flattened for form inputs
const AssessmentFormSchema = z.object({
    patientName: z.string().min(1, "Nome é obrigatório"),
    unitId: z.string().min(1, "Unidade é obrigatória"),
    bedId: z.string().min(1, "Leito é obrigatório"),
    admissionDate: z.string().min(1, "Data é obrigatória"),
    // Criteria
    hemodynamicStability: z.enum(["yes", "no"]),
    respiratoryStability: z.enum(["yes", "no"]),
    causeControlled: z.enum(["yes", "no"]),
    neurologicalStability: z.enum(["yes", "no"]),
    noOrganDysfunction: z.enum(["yes", "no"]),
});

const DischargeAssessmentModal = () => {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const [units, setUnits] = useState<(Unit & { id: string })[]>([]);
    const [allBeds, setAllBeds] = useState<(Bed & { id: string })[]>([]);

    useEffect(() => {
        const unsubUnits = subscribeToUnits(setUnits);
        const unsubBeds = subscribeToBeds(setAllBeds);
        return () => {
            unsubUnits();
            unsubBeds();
        };
    }, []);

    const form = useForm<z.infer<typeof AssessmentFormSchema>>({
        resolver: zodResolver(AssessmentFormSchema),
    });

    const watchUnitId = form.watch("unitId");

    // Filter beds by unit and only show occupied beds?
    // Usually we assess patients IN beds (Occupied).
    const filteredBeds = allBeds.filter(b => b.unitId === watchUnitId && b.status === 'occupied');

    const onSubmit = async (data: z.infer<typeof AssessmentFormSchema>) => {
        // Validation Logic
        const allYes =
            data.hemodynamicStability === 'yes' &&
            data.respiratoryStability === 'yes' &&
            data.causeControlled === 'yes' &&
            data.neurologicalStability === 'yes' &&
            data.noOrganDysfunction === 'yes';

        if (!allYes) {
            toast({
                title: "Critérios Não Atendidos",
                description: "Paciente não elegível para alta segundo protocolo CFM. Avaliação registrada apenas como histórico.",
                variant: "destructive"
            });
            // We could still save it as 'not_candidate' status, but prompt says "Salve apenas como registro histórico... mas não adicione à lista ativa".
            // I'll save it as 'not_candidate'.
        }

        try {
            const unitName = units.find(u => u.id === data.unitId)?.name;
            const bed = allBeds.find(b => b.id === data.bedId);

            await addDischargeAssessment({
                patientName: data.patientName,
                unitId: data.unitId,
                unitName: unitName,
                bedId: data.bedId,
                bedNumber: bed?.bedNumber,
                admissionDate: data.admissionDate,
                criteriaAnswers: {
                    hemodynamicStability: data.hemodynamicStability === 'yes',
                    respiratoryStability: data.respiratoryStability === 'yes',
                    causeControlled: data.causeControlled === 'yes',
                    neurologicalStability: data.neurologicalStability === 'yes',
                    noOrganDysfunction: data.noOrganDysfunction === 'yes'
                },
                status: allYes ? 'candidate' : 'not_candidate'
            });

            if (allYes) {
                toast({
                    title: "Paciente Elegível",
                    description: "Adicionado à lista de gestão de altas.",
                });
            }
            setOpen(false);
            form.reset();
        } catch (e) {
            toast({ title: "Erro ao salvar avaliação", variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Avaliar Paciente para Alta
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nova Avaliação de Alta (CFM 2.156/2016)</DialogTitle>
                    <DialogDescription>Preencha os critérios clínicos para validar a elegibilidade de alta da UTI.</DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">

                    {/* ID Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
                        <div className="space-y-2">
                            <Label>Nome do Paciente</Label>
                            <Input placeholder="Nome completo" {...form.register("patientName")} />
                            {form.formState.errors.patientName && <span className="text-red-500 text-xs">Obrigatório</span>}
                        </div>
                        <div className="space-y-2">
                            <Label>Data de Admissão na UTI</Label>
                            <Input type="date" {...form.register("admissionDate")} />
                            {form.formState.errors.admissionDate && <span className="text-red-500 text-xs">Obrigatório</span>}
                        </div>
                        <div className="space-y-2">
                            <Label>Unidade</Label>
                            <Select onValueChange={(val) => form.setValue("unitId", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a UTI" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Leito</Label>
                            <Select onValueChange={(val) => form.setValue("bedId", val)} disabled={!watchUnitId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o Leito" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredBeds.map(b => (
                                        <SelectItem key={b.id} value={b.id}>Leito {b.bedNumber}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Criteria Section */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-gray-700">Checklist de Estabilidade</h4>

                        {[
                            { id: "hemodynamicStability", label: "Estabilidade Hemodinâmica?" },
                            { id: "respiratoryStability", label: "Estabilidade Respiratória?" },
                            { id: "causeControlled", label: "Controle da Causa Base?" },
                            { id: "neurologicalStability", label: "Estabilidade Neurológica?" },
                            { id: "noOrganDysfunction", label: "Ausência de Disfunção Orgânica Aguda Grave?" }
                        ].map((criterion) => (
                            <div key={criterion.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <Label className="text-sm font-medium">{criterion.label}</Label>
                                <RadioGroup
                                    onValueChange={(val) => form.setValue(criterion.id as any, val)}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="yes" id={`${criterion.id}-yes`} />
                                        <Label htmlFor={`${criterion.id}-yes`}>Sim</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="no" id={`${criterion.id}-no`} />
                                        <Label htmlFor={`${criterion.id}-no`}>Não</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button type="submit">Finalizar Avaliação</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default DischargeAssessmentModal;
