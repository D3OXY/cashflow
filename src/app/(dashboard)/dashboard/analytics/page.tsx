"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DateRangePickerInput } from "@/components/ui/date-range-picker-input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSpace } from "@/context/space";
import { useTransaction } from "@/context/transaction";
import { Transaction } from "@/lib/types/transaction";
import { cn, formatCurrency } from "@/lib/utils";
import { addDays, endOfDay, endOfMonth, endOfWeek, endOfYear, format, startOfDay, startOfMonth, startOfWeek, startOfYear, subMonths } from "date-fns";
import { ArrowDown, ArrowUp, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, RadialBar, RadialBarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const CHART_COLORS = {
    income: "hsl(var(--chart-1))",
    expense: "hsl(var(--chart-2))",
    savings: "hsl(var(--chart-3))",
    investment: "hsl(var(--chart-4))",
    other: "hsl(var(--chart-5))",
};

const chartConfig = {
    income: {
        label: "Income",
        color: CHART_COLORS.income,
    },
    expense: {
        label: "Expense",
        color: CHART_COLORS.expense,
    },
} satisfies ChartConfig;

function getDateAggregation(from: Date, to: Date): "daily" | "weekly" | "monthly" {
    const diffInDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays <= 31) return "daily";
    if (diffInDays <= 90) return "weekly";
    return "monthly";
}

