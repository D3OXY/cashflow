import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { getFirebase } from "./config";
import type { Space, SpaceSettings, Category } from "@/lib/types/space";
import { Wallet, LineChart, UtensilsCrossed, Car, ShoppingBag, Receipt } from "lucide-react";

const DEFAULT_SPACE_SETTINGS: SpaceSettings = {
    defaultView: "monthly",
    startOfWeek: 0,
    defaultTransactionType: "Expense",
    showRunningBalance: true,
    categorySortOrder: "alphabetical",
};

const DEFAULT_CATEGORIES: Category[] = [
    { id: "salary", name: "Salary", type: "Income", color: "#22c55e", icon: Wallet },
    { id: "investment", name: "Investment", type: "Income", color: "#3b82f6", icon: LineChart },
    { id: "food", name: "Food & Dining", type: "Expense", color: "#ef4444", icon: UtensilsCrossed },
    { id: "transport", name: "Transportation", type: "Expense", color: "#f59e0b", icon: Car },
    { id: "shopping", name: "Shopping", type: "Expense", color: "#8b5cf6", icon: ShoppingBag },
    { id: "bills", name: "Bills & Utilities", type: "Expense", color: "#ec4899", icon: Receipt },
];

export async function createSpace(userId: string, data: Partial<Space>): Promise<Space> {
    const { db } = getFirebase();
    const spacesRef = collection(db, `users/${userId}/spaces`);
    const spaceRef = doc(spacesRef);

    const space: Space = {
        id: spaceRef.id,
        name: data.name || "My Space",
        icon: data.icon || "💰",
        currency: data.currency || "USD",
        categories: data.categories || DEFAULT_CATEGORIES,
        settings: data.settings || DEFAULT_SPACE_SETTINGS,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    await setDoc(spaceRef, space);
    return space;
}

export async function getSpace(userId: string, spaceId: string): Promise<Space | null> {
    const { db } = getFirebase();
    const spaceRef = doc(db, `users/${userId}/spaces/${spaceId}`);
    const spaceSnap = await getDoc(spaceRef);

    if (!spaceSnap.exists()) {
        return null;
    }

    return { id: spaceSnap.id, ...spaceSnap.data() } as Space;
}

export async function getUserSpaces(userId: string): Promise<Space[]> {
    const { db } = getFirebase();
    const spacesRef = collection(db, `users/${userId}/spaces`);
    const q = query(spacesRef, orderBy("createdAt", "desc"));
    const spacesSnap = await getDocs(q);

    return spacesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Space));
}

export async function updateSpace(userId: string, spaceId: string, data: Partial<Space>): Promise<void> {
    const { db } = getFirebase();
    const spaceRef = doc(db, `users/${userId}/spaces/${spaceId}`);

    const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
    };

    await updateDoc(spaceRef, updateData);
}

export async function deleteSpace(userId: string, spaceId: string): Promise<void> {
    const { db } = getFirebase();
    const spaceRef = doc(db, `users/${userId}/spaces/${spaceId}`);
    await deleteDoc(spaceRef);
}
