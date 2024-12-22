"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { getDb } from "@/lib/firebase/config";
import { createTransaction, deleteTransaction as deleteTransactionFromDb, updateTransaction as updateTransactionFromDb } from "@/lib/firebase/transactions";
import type { Transaction, CreateTransactionData } from "@/lib/types/transaction";
import { useSpace } from "./space";

interface TransactionContextType {
    transactions: Transaction[];
    isLoading: boolean;
    error: Error | null;
    createTransaction: (data: CreateTransactionData) => Promise<void>;
    updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { currentSpace } = useSpace();

    useEffect(() => {
        if (!currentSpace) {
            setTransactions([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        const db = getDb();
        const q = query(collection(db, "transactions"), where("spaceId", "==", currentSpace.id), orderBy("date", "desc"), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const newTransactions = snapshot.docs.map(
                    (doc) =>
                        ({
                            ...doc.data(),
                            id: doc.id,
                        } as Transaction)
                );
                setTransactions(newTransactions);
                setIsLoading(false);
            },
            (err) => {
                console.error("Failed to fetch transactions:", err);
                setError(err as Error);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentSpace]);

    const handleCreateTransaction = async (data: CreateTransactionData) => {
        try {
            await createTransaction(data);
        } catch (err) {
            console.error("Failed to create transaction:", err);
            throw err;
        }
    };

    const handleUpdateTransaction = async (id: string, data: Partial<Transaction>) => {
        try {
            await updateTransactionFromDb(id, data);
        } catch (err) {
            console.error("Failed to update transaction:", err);
            throw err;
        }
    };

    const handleDeleteTransaction = async (id: string) => {
        try {
            await deleteTransactionFromDb(id);
        } catch (err) {
            console.error("Failed to delete transaction:", err);
            throw err;
        }
    };

    return (
        <TransactionContext.Provider
            value={{
                transactions,
                isLoading,
                error,
                createTransaction: handleCreateTransaction,
                updateTransaction: handleUpdateTransaction,
                deleteTransaction: handleDeleteTransaction,
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
}

export function useTransaction() {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error("useTransaction must be used within a TransactionProvider");
    }
    return context;
}
