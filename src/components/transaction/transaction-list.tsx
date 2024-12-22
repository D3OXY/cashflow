"use client";

import { useTransaction } from "@/context/transaction";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TransactionList() {
    const { transactions, isLoading, error } = useTransaction();

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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell>{format(new Date(transaction.date), "MMM d, yyyy")}</TableCell>
                                <TableCell>
                                    <Badge variant={transaction.type === "Income" ? "default" : "destructive"}>{transaction.type}</Badge>
                                </TableCell>
                                <TableCell>{transaction.category}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{transaction.note}</TableCell>
                                <TableCell
                                    className={cn("text-right font-medium", {
                                        "text-green-600 dark:text-green-400": transaction.type === "Income",
                                        "text-red-600 dark:text-red-400": transaction.type === "Expense",
                                    })}
                                >
                                    {transaction.type === "Income" ? "+" : "-"}
                                    {transaction.amount.toLocaleString("en-US", {
                                        style: "currency",
                                        currency: "USD", // TODO: Use space currency
                                    })}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{transaction.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
