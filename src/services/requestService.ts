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
  arrayUnion,
  Timestamp
} from "firebase/firestore";
import { RequestData, AuditEntry } from "@/types/request";

const COLLECTION_NAME = "siguti_requests";

export const addRequest = async (data: Omit<RequestData, "createdAt" | "status" | "auditHistory">) => {
  try {
    const initialAudit: AuditEntry = {
        action: 'created',
        timestamp: Timestamp.now(),
        userParams: 'Solicitante'
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      status: "pending_review",
      createdAt: serverTimestamp(),
      auditHistory: [initialAudit]
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding request: ", error);
    throw error;
  }
};

export const updateRequest = async (
    id: string,
    updates: Partial<RequestData>,
    auditEntry: Omit<AuditEntry, "timestamp">
) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            ...updates,
            auditHistory: arrayUnion({
                ...auditEntry,
                timestamp: Timestamp.now()
            })
        });
    } catch (error) {
        console.error("Error updating request: ", error);
        throw error;
    }
}

export const subscribeToPendingRequests = (callback: (requests: (RequestData & { id: string })[]) => void) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("status", "==", "pending_review")
  );

  return onSnapshot(q, (snapshot: QuerySnapshot) => {
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (RequestData & { id: string })[];

    // Client-side sort: Newest first
    requests.sort((a, b) => {
        const tA = a.createdAt?.seconds || 0;
        const tB = b.createdAt?.seconds || 0;
        return tB - tA;
    });

    callback(requests);
  });
};

export const subscribeToWaitingRequests = (callback: (requests: (RequestData & { id: string })[]) => void) => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("status", "==", "waiting_bed")
    );

    return onSnapshot(q, (snapshot: QuerySnapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as (RequestData & { id: string })[];

      // Client-side sort: Priority 1 -> 5, then EvaluatedAt (Oldest first)
      requests.sort((a, b) => {
          const pA = a.cfmPriority || 99;
          const pB = b.cfmPriority || 99;
          if (pA !== pB) return pA - pB;

          const tA = a.evaluatedAt?.seconds || 0;
          const tB = b.evaluatedAt?.seconds || 0;
          return tA - tB;
      });

      callback(requests);
    });
  };

export const subscribeToRegulatedRequests = (callback: (requests: (RequestData & { id: string })[]) => void) => {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("status", "==", "regulated")
    );

    return onSnapshot(q, (snapshot: QuerySnapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as (RequestData & { id: string })[];

      // Sort by newest regulated
      requests.sort((a, b) => {
          // Fallback to updated at or evaluated at
          const tA = a.evaluatedAt?.seconds || 0;
          const tB = b.evaluatedAt?.seconds || 0;
          return tB - tA;
      });

      callback(requests);
    });
};
