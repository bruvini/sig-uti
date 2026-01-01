import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { reviewDischarge } from "@/services/dischargeService";
import { DischargeStatus, DischargeStatusEnum } from "@/types/discharge";
import { useToast } from "@/components/ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DischargeReviewModalProps {
    assessmentId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ReviewSchema = z.object({
    observation: z.string().min(5, "Observação obrigatória"),
    decision: z.string()
});

const DischargeReviewModal: React.FC<DischargeReviewModalProps> = ({ assessmentId, open, onOpenChange }) => {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof ReviewSchema>>({
        resolver: zodResolver(ReviewSchema),
    });

    const onSubmit = async (data: z.infer<typeof ReviewSchema>) => {
        try {
            await reviewDischarge(assessmentId, data.decision as DischargeStatus, data.observation);
            toast({ title: "Revisão Registrada" });
            onOpenChange(false);
            form.reset();
        } catch(e) {
            toast({ title: "Erro ao salvar revisão", variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Registrar Análise / Revisão de Alta</DialogTitle>
                    <DialogDescription>
                        Gerencie conflitos clínicos ou barreiras administrativas para a alta.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Decisão Técnica</Label>
                        <Select onValueChange={(val) => form.setValue("decision", val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a ação..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="administrative_barrier">Validar Alta - Aguardando Vaga de Enfermaria</SelectItem>
                                <SelectItem value="clinical_mismatch">Contraindicar Alta - Instabilidade Clínica</SelectItem>
                                <SelectItem value="candidate">Manter em Análise (Sem mudança de status)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Parecer Médico / Observação</Label>
                        <Textarea
                            placeholder="Justifique a decisão ou descreva a barreira..."
                            {...form.register("observation")}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit">Salvar Revisão</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default DischargeReviewModal;
