export interface Category {
    id: string;
    name: string;
    type: "Income" | "Expense" | "Both";
    color?: string;
    icon?: string;
}

export interface Space {
    id: string;
    name: string;
    icon: string;
    currency: "INR" | "USD" | "EUR";
    categories: Category[];
    createdAt: string;
    updatedAt: string;
    userId: string;
    settings: {
        defaultView: "daily" | "weekly" | "monthly" | "yearly";
        startOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
        defaultTransactionType: "Income" | "Expense";
        showRunningBalance: boolean;
    };
}

export interface CreateSpaceData {
    name: string;
    icon: string;
    currency: "INR" | "USD" | "EUR";
    categories?: Category[];
}

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
    metadata: TransactionMetadata;
    status: "pending" | "cleared" | "reconciled";
}

export interface TransactionMetadata {
    labels?: string[];
    attachments?: Attachment[];
    recurring?: RecurringConfig;
    location?: GeoLocation;
    tags?: string[];
}

export interface Attachment {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
}

export interface RecurringConfig {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    endDate?: string;
    lastProcessed: string;
}

export interface GeoLocation {
    latitude: number;
    longitude: number;
    name?: string;
}
