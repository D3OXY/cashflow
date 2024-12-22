export interface Transaction {
    id: string;
    type: "Income" | "Expense";
    date: string;
    note: string;
    category: string;
    amount: number;
    spaceId: string;
    createdAt: string;
    updatedAt: string;
    metadata?: {
        labels?: string[];
        recurring?: RecurringConfig;
        tags?: string[];
    };
    status: "pending" | "cleared" | "reconciled";
}

export interface RecurringConfig {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    endDate?: string;
    lastProcessed: string;
}

export interface CreateTransactionData {
    type: "Income" | "Expense";
    date: string;
    note?: string;
    category: string;
    amount: number;
    spaceId: string;
    metadata?: {
        labels?: string[];
        recurring?: RecurringConfig;
        tags?: string[];
    };
    status?: "pending" | "cleared" | "reconciled";
}
