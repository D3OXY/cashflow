"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useTransaction } from "@/context/transaction";
import { useSpace } from "@/context/space";
import type { Transaction } from "@/lib/types/transaction";
import { toast } from "sonner";

const transactionSchema = z.object({
    type: z.enum(["Income", "Expense"]),
    date: z.date(),
    category: z.string().min(1, "Category is required"),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    note: z.string().optional().default(""),
    status: z.enum(["pending", "cleared", "reconciled"]).default("cleared"),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
    transaction?: Transaction;
    onSuccess?: () => void;
}

export function TransactionForm({ transaction, onSuccess }: TransactionFormProps) {
    const { currentSpace } = useSpace();
    const { createTransaction, updateTransaction } = useTransaction();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: transaction?.type ?? currentSpace?.settings?.defaultTransactionType ?? "Expense",
            date: transaction ? new Date(transaction.date) : new Date(),
            category: transaction?.category ?? "",
            amount: transaction?.amount ?? 0,
            note: transaction?.note ?? "",
            status: transaction?.status ?? "cleared",
        },
    });

    const onSubmit = async (data: TransactionFormData) => {
        if (!currentSpace) {
            console.error("No current space found");
            return;
        }

        try {
            setIsSubmitting(true);
            console.log("Submitting transaction form with data:", data);

            if (transaction) {
                await updateTransaction(transaction.id, {
                    ...data,
                    date: data.date.toISOString(),
                });
                toast.success("Transaction updated successfully");
            } else {
                const createData = {
                    ...data,
                    date: data.date.toISOString(),
                    spaceId: currentSpace.id,
                };
                console.log("Creating transaction with data:", createData);
                await createTransaction(createData);
                toast.success("Transaction created successfully");
            }
            onSuccess?.();
            if (!transaction) {
                form.reset({
                    type: currentSpace?.settings?.defaultTransactionType ?? "Expense",
                    date: new Date(),
                    category: "",
                    amount: 0,
                    note: "",
                    status: "cleared",
                });
            }
        } catch (error) {
            console.error("Failed to submit transaction:", error);
            toast.error("Failed to submit transaction", {
                description: error instanceof Error ? error.message : "Please try again later",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Income">Income</SelectItem>
                                    <SelectItem value="Expense">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue>
                                            {currentSpace?.categories.find((c) => c.id === field.value) && (
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="flex h-4 w-4 items-center justify-center rounded-full"
                                                        style={{ backgroundColor: currentSpace?.categories.find((c) => c.id === field.value)?.color }}
                                                    >
                                                        <span className="text-[10px]">{currentSpace?.categories.find((c) => c.id === field.value)?.icon}</span>
                                                    </div>
                                                    <span>{currentSpace?.categories.find((c) => c.id === field.value)?.name}</span>
                                                </div>
                                            )}
                                        </SelectValue>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {currentSpace?.categories
                                        .filter((category) => category.type === form.watch("type") || category.type === "Both")
                                        .map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-4 w-4 items-center justify-center rounded-full" style={{ backgroundColor: category.color }}>
                                                        <span className="text-[10px]">{category.icon}</span>
                                                    </div>
                                                    <span>{category.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="Enter amount"
                                    {...field}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Only update if it's a valid number or empty
                                        if (value === "" || !isNaN(parseFloat(value))) {
                                            field.onChange(value === "" ? 0 : parseFloat(value));
                                        }
                                    }}
                                    value={field.value === 0 ? "" : field.value}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Note</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Add a note (optional)" className="resize-none" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="cleared">Cleared</SelectItem>
                                    <SelectItem value="reconciled">Reconciled</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {transaction ? "Updating..." : "Creating..."}
                        </>
                    ) : transaction ? (
                        "Update Transaction"
                    ) : (
                        "Create Transaction"
                    )}
                </Button>
            </form>
        </Form>
    );
}
