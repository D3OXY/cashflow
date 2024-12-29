"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { AppConfig, FirebaseConfig } from "@/lib/types/store";
import { appStore } from "@/lib/tauri-store";
import { useRouter } from "next/navigation";
import { SetupWizard } from "@/components/setup/setup-wizard";

interface AppConfigContextValue {
    isInitialized: boolean;
    isLoading: boolean;
    firebaseConfig: FirebaseConfig | null;
    setFirebaseConfig: (config: FirebaseConfig) => Promise<void>;
    resetConfig: () => Promise<void>;
}

const AppConfigContext = createContext<AppConfigContextValue | null>(null);

export function AppConfigProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [config, setConfig] = useState<AppConfig | null>(null);
    const router = useRouter();

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

    const resetConfig = async () => {
        await appStore.reset();
        setConfig(null);
        router.push("/");
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-background">
                    <div className="space-y-4 text-center">
                        <div className="text-4xl font-bold">Cashflow</div>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto" />
                    </div>
                </div>
            );
        }

        if (!config?.isInitialized || !config?.firebase) {
            return <SetupWizard />;
        }

        return children;
    };

    return (
        <AppConfigContext.Provider
            value={{
                isInitialized: Boolean(config?.isInitialized),
                isLoading,
                firebaseConfig: config?.firebase ?? null,
                setFirebaseConfig,
                resetConfig,
            }}
        >
            {renderContent()}
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
