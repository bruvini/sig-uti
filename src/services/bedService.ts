import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  orderBy,
  QuerySnapshot,
  doc,
  updateDoc,
  writeBatch,
  getDocs,
  Timestamp,
  arrayUnion,
  deleteDoc
} from "firebase/firestore";
import { Unit, Bed, BedStatus } from "@/types/bed";
import { RequestData, AuditEntry } from "@/types/request";

const UNITS_COLLECTION = "siguti_units";
const BEDS_COLLECTION = "siguti_beds";
const REQUESTS_COLLECTION = "siguti_requests";

// UNITS
export const addUnit = async (unit: Omit<Unit, "id" | "createdAt">) => {
    return await addDoc(collection(db, UNITS_COLLECTION), {
        ...unit,
        createdAt: serverTimestamp()
    });
};

export const updateUnit = async (id: string, data: Partial<Unit>) => {
    const ref = doc(db, UNITS_COLLECTION, id);
    await updateDoc(ref, data);
};

export const deleteUnit = async (id: string) => {
    // Optional: Check if unit has beds before deleting
    const ref = doc(db, UNITS_COLLECTION, id);
    await deleteDoc(ref);
};

export const subscribeToUnits = (callback: (units: (Unit & { id: string })[]) => void) => {
    const q = query(collection(db, UNITS_COLLECTION), orderBy("name"));
    return onSnapshot(q, (snapshot) => {
        const units = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit & { id: string }));
        callback(units);
    });
};

// BEDS
export const subscribeToBeds = (callback: (beds: (Bed & { id: string })[]) => void) => {
    const q = query(collection(db, BEDS_COLLECTION), orderBy("bedNumber"));
    return onSnapshot(q, (snapshot) => {
        const beds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bed & { id: string }));
        callback(beds);
    });
};

export const updateBed = async (id: string, data: Partial<Bed>) => {
    const ref = doc(db, BEDS_COLLECTION, id);
    await updateDoc(ref, {
        ...data,
        updatedAt: serverTimestamp()
    });
};

export const deleteBed = async (id: string) => {
    const ref = doc(db, BEDS_COLLECTION, id);
    await deleteDoc(ref);
};

export const bulkCreateBeds = async (unitId: string, unitName: string, start: number, end: number) => {
    const q = query(collection(db, BEDS_COLLECTION), where("unitId", "==", unitId));
    const snapshot = await getDocs(q);
    const existingNumbers = new Set(snapshot.docs.map(d => d.data().bedNumber));

    const batch = writeBatch(db);
    let count = 0;

    for (let i = start; i <= end; i++) {
        if (!existingNumbers.has(i)) {
            const newBedRef = doc(collection(db, BEDS_COLLECTION));
            batch.set(newBedRef, {
                unitId,
                unitName,
                bedNumber: i,
                status: "closed",
                currentPatientId: null,
                updatedAt: serverTimestamp()
            });
            count++;
        }
    }

    if (count > 0) {
        await batch.commit();
    }
    return count;
};

export const updateBedStatus = async (bedId: string, status: BedStatus) => {
    const bedRef = doc(db, BEDS_COLLECTION, bedId);
    await updateDoc(bedRef, {
        status,
        updatedAt: serverTimestamp()
    });
};

// ASSIGNMENT (Regulation)
export const assignPatientToBed = async (
    requestId: string,
    bedId: string,
    unitId: string,
    justification?: string
) => {
    const batch = writeBatch(db);

    // 1. Update Request
    const requestRef = doc(db, REQUESTS_COLLECTION, requestId);

    const auditEntry: AuditEntry = {
        action: 'regulated',
        timestamp: Timestamp.now(),
        userParams: 'Médico Regulador',
        reason: justification || 'Regulação padrão'
    };

    batch.update(requestRef, {
        status: 'regulated',
        assignedBedId: bedId,
        assignedUnitId: unitId,
        regulationJustification: justification || null,
        auditHistory: arrayUnion(auditEntry)
    });

    // 2. Update Bed
    const bedRef = doc(db, BEDS_COLLECTION, bedId);
    batch.update(bedRef, {
        status: 'occupied',
        currentPatientId: requestId,
        updatedAt: serverTimestamp()
    });

    await batch.commit();
};

export const confirmAdmission = async (requestId: string) => {
    const ref = doc(db, REQUESTS_COLLECTION, requestId);
    await updateDoc(ref, {
        status: 'admitted',
        auditHistory: arrayUnion({
            action: 'admitted',
            timestamp: Timestamp.now(),
            userParams: 'Enfermagem/Administrativo'
        })
    });
};

export const cancelRegulation = async (requestId: string, bedId: string) => {
    const batch = writeBatch(db);

    // Revert Request
    const requestRef = doc(db, REQUESTS_COLLECTION, requestId);
    batch.update(requestRef, {
        status: 'waiting_bed',
        assignedBedId: null,
        assignedUnitId: null,
        auditHistory: arrayUnion({
            action: 'regulation_cancelled',
            timestamp: Timestamp.now(),
            userParams: 'Médico Regulador',
            reason: 'Cancelamento de regulação'
        })
    });

    // Revert Bed
    const bedRef = doc(db, BEDS_COLLECTION, bedId);
    batch.update(bedRef, {
        status: 'clean', // Or should it go back to clean? Usually yes.
        currentPatientId: null,
        updatedAt: serverTimestamp()
    });

    await batch.commit();
};
