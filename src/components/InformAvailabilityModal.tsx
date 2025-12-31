import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { subscribeToBeds, updateBedStatus, subscribeToUnits } from "@/services/bedService";
import { Bed, BedStatus, BedStatusEnum, Unit } from "@/types/bed";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Megaphone } from "lucide-react";

// Only "available" statuses makes sense to report, or maybe report "Maintenance" too?
// The prompt says: "Novo Status (ex: 'Limpo/Pronto', 'Previsão de Alta', 'Alta Confirmada')"
// Usually this flow is to say "This bed is now ready".
const ReportableStatusEnum = z.enum([
    "clean",
    "discharge_confirmed",
    "discharge_unconfirmed",
    "maintenance" // Useful to report breakdown too
]);

const ReportSchema = z.object({
    unitId: z.string().min(1, "Selecione a unidade"),
    bedId: z.string().min(1, "Selecione o leito"),
    status: ReportableStatusEnum
});

const InformAvailabilityModal = () => {
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

    const form = useForm<z.infer<typeof ReportSchema>>({
        resolver: zodResolver(ReportSchema),
        defaultValues: { status: "clean" }
    });

    const watchUnitId = form.watch("unitId");

    // Filter beds that are NOT available (i.e., closed, occupied, maintenance)
    // Prompt: "filtrando apenas leitos que NÃO estão disponíveis no momento, ou seja, status closed, occupied, maintenance"
    // Wait, if it is maintenance, we might want to report it as clean.
    // So we filter for: closed, occupied, maintenance.
    const availableBedsForSelection = allBeds.filter(b => {
        // Must belong to selected unit
        if (watchUnitId && b.unitId !== watchUnitId) return false;

        // Filter logic: Only show beds that are NOT 'clean' or 'discharge_*' (already available)
        // If a bed is 'clean', why report it again?
        const isAlreadyAvailable = ['clean', 'discharge_confirmed', 'discharge_unconfirmed'].includes(b.status);
        return !isAlreadyAvailable;
    });

    const onSubmit = async (data: z.infer<typeof ReportSchema>) => {
        try {
            await updateBedStatus(data.bedId, data.status);
            toast({
                title: "Disponibilidade Informada",
                description: "O status do leito foi atualizado e agora aparece no painel."
            });
            setOpen(false);
            form.reset();
        } catch (e) {
            toast({ title: "Erro ao atualizar status", variant: "destructive" });
        }
    };

    const getStatusLabel = (s: string) => {
        switch(s) {
            case 'clean': return "Limpo / Pronto";
            case 'discharge_confirmed': return "Alta Confirmada";
            case 'discharge_unconfirmed': return "Previsão de Alta";
            case 'maintenance': return "Em Manutenção";
            default: return s;
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                    <Megaphone className="h-4 w-4" />
                    Informar Disponibilidade
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Informar Vaga / Disponibilidade</DialogTitle>
                    <DialogDescription>
                        Atualize o status de um leito ocupado ou fechado para torná-lo visível à regulação.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Unidade</Label>
                        <Select onValueChange={(val) => form.setValue("unitId", val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a UTI..." />
                            </SelectTrigger>
                            <SelectContent>
                                {units.map(u => (
                                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Leito (Indisponíveis)</Label>
                        <Select onValueChange={(val) => form.setValue("bedId", val)} disabled={!watchUnitId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o leito..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableBedsForSelection.length === 0 ? (
                                    <SelectItem value="none" disabled>Nenhum leito reportável nesta unidade</SelectItem>
                                ) : (
                                    availableBedsForSelection.map(b => (
                                        <SelectItem key={b.id} value={b.id}>
                                            Leito {b.bedNumber} ({b.status})
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Novo Status</Label>
                        <Select
                            onValueChange={(val) => form.setValue("status", val as any)}
                            defaultValue="clean"
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o status..." />
                            </SelectTrigger>
                            <SelectContent>
                                {ReportableStatusEnum.options.map(s => (
                                    <SelectItem key={s} value={s}>{getStatusLabel(s)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={availableBedsForSelection.length === 0 && !!watchUnitId}>Confirmar Disponibilidade</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default InformAvailabilityModal;
