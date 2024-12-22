"use client";

import { useTransaction } from "@/context/transaction";
import { useSpace } from "@/context/space";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TransactionList() {
    const { transactions, isLoading, error, deleteTransaction } = useTransaction();
    const { currentSpace } = useSpace();

    const handleDelete = async (id: string) => {
        try {
            await deleteTransaction(id);
            toast.success("Transaction deleted successfully");
        } catch (error) {
            toast.error("Failed to delete transaction", {
                description: error instanceof Error ? error.message : "Please try again later",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[200px] text-destructive">
                <p>Failed to load transactions</p>
            </div>
        );
    }

    if (!transactions?.length) {
        return (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                <p>No transactions found</p>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>Your recent transactions</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Note</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => {
                            const category = currentSpace?.categories.find((c) => c.id === transaction.category);
                            return (
                                <TableRow key={transaction.id}>
                                    <TableCell>{format(new Date(transaction.date), "MMM d, yyyy")}</TableCell>
                                    <TableCell>
                                        <Badge variant={transaction.type === "Income" ? "default" : "destructive"}>{transaction.type}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {category && (
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-4 w-4 items-center justify-center rounded-full" style={{ backgroundColor: category.color }}>
                                                    <span className="text-[10px]">{category.icon}</span>
                                                </div>
                                                <span>{category.name}</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">{transaction.note}</TableCell>
                                    <TableCell
                                        className={cn("text-right font-medium", {
                                            "text-green-600 dark:text-green-400": transaction.type === "Income",
                                            "text-red-600 dark:text-red-400": transaction.type === "Expense",
                                        })}
                                    >
                                        {transaction.type === "Income" ? "+" : "-"}
                                        {transaction.amount.toLocaleString("en-IN", {
                                            style: "currency",
                                            currency: currentSpace?.currency ?? "INR",
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{transaction.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDelete(transaction.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