// Add this helper function to calculate tick count
function getTickCount(from: Date, to: Date): number {
    const diffInDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays <= 7) return diffInDays; // Show all points for a week or less
    if (diffInDays <= 31) return 7; // Show ~7 points for a month
    if (diffInDays <= 90) return 12; // Show ~12 points for 3 months
    return 15; // Show max 15 points for longer periods
}

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

    const timeSeriesData = React.useMemo(() => {
        const aggregationType = getDateAggregation(date.from, date.to);
        const data: Record<string, { date: string; income: number; expense: number }> = {};

        // Initialize periods
        if (aggregationType === "daily") {
            const days = Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24));
            for (let i = 0; i <= days; i++) {
                const currentDate = addDays(date.from, i);
                const dateStr = format(currentDate, "yyyy-MM-dd");
                data[dateStr] = { date: dateStr, income: 0, expense: 0 };
            }
        } else if (aggregationType === "weekly") {
            let currentDate = startOfWeek(date.from);
            while (currentDate <= date.to) {
                const dateStr = format(currentDate, "yyyy-'W'ww");
                data[dateStr] = { date: dateStr, income: 0, expense: 0 };
                currentDate = addDays(currentDate, 7);
            }
        } else {
            let currentDate = startOfMonth(date.from);
            while (currentDate <= date.to) {
                const dateStr = format(currentDate, "yyyy-MM");
                data[dateStr] = { date: dateStr, income: 0, expense: 0 };
                currentDate = addDays(currentDate, 31);
            }
        }

        // Fill in transaction data
        filteredTransactions.forEach((transaction: Transaction) => {
            const transactionDate = new Date(transaction.date);
            let dateStr: string;

            if (aggregationType === "daily") {
                dateStr = format(transactionDate, "yyyy-MM-dd");
            } else if (aggregationType === "weekly") {
                dateStr = format(startOfWeek(transactionDate), "yyyy-'W'ww");
            } else {
                dateStr = format(transactionDate, "yyyy-MM");
            }

            if (data[dateStr]) {
                if (transaction.type === "Income") {
                    data[dateStr].income += transaction.amount;
                } else {
                    data[dateStr].expense += transaction.amount;
                }
            }
        });

        return Object.values(data);
    }, [filteredTransactions, date]);

    const getPercentageChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    // New data processing functions
    const monthlyComparison = React.useMemo(() => {
        const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
            const date = subMonths(new Date(), i);
            return {
                month: format(date, "MMM yyyy"),
                income: 0,
                expense: 0,
                transactions: 0,
            };
        }).reverse();

        transactions.forEach((t: Transaction) => {
            const transactionMonth = format(new Date(t.date), "MMM yyyy");
            const monthData = lastSixMonths.find((m) => m.month === transactionMonth);
            if (monthData) {
                if (t.type === "Income") monthData.income += t.amount;
                else monthData.expense += t.amount;
                monthData.transactions++;
            }
        });

        return lastSixMonths;
    }, [transactions]);

    const topCategories = React.useMemo(() => {
        return categoryBreakdown
            .sort((a, b) => b.expense - a.expense)
            .slice(0, 5)
            .map((cat) => ({
                ...cat,
                percentage: (cat.expense / totalExpense) * 100,
            }));
    }, [categoryBreakdown, totalExpense]);

    const transactionStats = React.useMemo(() => {
        const avgTransactionAmount = filteredTransactions.reduce((acc, t) => acc + t.amount, 0) / filteredTransactions.length;
        const maxTransaction = Math.max(...filteredTransactions.map((t) => t.amount));
        const transactionsPerDay = filteredTransactions.length / ((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24));

        return {
            avgAmount: avgTransactionAmount || 0,
            maxAmount: maxTransaction || 0,
            perDay: transactionsPerDay || 0,
            total: filteredTransactions.length,
        };
    }, [filteredTransactions, date]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
                    <p className="text-muted-foreground">Financial overview and insights</p>
                </div>
                <DateRangePickerInput className="w-full sm:w-fit" value={date} onChange={setDate} align="end" />
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalIncome, currentSpace?.currency)}</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            <span>{Math.abs(getPercentageChange(totalIncome, previousPeriodData.income)).toFixed(1)}% from previous</span>
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

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                    <CardDescription>
                        {getDateAggregation(date.from, date.to) === "daily"
                            ? "Daily transactions"
                            : getDateAggregation(date.from, date.to) === "weekly"
                            ? "Weekly aggregated transactions"
                            : "Monthly aggregated transactions"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                    <ChartContainer config={chartConfig} className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 30, bottom: 30, left: 50 }}>
                                <defs>
                                    <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={CHART_COLORS.income} stopOpacity={0.1} />
                                        <stop offset="95%" stopColor={CHART_COLORS.income} stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={CHART_COLORS.expense} stopOpacity={0.1} />
                                        <stop offset="95%" stopColor={CHART_COLORS.expense} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(dateStr) => {
                                        const aggregationType = getDateAggregation(date.from, date.to);
                                        if (aggregationType === "daily") {
                                            return format(new Date(dateStr), "MMM d");
                                        } else if (aggregationType === "weekly") {
                                            return `Week ${dateStr.split("W")[1]}`;
                                        } else {
                                            return format(new Date(dateStr + "-01"), "MMM yyyy");
                                        }
                                    }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    interval={"preserveStartEnd"}
                                    tickCount={getTickCount(date.from, date.to)}
                                />
                                <YAxis tickFormatter={(value) => formatCurrency(value, currentSpace?.currency)} width={80} />
                                <ChartTooltip
                                    content={({ active, payload }) => {
                                        if (!active || !payload) return null;
                                        const aggregationType = getDateAggregation(date.from, date.to);
                                        const dateStr = payload[0]?.payload.date;
                                        let displayDate: string;

                                        if (aggregationType === "daily") {
                                            displayDate = format(new Date(dateStr), "PPP");
                                        } else if (aggregationType === "weekly") {
                                            displayDate = `Week ${dateStr.split("W")[1]}`;
                                        } else {
                                            displayDate = format(new Date(dateStr + "-01"), "MMMM yyyy");
                                        }

                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid gap-2">
                                                    <div className="text-[0.70rem] font-medium">{displayDate}</div>
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
                                <Area type="monotone" dataKey="income" stroke={CHART_COLORS.income} fill="url(#income)" />
                                <Area type="monotone" dataKey="expense" stroke={CHART_COLORS.expense} fill="url(#expense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Monthly Comparison</CardTitle>
                    <CardDescription>Last 6 months trend</CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                    <ChartContainer config={chartConfig} className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyComparison} margin={{ top: 10, right: 30, bottom: 30, left: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="month" angle={-45} textAnchor="end" height={60} interval={0} />
                                <YAxis tickFormatter={(value) => formatCurrency(value, currentSpace?.currency)} width={80} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="income" fill={CHART_COLORS.income} />
                                <Bar dataKey="expense" fill={CHART_COLORS.expense} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Top Spending Categories</CardTitle>
                        <CardDescription>Highest expense categories</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {topCategories.map((category) => (
                            <div key={category.name} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>{category.name}</span>
                                    <span className="font-medium">{formatCurrency(category.expense, currentSpace?.currency)}</span>
                                </div>
                                <Progress value={category.percentage} className="h-2" />
                                <p className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}% of total expenses</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Transaction Statistics</CardTitle>
                        <CardDescription>Transaction patterns and averages</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Average Amount</p>
                                <p className="text-2xl font-bold">{formatCurrency(transactionStats.avgAmount, currentSpace?.currency)}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Largest Transaction</p>
                                <p className="text-2xl font-bold">{formatCurrency(transactionStats.maxAmount, currentSpace?.currency)}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Transactions/Day</p>
                                <p className="text-2xl font-bold">{transactionStats.perDay.toFixed(1)}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Total Transactions</p>
                                <p className="text-2xl font-bold">{transactionStats.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Category Distribution</CardTitle>
                        <CardDescription>Spending by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
                            <ResponsiveContainer>
                                <RadialBarChart data={categoryBreakdown} startAngle={90} endAngle={-270} innerRadius="20%" outerRadius="100%">
                                    <RadialBar dataKey="expense" background fill={CHART_COLORS.expense}>
                                        <LabelList position="insideStart" dataKey="name" className="fill-foreground capitalize" fontSize={11} />
                                    </RadialBar>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Category Breakdown</CardTitle>
                    <CardDescription>Detailed view of income and expenses by category</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Income</TableHead>
                                <TableHead className="text-right">Expense</TableHead>
                                <TableHead className="text-right">Net</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categoryBreakdown.map((category) => (
                                <TableRow key={category.name}>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell className="text-right text-green-600">{formatCurrency(category.income, currentSpace?.currency)}</TableCell>
                                    <TableCell className="text-right text-red-600">{formatCurrency(category.expense, currentSpace?.currency)}</TableCell>
                                    <TableCell className={cn("text-right font-medium", category.total >= 0 ? "text-green-600" : "text-red-600")}>
                                        {formatCurrency(category.total, currentSpace?.currency)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow className="font-medium">
                                <TableCell>Total</TableCell>
                                <TableCell className="text-right text-green-600">{formatCurrency(totalIncome, currentSpace?.currency)}</TableCell>
                                <TableCell className="text-right text-red-600">{formatCurrency(totalExpense, currentSpace?.currency)}</TableCell>
                                <TableCell className={cn("text-right", totalIncome - totalExpense >= 0 ? "text-green-600" : "text-red-600")}>
                                    {formatCurrency(totalIncome - totalExpense, currentSpace?.currency)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
