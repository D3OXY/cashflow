import { collection, doc, getDoc, getDocs, query, setDoc, where, orderBy, deleteDoc, updateDoc, limit } from "firebase/firestore";
import { getDb } from "./config";
import { getAuth } from "firebase/auth";
import type { Transaction, CreateTransactionData } from "../types/transaction";

const TRANSACTIONS_COLLECTION = "transactions";

export async function createTransaction(data: CreateTransactionData): Promise<Transaction> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User not authenticated");
    }

    console.log("Creating transaction with data:", data);

    const db = getDb();
    const transactionsCollection = collection(db, TRANSACTIONS_COLLECTION);
    const newTransactionRef = doc(transactionsCollection);

    const now = new Date().toISOString();
    const newTransaction: Transaction = {
        id: newTransactionRef.id,
        ...data,
        note: data.note || "",
        metadata: data.metadata || {},
        createdAt: now,
        updatedAt: now,
        status: data.status || "pending",
    };

    console.log("Saving transaction:", newTransaction);
    await setDoc(newTransactionRef, newTransaction);
    return newTransaction;
}

export async function getTransaction(id: string): Promise<Transaction | null> {
    const db = getDb();
    const transactionDoc = await getDoc(doc(db, TRANSACTIONS_COLLECTION, id));
    return transactionDoc.exists() ? (transactionDoc.data() as Transaction) : null;
}

export async function getSpaceTransactions(spaceId: string): Promise<Transaction[]> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User not authenticated");
    }

    console.log("Fetching transactions for space:", spaceId);

    const db = getDb();
    const transactionsQuery = query(collection(db, TRANSACTIONS_COLLECTION), where("spaceId", "==", spaceId), orderBy("date", "desc"), orderBy("createdAt", "desc"));

    const snapshot = await getDocs(transactionsQuery);
    const transactions = snapshot.docs.map(
        (doc) =>
            ({
                ...doc.data(),
                id: doc.id,
            } as Transaction)
    );

    console.log("Found transactions:", transactions);
    return transactions;
}

export async function updateTransaction(id: string, data: Partial<Transaction>): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User not authenticated");
    }

    const db = getDb();
    const transactionRef = doc(db, TRANSACTIONS_COLLECTION, id);
    const transactionDoc = await getDoc(transactionRef);

    if (!transactionDoc.exists()) {
        throw new Error("Transaction not found");
    }

    const transaction = transactionDoc.data() as Transaction;

    // Verify ownership through spaceId
    const spaceDoc = await getDoc(doc(db, "spaces", transaction.spaceId));
    if (!spaceDoc.exists() || spaceDoc.data()?.userId !== user.uid) {
        throw new Error("Unauthorized to update this transaction");
    }

    await updateDoc(transactionRef, {
        ...data,
        updatedAt: new Date().toISOString(),
    });
}

export async function deleteTransaction(id: string): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User not authenticated");
    }

    const db = getDb();
    const transactionRef = doc(db, TRANSACTIONS_COLLECTION, id);
    const transactionDoc = await getDoc(transactionRef);

    if (!transactionDoc.exists()) {
        throw new Error("Transaction not found");
    }

    const transaction = transactionDoc.data() as Transaction;

    // Verify ownership through spaceId
    const spaceDoc = await getDoc(doc(db, "spaces", transaction.spaceId));
    if (!spaceDoc.exists() || spaceDoc.data()?.userId !== user.uid) {
        throw new Error("Unauthorized to delete this transaction");
    }

    await deleteDoc(transactionRef);
}

export async function isCategoryInUse(spaceId: string, categoryId: string): Promise<boolean> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User not authenticated");
    }

    const db = getDb();
    const transactionsQuery = query(
        collection(db, TRANSACTIONS_COLLECTION),
        where("spaceId", "==", spaceId),
        where("category", "==", categoryId),
        // Limit to 1 since we only need to know if any exist
        limit(1)
    );

    const snapshot = await getDocs(transactionsQuery);
    return !snapshot.empty;
}
