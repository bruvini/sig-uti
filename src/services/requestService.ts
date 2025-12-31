import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  orderBy,
  QuerySnapshot
} from "firebase/firestore";
import { RequestData } from "@/types/request";

const COLLECTION_NAME = "siguti_requests";

export const addRequest = async (data: Omit<RequestData, "createdAt" | "status">) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      status: "pending_review",
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding request: ", error);
    throw error;
  }
};

export const subscribeToPendingRequests = (callback: (requests: (RequestData & { id: string })[]) => void) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("status", "==", "pending_review"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot: QuerySnapshot) => {
    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (RequestData & { id: string })[];
    callback(requests);
  });
};
