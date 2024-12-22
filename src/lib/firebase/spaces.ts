import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { getDb, getFirebaseAuth } from "./config";
import { Space } from "@/lib/types/space";

const SPACES_COLLECTION = "spaces";

export interface CreateSpaceData {
    name: string;
    currency: "INR" | "USD" | "EUR";
    icon: string;
}

export async function createSpaceInDb(data: CreateSpaceData, userId: string): Promise<Space> {
    const db = getDb();
    const spacesCollection = collection(db, "spaces");
    const newSpaceRef = doc(spacesCollection);

    const now = new Date().toISOString();
    const newSpace: Space = {
        id: newSpaceRef.id,
        name: data.name,
        icon: data.icon || "💰",
        currency: data.currency,
        categories: [],
        createdAt: now,
        updatedAt: now,
        userId,
        settings: {
            defaultView: "monthly",
            startOfWeek: 1,
            defaultTransactionType: "Expense",
            showRunningBalance: true,
            categorySortOrder: "alphabetical",
        },
    };

    await setDoc(newSpaceRef, newSpace);
    return newSpace;
}

export async function getSpace(id: string): Promise<Space | null> {
    const db = getDb();
    const spaceDoc = await getDoc(doc(db, SPACES_COLLECTION, id));
    return spaceDoc.exists() ? (spaceDoc.data() as Space) : null;
}

export async function getUserSpaces(): Promise<Space[]> {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error("User not authenticated");
    }

    const db = getDb();
    const spacesQuery = query(collection(db, SPACES_COLLECTION), where("userId", "==", user.uid));

    const snapshot = await getDocs(spacesQuery);
    return snapshot.docs.map((doc) => doc.data() as Space);
}
