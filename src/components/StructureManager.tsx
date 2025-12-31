import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    addUnit,
    updateUnit,
    deleteUnit,
    bulkCreateBeds,
    subscribeToUnits,
    subscribeToBeds,
    deleteBed,
    updateBed
} from "@/services/bedService";
import { Unit, Bed } from "@/types/bed";
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
import {
    Settings,
    Building2,
    BedDouble,
    Pencil,
    Trash2,
    MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Unit Form Schema
const UnitSchema = z.object({
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
    const [allBeds, setAllBeds] = useState<(Bed & { id: string })[]>([]);

    // Edit/Delete State
    const [editingUnit, setEditingUnit] = useState<(Unit & { id: string }) | null>(null);
    const [unitToDelete, setUnitToDelete] = useState<(Unit & { id: string }) | null>(null);
    const [bedToDelete, setBedToDelete] = useState<(Bed & { id: string }) | null>(null);
    const [editingBed, setEditingBed] = useState<(Bed & { id: string }) | null>(null);

    useEffect(() => {
        const unsubUnits = subscribeToUnits(setUnits);
        const unsubBeds = subscribeToBeds(setAllBeds);
        return () => {
            unsubUnits();
            unsubBeds();
        };
    }, []);

    // Unit Form
    const unitForm = useForm<z.infer<typeof UnitSchema>>({
        resolver: zodResolver(UnitSchema)
    });

    // Populate form when editing
    useEffect(() => {
        if (editingUnit) {
            unitForm.setValue("name", editingUnit.name);
            unitForm.setValue("description", editingUnit.description || "");
        } else {
            unitForm.reset({ name: "", description: "" });
        }
    }, [editingUnit, unitForm]);

    const onUnitSubmit = async (data: z.infer<typeof UnitSchema>) => {
        try {
            if (editingUnit) {
                await updateUnit(editingUnit.id, data);
                toast({ title: "Unidade atualizada!" });
                setEditingUnit(null);
            } else {
                await addUnit(data);
                toast({ title: "Unidade criada!" });
            }
            unitForm.reset({ name: "", description: "" });
        } catch (e) {
            toast({ title: "Erro ao salvar unidade", variant: "destructive" });
        }
    };

    const handleDeleteUnit = async () => {
        if (!unitToDelete) return;
        // Check if unit has beds
        const hasBeds = allBeds.some(b => b.unitId === unitToDelete.id);
        if (hasBeds) {
            toast({
                title: "Não é possível excluir",
                description: "Esta unidade possui leitos vinculados. Exclua os leitos primeiro.",
                variant: "destructive"
            });
            setUnitToDelete(null);
            return;
        }

        try {
            await deleteUnit(unitToDelete.id);
            toast({ title: "Unidade excluída" });
            setUnitToDelete(null);
        } catch (e) {
            toast({ title: "Erro ao excluir", variant: "destructive" });
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
            bedForm.reset({ startNumber: 1, endNumber: 10 });
        } catch (e) {
            toast({ title: "Erro ao gerar leitos", variant: "destructive" });
        }
    };

    const handleDeleteBed = async () => {
        if (!bedToDelete) return;
        try {
            await deleteBed(bedToDelete.id);
            toast({ title: "Leito excluído" });
            setBedToDelete(null);
        } catch (e) {
            toast({ title: "Erro ao excluir leito", variant: "destructive" });
        }
    };

    const handleEditBedNumber = async (bed: Bed & { id: string }) => {
        const newNumberStr = prompt("Novo número do leito:", bed.bedNumber.toString());
        if (!newNumberStr) return;
        const newNumber = parseInt(newNumberStr);
        if (isNaN(newNumber)) {
            toast({ title: "Número inválido", variant: "destructive" });
            return;
        }
        try {
            await updateBed(bed.id, { bedNumber: newNumber });
            toast({ title: "Número atualizado" });
        } catch(e) {
            toast({ title: "Erro ao atualizar", variant: "destructive" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Gestão de Estrutura Hospitalar</DialogTitle>
                    <DialogDescription>Gerencie unidades (UTIs) e leitos físicos.</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="units" className="w-full flex-1 flex flex-col">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="units">Unidades</TabsTrigger>
                        <TabsTrigger value="beds">Leitos</TabsTrigger>
                    </TabsList>

                    {/* UNITS TAB */}
                    <TabsContent value="units" className="space-y-4 py-4 flex-1 overflow-y-auto">
                        <form onSubmit={unitForm.handleSubmit(onUnitSubmit)} className="space-y-4 border p-4 rounded-md bg-slate-50">
                            <h4 className="font-medium flex items-center gap-2">
                                <Building2 className="h-4 w-4"/>
                                {editingUnit ? "Editar Unidade" : "Nova Unidade"}
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nome</Label>
                                    <Input placeholder="Ex: UTI Geral 1" {...unitForm.register("name")} />
                                    {unitForm.formState.errors.name && <span className="text-xs text-red-500">{unitForm.formState.errors.name.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Descrição</Label>
                                    <Input placeholder="Ex: 10 Leitos..." {...unitForm.register("description")} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                {editingUnit && <Button type="button" variant="outline" size="sm" onClick={() => setEditingUnit(null)}>Cancelar</Button>}
                                <Button type="submit" size="sm">{editingUnit ? "Salvar Alterações" : "Criar Unidade"}</Button>
                            </div>
                        </form>

                        <div className="space-y-2">
                            <Label>Unidades Cadastradas</Label>
                            <div className="border rounded-md divide-y">
                                {units.map(u => (
                                    <div key={u.id} className="p-3 text-sm flex justify-between items-center bg-white">
                                        <div>
                                            <p className="font-medium">{u.name}</p>
                                            <p className="text-gray-400 text-xs">{u.description}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => setEditingUnit(u)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => setUnitToDelete(u)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {units.length === 0 && <div className="p-4 text-center text-gray-400 text-sm">Nenhuma unidade cadastrada.</div>}
                            </div>
                        </div>
                    </TabsContent>

                    {/* BEDS TAB */}
                    <TabsContent value="beds" className="space-y-4 py-4 flex-1 overflow-y-auto">
                         <form onSubmit={bedForm.handleSubmit(onBedSubmit)} className="space-y-4 border p-4 rounded-md bg-slate-50">
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

                        <div className="space-y-2">
                            <Label>Lista de Leitos (Todas as Unidades)</Label>
                            <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
                                {allBeds.map(b => (
                                    <div key={b.id} className="p-2 text-sm flex justify-between items-center bg-white">
                                        <div className="flex gap-2 items-center">
                                            <span className="font-bold w-8 text-center">{b.bedNumber}</span>
                                            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{b.unitName}</span>
                                            <span className="text-[10px] text-gray-400">{b.status}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditBedNumber(b)}>
                                                <Pencil className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => setBedToDelete(b)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>

            {/* DELETE ALERT DIALOGS */}
            <AlertDialog open={!!unitToDelete} onOpenChange={() => setUnitToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Unidade?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUnit} className="bg-red-600">Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!bedToDelete} onOpenChange={() => setBedToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Leito?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteBed} className="bg-red-600">Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    );
};

export default StructureManager;
