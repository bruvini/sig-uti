import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addUnit, bulkCreateBeds, subscribeToUnits } from "@/services/bedService";
import { Unit } from "@/types/bed";
import { useToast } from "@/components/ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Building2, BedDouble } from "lucide-react";

// Unit Form Schema
const NewUnitSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    description: z.string().optional()
});

// Bed Form Schema
const NewBedsSchema = z.object({
    unitId: z.string().min(1, "Selecione uma unidade"),
    startNumber: z.coerce.number().min(1),
    endNumber: z.coerce.number().min(1)
}).refine(data => data.endNumber >= data.startNumber, {
    message: "Número final deve ser maior ou igual ao inicial",
    path: ["endNumber"]
});

const StructureManager = () => {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const [units, setUnits] = useState<(Unit & { id: string })[]>([]);

    useEffect(() => {
        const unsub = subscribeToUnits(setUnits);
        return () => unsub();
    }, []);

    // Unit Form
    const unitForm = useForm<z.infer<typeof NewUnitSchema>>({
        resolver: zodResolver(NewUnitSchema)
    });

    const onUnitSubmit = async (data: z.infer<typeof NewUnitSchema>) => {
        try {
            await addUnit(data);
            toast({ title: "Unidade criada com sucesso!" });
            unitForm.reset();
        } catch (e) {
            toast({ title: "Erro ao criar unidade", variant: "destructive" });
        }
    };

    // Bed Form
    const bedForm = useForm<z.infer<typeof NewBedsSchema>>({
        resolver: zodResolver(NewBedsSchema),
        defaultValues: { startNumber: 1, endNumber: 10 }
    });

    const onBedSubmit = async (data: z.infer<typeof NewBedsSchema>) => {
        try {
            const unit = units.find(u => u.id === data.unitId);
            if (!unit) return;

            const count = await bulkCreateBeds(data.unitId, unit.name, data.startNumber, data.endNumber);
            toast({
                title: "Leitos gerados com sucesso!",
                description: `${count} leitos foram criados na unidade ${unit.name}.`
            });
            bedForm.reset();
        } catch (e) {
            toast({ title: "Erro ao gerar leitos", variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Gestão de Estrutura Hospitalar</DialogTitle>
                    <DialogDescription>Gerencie unidades (UTIs) e leitos físicos.</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="units" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="units">Unidades</TabsTrigger>
                        <TabsTrigger value="beds">Leitos</TabsTrigger>
                    </TabsList>

                    {/* UNITS TAB */}
                    <TabsContent value="units" className="space-y-4 py-4">
                        <form onSubmit={unitForm.handleSubmit(onUnitSubmit)} className="space-y-4 border p-4 rounded-md">
                            <h4 className="font-medium flex items-center gap-2"><Building2 className="h-4 w-4"/> Nova Unidade</h4>
                            <div className="space-y-2">
                                <Label>Nome da Unidade</Label>
                                <Input placeholder="Ex: UTI Geral 1" {...unitForm.register("name")} />
                                {unitForm.formState.errors.name && <span className="text-xs text-red-500">{unitForm.formState.errors.name.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Descrição</Label>
                                <Input placeholder="Ex: 10 Leitos, Especialidade X" {...unitForm.register("description")} />
                            </div>
                            <Button type="submit" size="sm">Criar Unidade</Button>
                        </form>

                        <div className="space-y-2 mt-4">
                            <Label>Unidades Cadastradas</Label>
                            <div className="border rounded-md divide-y max-h-[200px] overflow-y-auto">
                                {units.map(u => (
                                    <div key={u.id} className="p-2 text-sm flex justify-between">
                                        <span>{u.name}</span>
                                        <span className="text-gray-400 text-xs">{u.description}</span>
                                    </div>
                                ))}
                                {units.length === 0 && <div className="p-4 text-center text-gray-400 text-sm">Nenhuma unidade cadastrada.</div>}
                            </div>
                        </div>
                    </TabsContent>

                    {/* BEDS TAB */}
                    <TabsContent value="beds" className="space-y-4 py-4">
                         <form onSubmit={bedForm.handleSubmit(onBedSubmit)} className="space-y-4 border p-4 rounded-md">
                            <h4 className="font-medium flex items-center gap-2"><BedDouble className="h-4 w-4"/> Gerador de Leitos (Bulk)</h4>

                            <div className="space-y-2">
                                <Label>Unidade de Destino</Label>
                                <Select onValueChange={(val) => bedForm.setValue("unitId", val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a UTI..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map(u => (
                                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {bedForm.formState.errors.unitId && <span className="text-xs text-red-500">{bedForm.formState.errors.unitId.message}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Número Inicial</Label>
                                    <Input type="number" {...bedForm.register("startNumber")} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Número Final</Label>
                                    <Input type="number" {...bedForm.register("endNumber")} />
                                </div>
                            </div>
                            {bedForm.formState.errors.endNumber && <span className="text-xs text-red-500">{bedForm.formState.errors.endNumber.message}</span>}

                            <Button type="submit" size="sm">Gerar Leitos</Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default StructureManager;
