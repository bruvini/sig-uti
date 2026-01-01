import React, { useState, useEffect } from "react";
import {
    subscribeToActiveDischarges,
    subscribeToDischargeStats,
    confirmDischarge
} from "@/services/dischargeService";
import { DischargeAssessment } from "@/types/discharge";
import DischargeAssessmentModal from "./DischargeAssessmentModal";
import DischargeReviewModal from "./DischargeReviewModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    CheckCircle2,
    AlertTriangle,
    DoorOpen,
    FileSignature,
    Timer,
    ArrowRight
} from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

const DischargeManagement = () => {
    const [activeDischarges, setActiveDischarges] = useState<(DischargeAssessment & { id: string })[]>([]);
    const [stats, setStats] = useState({ eligible: 0, discharged: 0, barrier: 0 });

    // Modal State
    const [reviewOpen, setReviewOpen] = useState(false);
    const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

    useEffect(() => {
        const unsubList = subscribeToActiveDischarges(setActiveDischarges);
        const unsubStats = subscribeToDischargeStats(setStats);
        return () => {
            unsubList();
            unsubStats();
        };
    }, []);

    const handleReview = (id: string) => {
        setSelectedAssessmentId(id);
        setReviewOpen(true);
    };

    const handleConfirm = async (assessmentId: string, bedId: string) => {
        try {
            await confirmDischarge(assessmentId, bedId);
        } catch(e) {
            console.error(e);
        }
    };

    const getDaysStay = (dateStr: string) => {
        try {
            const days = differenceInDays(new Date(), parseISO(dateStr));
            return days;
        } catch {
            return 0;
        }
    };

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-green-500 rounded-full" />
                    <h2 className="text-lg font-semibold tracking-tight text-gray-800">Gestão de Altas e Giro de Leito</h2>
                </div>
                <DischargeAssessmentModal />
            </div>

            {/* MINI DASHBOARD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white border-green-100 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">Elegíveis CFM</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.eligible}</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </CardContent>
                </Card>
                <Card className="bg-white border-blue-100 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">Altas Efetivadas</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.discharged}</p>
                        </div>
                        <DoorOpen className="h-5 w-5 text-blue-500" />
                    </CardContent>
                </Card>
                <Card className="bg-white border-amber-100 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">Retidos / Barreira</p>
                            <p className="text-2xl font-bold text-amber-600">{stats.barrier}</p>
                        </div>
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                    </CardContent>
                </Card>
            </div>

            {/* LIST OF ACTIVE DISCHARGES */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-700">Pacientes em Análise de Alta</h3>
                    <Badge variant="outline">{activeDischarges.length}</Badge>
                </div>

                <ScrollArea className="h-[300px]">
                    {activeDischarges.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                            <CheckCircle2 className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">Nenhum paciente aguardando alta.</p>
                        </div>
                    ) : (
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeDischarges.map(d => {
                                const days = getDaysStay(d.admissionDate);
                                return (
                                    <div key={d.id} className="border rounded-lg p-3 flex flex-col gap-3 bg-white hover:shadow-md transition-shadow relative">
                                        {d.status === 'administrative_barrier' && (
                                            <div className="absolute top-0 right-0 bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
                                                Barreira Administrativa
                                            </div>
                                        )}

                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900">{d.patientName}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary" className="text-[10px]">{d.unitName} • Leito {d.bedNumber}</Badge>
                                            </div>
                                        </div>

                                        <div className={`flex items-center gap-2 text-xs font-medium ${days > 7 ? 'text-red-600' : 'text-gray-500'}`}>
                                            <Timer className="h-3 w-3" />
                                            {days} dias de internação
                                        </div>

                                        <div className="flex gap-2 mt-auto pt-2 border-t">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 text-xs h-8"
                                                onClick={() => handleReview(d.id)}
                                            >
                                                <FileSignature className="h-3 w-3 mr-1" /> Análise
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="flex-1 text-xs h-8 bg-green-600 hover:bg-green-700"
                                                onClick={() => handleConfirm(d.id, d.bedId)}
                                            >
                                                <ArrowRight className="h-3 w-3 mr-1" /> Confirmar Saída
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {selectedAssessmentId && (
                <DischargeReviewModal
                    assessmentId={selectedAssessmentId}
                    open={reviewOpen}
                    onOpenChange={setReviewOpen}
                />
            )}
        </section>
    );
};

export default DischargeManagement;
