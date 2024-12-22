import type { LucideIcon } from "lucide-react";

export interface Category {
    id: string;
    name: string;
    type: "Income" | "Expense";
    color: string;
    icon: LucideIcon;
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
    settings?: SpaceSettings;
}

export interface SpaceSettings {
    defaultView: "daily" | "weekly" | "monthly" | "yearly";
    startOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday to Saturday
    defaultTransactionType: "Income" | "Expense";
    showRunningBalance: boolean;
    categorySortOrder: "alphabetical" | "custom" | "usage";
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
