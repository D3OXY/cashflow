import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { getDb, getFirebaseAuth } from "./config";
import { Space } from "@/lib/types/space";

const SPACES_COLLECTION = "spaces";

export interface CreateSpaceData {
    name: string;
    currency: Space["currency"];
}

export async function createSpace(data: CreateSpaceData): Promise<Space> {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;

    if (!user) {
        throw new Error("User not authenticated");
    }

    const db = getDb();
    const spaceData: Space = {
        id: doc(collection(db, SPACES_COLLECTION)).id, // Generate a new ID
        name: data.name,
        currency: data.currency,
        icon: "💰", // Default icon
        categories: [], // Default empty categories
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.uid, // Add user ID to space
    };

    // Create the space document with the generated ID
    await setDoc(doc(db, SPACES_COLLECTION, spaceData.id), spaceData);

    return spaceData;
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
