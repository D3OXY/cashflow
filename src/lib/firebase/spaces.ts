import { collection, doc, getDoc, getDocs, query, setDoc, where, deleteDoc } from "firebase/firestore";
import { getDb } from "./config";
import { getAuth } from "firebase/auth";
import type { Space } from "../types/space";

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
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error("User not authenticated");
    }

    const db = getDb();
    const spacesQuery = query(collection(db, SPACES_COLLECTION), where("userId", "==", user.uid));

    const snapshot = await getDocs(spacesQuery);
    return snapshot.docs.map((doc) => doc.data() as Space);
}

export async function deleteSpace(spaceId: string): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User not authenticated");
    }

    const db = getDb();
    const spaceRef = doc(db, "spaces", spaceId);
    const spaceDoc = await getDoc(spaceRef);

    if (!spaceDoc.exists()) {
        throw new Error("Space not found");
    }

    const spaceData = spaceDoc.data() as Space;
    if (spaceData.userId !== user.uid) {
        throw new Error("Unauthorized to delete this space");
    }

    await deleteDoc(spaceRef);
}
