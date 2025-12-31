import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateRequest } from "@/services/requestService";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RefusalModalProps {
    requestId: string;
    patientName: string;
    trigger?: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const RefusalSchema = z.object({
    reason: z.string().min(10, "A justificativa deve ter pelo menos 10 caracteres."),
});

const RefusalModal: React.FC<RefusalModalProps> = ({ requestId, patientName, trigger, open, onOpenChange }) => {
    const { toast } = useToast();
    const form = useForm<z.infer<typeof RefusalSchema>>({
        resolver: zodResolver(RefusalSchema),
        defaultValues: {
            reason: ""
        }
    });

    const onSubmit = async (data: z.infer<typeof RefusalSchema>) => {
        try {
            await updateRequest(requestId, {
                status: 'refused_nir',
                refusalReason: data.reason
            }, {
                action: 'refused',
                reason: data.reason,
                userParams: 'Médico Regulador'
            });

            toast({
                title: "Solicitação Recusada",
                description: `A solicitação de ${patientName} foi negada.`,
            });
            onOpenChange(false);
            form.reset();
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível recusar a solicitação.",
                variant: "destructive"
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Recusar Solicitação - NIR</DialogTitle>
                    <DialogDescription>
                        Você está prestes a negar a solicitação de vaga para <b>{patientName}</b>.
                        Esta ação é irreversível e requer uma justificativa.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Motivo da Recusa</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descreva o motivo administrativo ou técnico..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                            <Button type="submit" variant="destructive">Confirmar Recusa</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default RefusalModal;
