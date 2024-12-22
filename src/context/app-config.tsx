"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { AppConfig, FirebaseConfig } from "@/lib/types/store";
import { appStore } from "@/lib/tauri-store";

interface AppConfigContextValue {
    isInitialized: boolean;
    isLoading: boolean;
    firebaseConfig: FirebaseConfig | null;
    setFirebaseConfig: (config: FirebaseConfig) => Promise<void>;
}

const AppConfigContext = createContext<AppConfigContextValue | null>(null);

export function AppConfigProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [config, setConfig] = useState<AppConfig | null>(null);

    useEffect(() => {
        const loadConfig = async () => {
            const storedConfig = await appStore.getAppConfig();
            setConfig(storedConfig);
            setIsLoading(false);
        };

        loadConfig();
    }, []);

    const setFirebaseConfig = async (firebaseConfig: FirebaseConfig) => {
        const newConfig: AppConfig = {
            isInitialized: true,
            firebase: firebaseConfig,
            lastLoginAt: new Date().toISOString(),
        };

        await appStore.setAppConfig(newConfig);
        setConfig(newConfig);
    };

    return (
        <AppConfigContext.Provider
            value={{
                isInitialized: Boolean(config?.isInitialized),
                isLoading,
                firebaseConfig: config?.firebase ?? null,
                setFirebaseConfig,
            }}
        >
            {children}
        </AppConfigContext.Provider>
    );
}

export function useAppConfig() {
    const context = useContext(AppConfigContext);
    if (!context) {
        throw new Error("useAppConfig must be used within AppConfigProvider");
    }
    return context;
}
