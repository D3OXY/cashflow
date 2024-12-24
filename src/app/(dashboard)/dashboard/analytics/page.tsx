"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransaction } from "@/context/transaction";
import { useSpace } from "@/context/space";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart } from "recharts";
import { cn, formatCurrency } from "@/lib/utils";
import { addDays, format, startOfMonth, subMonths } from "date-fns";
import { Transaction } from "@/lib/types/transaction";
import { DateRangePickerInput } from "@/components/ui/date-range-picker-input";

export default function AnalyticsPage() {
    const { currentSpace } = useSpace();
    const { transactions } = useTransaction();
    const [date, setDate] = React.useState<{
        from: Date;
        to: Date;
    }>({
        from: startOfMonth(subMonths(new Date(), 1)),
        to: new Date(),
    });

    const filteredTransactions = React.useMemo(() => {
        if (!transactions) return [];
        return transactions.filter((transaction: Transaction) => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= date.from && transactionDate <= date.to;
        });
    }, [transactions, date]);

    const totalIncome = React.useMemo(() => {
        return filteredTransactions.filter((t: Transaction) => t.type === "Income").reduce((acc: number, t: Transaction) => acc + t.amount, 0);
    }, [filteredTransactions]);

    const totalExpense = React.useMemo(() => {
        return filteredTransactions.filter((t: Transaction) => t.type === "Expense").reduce((acc: number, t: Transaction) => acc + t.amount, 0);
    }, [filteredTransactions]);

    const categoryBreakdown = React.useMemo(() => {
        const breakdown = filteredTransactions.reduce((acc: Record<string, { income: number; expense: number }>, transaction: Transaction) => {
            const category = transaction.category;
            if (!acc[category]) {
                acc[category] = {
                    income: 0,
                    expense: 0,
                };
            }
            if (transaction.type === "Income") {
                acc[category].income += transaction.amount;
            } else {
                acc[category].expense += transaction.amount;
            }
            return acc;
        }, {});

        return Object.entries(breakdown).map(([category, data]) => ({
            name: category,
            income: data.income,
            expense: data.expense,
        }));
    }, [filteredTransactions]);

    const dailyData = React.useMemo(() => {
        const data: Record<string, { date: string; income: number; expense: number }> = {};
        const days = Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24));

        // Initialize all dates in range
        for (let i = 0; i <= days; i++) {
            const currentDate = addDays(date.from, i);
            const dateStr = format(currentDate, "yyyy-MM-dd");
            data[dateStr] = {
                date: dateStr,
                income: 0,
                expense: 0,
            };
        }

        // Fill in transaction data
        filteredTransactions.forEach((transaction: Transaction) => {
            const dateStr = format(new Date(transaction.date), "yyyy-MM-dd");
            if (transaction.type === "Income") {
                data[dateStr].income += transaction.amount;
            } else {
                data[dateStr].expense += transaction.amount;
            }
        });

        return Object.values(data);
    }, [filteredTransactions, date]);

    const chartConfig = {
        income: {
            label: "Income",
            theme: {
                light: "hsl(142.1 76.2% 36.3%)",
                dark: "hsl(142.1 70.6% 45.3%)",
            },
        },
        expense: {
            label: "Expense",
            theme: {
                light: "hsl(346.8 77.2% 49.8%)",
                dark: "hsl(346.8 77.2% 49.8%)",
            },
        },
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
                <DateRangePickerInput className="w-fit" value={date} onChange={setDate} align="end" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome, currentSpace?.currency)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense, currentSpace?.currency)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-bold", totalIncome - totalExpense >= 0 ? "text-green-600" : "text-red-600")}>
                            {formatCurrency(totalIncome - totalExpense, currentSpace?.currency)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer className="h-[300px]" config={chartConfig}>
                            <AreaChart data={dailyData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                                <defs>
                                    <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="income" name="income" stroke="var(--color-income)" fillOpacity={1} fill="url(#income)" />
                                <Area type="monotone" dataKey="expense" name="expense" stroke="var(--color-expense)" fillOpacity={1} fill="url(#expense)" />
                                <ChartTooltip
                                    content={({ active, payload }) => {
                                        if (!active || !payload) return null;
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid gap-2">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">Income</span>
                                                        <span className="text-[0.70rem] font-bold text-green-600">
                                                            {formatCurrency(payload[0]?.value as number, currentSpace?.currency)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">Expense</span>
                                                        <span className="text-[0.70rem] font-bold text-red-600">
                                                            {formatCurrency(payload[1]?.value as number, currentSpace?.currency)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Category Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer className="h-[300px]" config={chartConfig}>
                            <BarChart data={categoryBreakdown} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                                <Bar dataKey="income" name="income" fill="var(--color-income)" />
                                <Bar dataKey="expense" name="expense" fill="var(--color-expense)" />
                                <ChartTooltip
                                    content={({ active, payload }) => {
                                        if (!active || !payload) return null;
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid gap-2">
                                                    <div className="text-[0.70rem] font-medium">{payload[0]?.payload.name}</div>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">Income</span>
                                                        <span className="text-[0.70rem] font-bold text-green-600">
                                                            {formatCurrency(payload[0]?.value as number, currentSpace?.currency)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">Expense</span>
                                                        <span className="text-[0.70rem] font-bold text-red-600">
                                                            {formatCurrency(payload[1]?.value as number, currentSpace?.currency)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
