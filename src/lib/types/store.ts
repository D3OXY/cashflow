export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
}

export interface AppConfig {
    isInitialized: boolean;
    firebase: FirebaseConfig | null;
    lastLoginAt?: string;
    theme?: "light" | "dark" | "system";
    currency?: "INR" | "USD" | "EUR";
}

export interface SpaceState {
    lastSpaceId?: string;
}

export interface UIState {
    sidebarOpen: boolean;
}

export type StoreKeys = "app-config" | "user-preferences" | "space-state" | "ui-state";

export interface Store {
    "app-config": AppConfig;
    "user-preferences": Record<string, unknown>;
    "space-state": SpaceState;
    "ui-state": UIState;
}
