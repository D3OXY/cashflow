"use client";

import { createContext, useContext, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Transaction, CreateTransactionData } from "@/lib/types/transaction";
import { createTransaction, getSpaceTransactions, updateTransaction, deleteTransaction } from "@/lib/firebase/transactions";
import { useSpace } from "./space";
import { toast } from "sonner";

interface TransactionContextType {
    transactions: Transaction[] | undefined;
    isLoading: boolean;
    error: Error | null;
    createTransaction: (data: CreateTransactionData) => Promise<Transaction>;
    updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const { currentSpace } = useSpace();

    // Fetch transactions for current space
    const {
        data: transactions,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["transactions", currentSpace?.id],
        queryFn: () => (currentSpace ? getSpaceTransactions(currentSpace.id) : Promise.resolve([])),
        enabled: !!currentSpace,
    });

    // Create transaction mutation
    const createMutation = useMutation({
        mutationFn: createTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions", currentSpace?.id] });
            toast.success("Transaction created successfully");
        },
        onError: (error) => {
            console.error("Failed to create transaction:", error);
            toast.error("Failed to create transaction");
        },
    });

    // Update transaction mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Transaction> }) => updateTransaction(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions", currentSpace?.id] });
            toast.success("Transaction updated successfully");
        },
        onError: (error) => {
            console.error("Failed to update transaction:", error);
            toast.error("Failed to update transaction");
        },
    });

    // Delete transaction mutation
    const deleteMutation = useMutation({
        mutationFn: deleteTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions", currentSpace?.id] });
            toast.success("Transaction deleted successfully");
        },
        onError: (error) => {
            console.error("Failed to delete transaction:", error);
            toast.error("Failed to delete transaction");
        },
    });

    const handleCreateTransaction = useCallback(
        async (data: CreateTransactionData) => {
            return createMutation.mutateAsync(data);
        },
        [createMutation]
    );

    const handleUpdateTransaction = useCallback(
        async (id: string, data: Partial<Transaction>) => {
            return updateMutation.mutateAsync({ id, data });
        },
        [updateMutation]
    );

    const handleDeleteTransaction = useCallback(
        async (id: string) => {
            return deleteMutation.mutateAsync(id);
        },
        [deleteMutation]
    );

    return (
        <TransactionContext.Provider
            value={{
                transactions,
                isLoading,
                error: error as Error | null,
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
    if (context === undefined) {
        throw new Error("useTransaction must be used within a TransactionProvider");
    }
    return context;
}
