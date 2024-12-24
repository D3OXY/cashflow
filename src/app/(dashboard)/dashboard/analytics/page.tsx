"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { DateRangePickerInput } from "@/components/ui/date-range-picker-input";
import { useSpace } from "@/context/space";
import { useTransaction } from "@/context/transaction";
import { Transaction } from "@/lib/types/transaction";
import { cn, formatCurrency } from "@/lib/utils";
import { addDays, endOfDay, endOfMonth, endOfWeek, endOfYear, format, startOfDay, startOfMonth, startOfWeek, startOfYear } from "date-fns";
import * as React from "react";
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp } from "lucide-react";

const CHART_COLORS = {
    income: {
        light: "hsl(142.1 76.2% 36.3%)",
        dark: "hsl(142.1 70.6% 45.3%)",
    },
    expense: {
        light: "hsl(346.8 77.2% 49.8%)",
        dark: "hsl(346.8 77.2% 49.8%)",
    },
};

const PIE_COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#6366f1", "#14b8a6", "#6b7280"];

const chartConfig = {
    income: {
        label: "Income",
        color: CHART_COLORS.income.light,
    },
    expense: {
        label: "Expense",
        color: CHART_COLORS.expense.light,
    },
} satisfies ChartConfig;

export default function AnalyticsPage() {
    const { currentSpace } = useSpace();
    const { transactions } = useTransaction();
    const [date, setDate] = useState<{
        from: Date;
        to: Date;
    }>(() => {
        const today = new Date();
        const defaultView = currentSpace?.settings?.defaultView || "monthly";

        switch (defaultView) {
            case "daily":
                return {
                    from: startOfDay(today),
                    to: endOfDay(today),
                };
            case "weekly":
                return {
                    from: startOfWeek(today, { weekStartsOn: currentSpace?.settings?.startOfWeek || 1 }),
                    to: endOfWeek(today, { weekStartsOn: currentSpace?.settings?.startOfWeek || 1 }),
                };
            case "yearly":
                return {
                    from: startOfYear(today),
                    to: endOfYear(today),
                };
            case "monthly":
            default:
                return {
                    from: startOfMonth(today),
                    to: endOfMonth(today),
                };
        }
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

    // Get previous period data for comparison
    const previousPeriodData = React.useMemo(() => {
        const periodLength = date.to.getTime() - date.from.getTime();
        const previousFrom = new Date(date.from.getTime() - periodLength);
        const previousTo = new Date(date.to.getTime() - periodLength);

        const previousTransactions = transactions.filter((transaction: Transaction) => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= previousFrom && transactionDate <= previousTo;
        });

        const prevIncome = previousTransactions.filter((t: Transaction) => t.type === "Income").reduce((acc: number, t: Transaction) => acc + t.amount, 0);

        const prevExpense = previousTransactions.filter((t: Transaction) => t.type === "Expense").reduce((acc: number, t: Transaction) => acc + t.amount, 0);

        return {
            income: prevIncome,
            expense: prevExpense,
        };
    }, [transactions, date]);

    const categoryBreakdown = React.useMemo(() => {
        const breakdown = filteredTransactions.reduce((acc: Record<string, { income: number; expense: number }>, transaction: Transaction) => {
            const category = currentSpace?.categories.find((c) => c.id === transaction.category);
            const categoryName = category ? `${category.icon} ${category.name}` : transaction.category;

            if (!acc[categoryName]) {
                acc[categoryName] = {
                    income: 0,
                    expense: 0,
                };
            }
            if (transaction.type === "Income") {
                acc[categoryName].income += transaction.amount;
            } else {
                acc[categoryName].expense += transaction.amount;
            }
            return acc;
        }, {});

        return Object.entries(breakdown).map(([name, data]) => ({
            name,
            income: data.income,
            expense: data.expense,
            total: data.income - data.expense,
        }));
    }, [filteredTransactions, currentSpace?.categories]);

    const pieChartData = React.useMemo(() => {
        const incomeData = categoryBreakdown
            .filter((cat) => cat.income > 0)
            .map((cat) => ({
                name: cat.name,
                value: cat.income,
                type: "Income",
            }));

        const expenseData = categoryBreakdown
            .filter((cat) => cat.expense > 0)
            .map((cat) => ({
                name: cat.name,
                value: cat.expense,
                type: "Expense",
            }));

        return { income: incomeData, expense: expenseData };
    }, [categoryBreakdown]);

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

    const getPercentageChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
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
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome, currentSpace?.currency)}</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            {getPercentageChange(totalIncome, previousPeriodData.income) > 0 ? (
                                <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                            ) : (
                                <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
                            )}
                            <span className={cn(getPercentageChange(totalIncome, previousPeriodData.income) > 0 ? "text-green-600" : "text-red-600")}>
                                {Math.abs(getPercentageChange(totalIncome, previousPeriodData.income)).toFixed(1)}%
                            </span>
                            <span className="ml-1">from previous period</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense, currentSpace?.currency)}</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            {getPercentageChange(totalExpense, previousPeriodData.expense) > 0 ? (
                                <ArrowUp className="h-3 w-3 text-red-600 mr-1" />
                            ) : (
                                <ArrowDown className="h-3 w-3 text-green-600 mr-1" />
                            )}
                            <span className={cn(getPercentageChange(totalExpense, previousPeriodData.expense) > 0 ? "text-red-600" : "text-green-600")}>
                                {Math.abs(getPercentageChange(totalExpense, previousPeriodData.expense)).toFixed(1)}%
                            </span>
                            <span className="ml-1">from previous period</span>
                        </div>
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
                        <div className="text-xs text-muted-foreground mt-1">
                            Savings Rate: {totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1) : 0}%
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
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyData} margin={{ top: 10, right: 10, bottom: 20, left: 40 }}>
                                    <defs>
                                        <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={CHART_COLORS.income.light} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={CHART_COLORS.income.light} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={CHART_COLORS.expense.light} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={CHART_COLORS.expense.light} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="date" tickFormatter={(date) => format(new Date(date), "MMM d")} className="text-xs" />
                                    <YAxis tickFormatter={(value) => formatCurrency(value, currentSpace?.currency)} className="text-xs" />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (!active || !payload) return null;
                                            return (
                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                    <div className="grid gap-2">
                                                        <div className="text-[0.70rem] font-medium">{format(new Date(payload[0]?.payload.date), "PPP")}</div>
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
                                    <Legend />
                                    <Area type="monotone" dataKey="income" name="Income" stroke={CHART_COLORS.income.light} fill="url(#income)" />
                                    <Area type="monotone" dataKey="expense" name="Expense" stroke={CHART_COLORS.expense.light} fill="url(#expense)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Category Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer className="h-[300px]" config={chartConfig}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryBreakdown} margin={{ top: 10, right: 10, bottom: 20, left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={60} />
                                    <YAxis tickFormatter={(value) => formatCurrency(value, currentSpace?.currency)} className="text-xs" />
                                    <Tooltip
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
                                    <Legend />
                                    <Bar dataKey="income" name="Income" fill={CHART_COLORS.income.light} />
                                    <Bar dataKey="expense" name="Expense" fill={CHART_COLORS.expense.light} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Income Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer className="h-[300px]" config={chartConfig}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData.income}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label={(entry) => `${entry.name} (${((entry.value / totalIncome) * 100).toFixed(1)}%)`}
                                    >
                                        {pieChartData.income.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value, currentSpace?.currency)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Expense Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer className="h-[300px]" config={chartConfig}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData.expense}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label={(entry) => `${entry.name} (${((entry.value / totalExpense) * 100).toFixed(1)}%)`}
                                    >
                                        {pieChartData.expense.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value, currentSpace?.currency)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Category Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-4 text-sm font-medium text-muted-foreground">
                                <div>Category</div>
                                <div className="text-right">Income</div>
                                <div className="text-right">Expense</div>
                                <div className="text-right">Net</div>
                            </div>
                            <div className="space-y-2">
                                {categoryBreakdown.map((category) => (
                                    <div key={category.name} className="grid grid-cols-4 text-sm items-center">
                                        <div className="font-medium">{category.name}</div>
                                        <div className="text-right text-green-600">{formatCurrency(category.income, currentSpace?.currency)}</div>
                                        <div className="text-right text-red-600">{formatCurrency(category.expense, currentSpace?.currency)}</div>
                                        <div className={cn("text-right font-medium", category.total >= 0 ? "text-green-600" : "text-red-600")}>
                                            {formatCurrency(category.total, currentSpace?.currency)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-2 grid grid-cols-4 text-sm font-medium">
                                <div>Total</div>
                                <div className="text-right text-green-600">{formatCurrency(totalIncome, currentSpace?.currency)}</div>
                                <div className="text-right text-red-600">{formatCurrency(totalExpense, currentSpace?.currency)}</div>
                                <div className={cn("text-right", totalIncome - totalExpense >= 0 ? "text-green-600" : "text-red-600")}>
                                    {formatCurrency(totalIncome - totalExpense, currentSpace?.currency)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
