import { MainLayout } from "@/components/layout/MainLayout";
import { NewRequestForm } from "@/components/forms/NewRequestForm";
import { toast } from "sonner";

const NewRequestPage = () => {
  const handleSubmit = (data: any) => {
    console.log("New request submitted:", data);
    toast.success("Solicitação criada com sucesso!");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nova Solicitação</h1>
          <p className="text-muted-foreground">
            Registre uma nova solicitação de leito de UTI
          </p>
        </div>

        <NewRequestForm onSubmit={handleSubmit} />
      </div>
    </MainLayout>
  );
};

export default NewRequestPage;
