import { MainLayout } from "@/components/layout/MainLayout";
import { EthicsNotice } from "@/components/shared/EthicsNotice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bell,
  Shield,
  Users,
  Clock,
  Save,
} from "lucide-react";

const SettingsPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as preferências do sistema
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure alertas e notificações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Alertas de Prioridade 1</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar imediatamente novas solicitações P1
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Alertas de Prioridade 2</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar novas solicitações P2
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Alertas de Cuidados Paliativos</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar quando P5 for identificado
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Resumo diário por e-mail</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber relatório de atividades
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Timeout Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Tempos Limite
              </CardTitle>
              <CardDescription>
                Configure alertas de tempo de espera
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Alerta para P1 (minutos)</Label>
                <Input type="number" defaultValue={30} className="mt-1" />
              </div>
              <div>
                <Label>Alerta para P2 (horas)</Label>
                <Input type="number" defaultValue={2} className="mt-1" />
              </div>
              <div>
                <Label>Alerta para P3/P4 (horas)</Label>
                <Input type="number" defaultValue={6} className="mt-1" />
              </div>
              <div>
                <Label>Reavaliação automática (horas)</Label>
                <Input type="number" defaultValue={24} className="mt-1" />
                <p className="mt-1 text-xs text-muted-foreground">
                  Solicitar reavaliação após este período
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CFM Compliance */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Conformidade CFM 2.156/2016
              </CardTitle>
              <CardDescription>
                Configurações de conformidade regulatória
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <EthicsNotice />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>Exigir justificativa para negativas</Label>
                    <p className="text-sm text-muted-foreground">
                      Obrigatório selecionar motivo CFM
                    </p>
                  </div>
                  <Switch defaultChecked disabled />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>Registro de auditoria</Label>
                    <p className="text-sm text-muted-foreground">
                      Registrar todas as ações automaticamente
                    </p>
                  </div>
                  <Switch defaultChecked disabled />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>Aviso ético na tela</Label>
                    <p className="text-sm text-muted-foreground">
                      Exibir lembrete de não discriminação
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label>Alerta de Cuidados Paliativos</Label>
                    <p className="text-sm text-muted-foreground">
                      Destacar encaminhamento para P5
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
