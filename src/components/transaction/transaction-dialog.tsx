"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TransactionForm } from "./transaction-form";
import type { Transaction } from "@/lib/types/transaction";
import { useState } from "react";

interface TransactionDialogProps {
    transaction?: Transaction;
    trigger?: React.ReactNode;
}

export function TransactionDialog({ transaction, trigger }: TransactionDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Transaction
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{transaction ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
                    <DialogDescription>{transaction ? "Make changes to your transaction here." : "Add a new transaction to your space."}</DialogDescription>
                </DialogHeader>
                <TransactionForm transaction={transaction} onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}
