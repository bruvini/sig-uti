import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateRequest } from "@/services/requestService";
import { RequestData } from "@/types/request";
import { useToast } from "@/components/ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface EditDetailsModalProps {
    request: RequestData & { id: string };
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const EditSchema = z.object({
    sisregId: z.string().optional(),
    clinicalDetails: z.string().optional(),
});

const EditDetailsModal: React.FC<EditDetailsModalProps> = ({ request, open, onOpenChange }) => {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof EditSchema>>({
        resolver: zodResolver(EditSchema),
        defaultValues: {
            sisregId: request.sisregId || "",
            clinicalDetails: request.clinicalDetails || "",
        },
    });

    const onSubmit = async (data: z.infer<typeof EditSchema>) => {
        try {
            await updateRequest(request.id, data, {
                action: 'edited_details',
                reason: 'Atualização de dados clínicos/SISREG',
                userParams: 'Médico Regulador'
            });

            toast({
                title: "Dados Atualizados",
                description: "As informações foram salvas com sucesso.",
            });
            onOpenChange(false);
        } catch (error) {
            toast({
                title: "Erro",
                description: "Falha ao atualizar os dados.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Detalhes da Solicitação</DialogTitle>
                    <DialogDescription>
                        Insira os dados do SISREG e detalhes clínicos adicionais.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="sisregId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número da Solicitação SISREG</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: 12345678" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="clinicalDetails"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Detalhes Clínicos / Evolução</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descreva a evolução do quadro ou detalhes relevantes..."
                                            className="min-h-[120px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                            <Button type="submit">Salvar Alterações</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default EditDetailsModal;
