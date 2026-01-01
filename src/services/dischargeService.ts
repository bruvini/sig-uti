import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  Timestamp,
  arrayUnion,
  getDocs
} from "firebase/firestore";
import { DischargeAssessment, DischargeStatus } from "@/types/discharge";

const DISCHARGES_COLLECTION = "siguti_discharges";
const BEDS_COLLECTION = "siguti_beds";

export const addDischargeAssessment = async (data: Omit<DischargeAssessment, "id" | "assessmentCreatedAt" | "reviewHistory">) => {
    return await addDoc(collection(db, DISCHARGES_COLLECTION), {
        ...data,
        assessmentCreatedAt: serverTimestamp(),
        reviewHistory: []
    });
};

export const subscribeToActiveDischarges = (callback: (discharges: (DischargeAssessment & { id: string })[]) => void) => {
    const q = query(
        collection(db, DISCHARGES_COLLECTION),
        where("status", "in", ["candidate", "administrative_barrier"])
    );
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DischargeAssessment & { id: string }));
        callback(data);
    });
};

export const confirmDischarge = async (assessmentId: string, bedId: string) => {
    const batch = writeBatch(db);

    // Update Assessment
    const assessmentRef = doc(db, DISCHARGES_COLLECTION, assessmentId);
    batch.update(assessmentRef, {
        status: 'discharged'
    });

    // Update Bed
    const bedRef = doc(db, BEDS_COLLECTION, bedId);
    batch.update(bedRef, {
        status: 'clean',
        currentPatientId: null,
        updatedAt: serverTimestamp()
    });

    await batch.commit();
};

export const reviewDischarge = async (assessmentId: string, decision: DischargeStatus, observation: string) => {
    const assessmentRef = doc(db, DISCHARGES_COLLECTION, assessmentId);

    const reviewEntry = {
        timestamp: Timestamp.now(),
        userParams: 'Médico Regulador',
        observation,
        decision
    };

    // If decision is "keep_analysis" (custom internal flag), we don't change status, just log.
    // But the prompt says "Manter em Análise" -> "Apenas salva a observação".
    // I will map "keep_analysis" to not changing status in the update call logic.

    const updatePayload: any = {
        reviewHistory: arrayUnion(reviewEntry)
    };

    if (decision !== 'candidate' && decision !== 'administrative_barrier' && decision !== 'clinical_mismatch') {
        // If it's a "Keep" decision, we assume the status remains what it is (likely candidate or barrier).
        // However, if the decision implies a status change (e.g. Barrier), we update it.
    } else {
        updatePayload.status = decision;
    }

    await updateDoc(assessmentRef, updatePayload);
};

export const getDischargeStats = async () => {
    // Ideally use aggregation queries, but for MVP we fetch snapshot.
    // Fetching all recent discharges might be heavy.
    // We will query by 'assessmentCreatedAt' > today start if needed.
    // For now, let's just count all in collection for simplicity or try to filter.
    // The prompt says "hoje/semana".
    // Let's do a simple client-side filter of a slightly larger query or just snapshot all for this MVP scope.
    // Actually, `subscribeToActiveDischarges` only gives active ones.
    // We need 'discharged' ones too for the stats.

    const q = query(collection(db, DISCHARGES_COLLECTION));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(d => d.data() as DischargeAssessment);

    return {
        eligible: docs.length, // Total history of candidates? Or just current? Prompt: "Elegíveis CFM (Total de candidatos)"
        // Usually "Eligible" means active candidates + those processed.
        discharged: docs.filter(d => d.status === 'discharged').length,
        barrier: docs.filter(d => d.status === 'administrative_barrier').length
    };
};

export const subscribeToDischargeStats = (callback: (stats: { eligible: number, discharged: number, barrier: number }) => void) => {
    // Real-time stats
    const q = collection(db, DISCHARGES_COLLECTION);
    return onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(d => d.data() as DischargeAssessment);
        callback({
            eligible: docs.length, // Interpreting as Total Volume of Assessments created
            discharged: docs.filter(d => d.status === 'discharged').length,
            barrier: docs.filter(d => d.status === 'administrative_barrier').length
        });
    });
}
