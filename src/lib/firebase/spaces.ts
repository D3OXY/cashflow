import { collection, doc, getDoc, getDocs, query, setDoc, where, deleteDoc, updateDoc } from "firebase/firestore";
import { getDb } from "./config";
import { getAuth } from "firebase/auth";
import type { Space, Category } from "../types/space";
import { DEFAULT_CATEGORIES } from "@/lib/constants";

const SPACES_COLLECTION = "spaces";

export interface CreateSpaceData {
    name: string;
    currency: "INR" | "USD" | "EUR";
    icon: string;
    categories?: Category[];
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
        categories: data.categories || getDefaultCategories(),
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

export async function updateSpace(id: string, data: Partial<Space>): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User not authenticated");
    }

    const db = getDb();
    const spaceRef = doc(db, "spaces", id);
    const spaceDoc = await getDoc(spaceRef);

    if (!spaceDoc.exists()) {
        throw new Error("Space not found");
    }

    if (spaceDoc.data().userId !== user.uid) {
        throw new Error("Not authorized");
    }

    await updateDoc(spaceRef, {
        ...data,
        updatedAt: new Date().toISOString(),
    });
}

export async function addCategory(spaceId: string, category: Omit<Category, "id">): Promise<void> {
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

    if (spaceDoc.data().userId !== user.uid) {
        throw new Error("Not authorized");
    }

    const space = spaceDoc.data() as Space;
    const newCategory: Category = {
        id: crypto.randomUUID(),
        ...category,
    };

    await updateDoc(spaceRef, {
        categories: [...space.categories, newCategory],
        updatedAt: new Date().toISOString(),
    });
}

export async function deleteCategory(spaceId: string, categoryId: string): Promise<void> {
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

    if (spaceDoc.data().userId !== user.uid) {
        throw new Error("Not authorized");
    }

    const space = spaceDoc.data() as Space;
    await updateDoc(spaceRef, {
        categories: space.categories.filter((c) => c.id !== categoryId),
        updatedAt: new Date().toISOString(),
    });
}

export async function updateCategory(spaceId: string, categoryId: string, data: Partial<Category>): Promise<void> {
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

    if (spaceDoc.data().userId !== user.uid) {
        throw new Error("Not authorized");
    }

    const space = spaceDoc.data() as Space;
    await updateDoc(spaceRef, {
        categories: space.categories.map((c) => (c.id === categoryId ? { ...c, ...data } : c)),
        updatedAt: new Date().toISOString(),
    });
}

function getDefaultCategories(): Category[] {
    return [...DEFAULT_CATEGORIES];
}
