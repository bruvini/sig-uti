import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RequestSchema, RequestTypeEnum, EmergencySectorEnum } from "@/types/request";
import { addRequest } from "@/services/requestService";
import { useToast } from "@/components/ui/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const NewRequestModal = () => {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof RequestSchema>>({
    resolver: zodResolver(RequestSchema),
    defaultValues: {
      requestType: "surgical", // Default to trigger initial render
      patientName: "",
      cns: "",
      status: "pending_review",
    },
  });

  const requestType = form.watch("requestType");

  const onSubmit = async (data: z.infer<typeof RequestSchema>) => {
    try {
      await addRequest(data);
      toast({
        title: "Sucesso!",
        description: "Solicitação criada com sucesso.",
        variant: "default",
      });
      setOpen(false);
      form.reset({
          requestType: "surgical",
          patientName: "",
          cns: "",
          status: "pending_review",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar solicitação.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Nova Solicitação</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Vaga</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Common Fields */}
            <FormField
              control={form.control}
              name="patientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Paciente</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cns"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNS</FormLabel>
                  <FormControl>
                    <Input placeholder="Cartão Nacional de Saúde" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requestType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Paciente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="surgical">Cirúrgico</SelectItem>
                      <SelectItem value="inpatient">Internado</SelectItem>
                      <SelectItem value="emergency">Emergência</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Surgical Fields */}
            {requestType === "surgical" && (
              <>
                <FormField
                  control={form.control}
                  name="surgeryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data da Cirurgia</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="surgeonName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cirurgião</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do cirurgião" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="surgeryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Procedimento</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do procedimento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Inpatient Fields */}
            {requestType === "inpatient" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="requestDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data da Solicitação</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="requestTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora da Solicitação</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Setor</FormLabel>
                        <FormControl>
                            <Input placeholder="Setor de origem" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="bed"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Leito</FormLabel>
                        <FormControl>
                            <Input placeholder="Número do leito" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 </div>
                <FormField
                  control={form.control}
                  name="requestingPhysician"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Médico Solicitante</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do médico" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clinicalReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo Clínico</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descreva o caso..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Emergency Fields */}
            {requestType === "emergency" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="requestDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data da Solicitação</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="requestTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora da Solicitação</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setor</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o setor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EmergencySectorEnum.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requestingPhysician"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Médico Solicitante</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do médico" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clinicalReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo Clínico</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descreva o caso..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="flex justify-end pt-4">
              <Button type="submit">Criar Solicitação</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewRequestModal;
