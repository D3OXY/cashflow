"use client";

import TransactionList from "@/components/transaction/transaction-list";
import { TransactionDialog } from "@/components/transaction/transaction-dialog";

export default function DashboardPage() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
                <TransactionDialog />
            </div>
            <TransactionList />
        </div>
    );
}
