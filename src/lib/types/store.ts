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

export type StoreKeys = "app-config" | "user-preferences";

export interface Store {
    "app-config": AppConfig;
    "user-preferences": Record<string, unknown>;
}
