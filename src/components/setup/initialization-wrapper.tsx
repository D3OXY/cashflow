"use client";

import { useAppConfig } from "@/context/app-config";
import { SetupWizard } from "@/components/setup/setup-wizard";

export function InitializationWrapper({ children }: { children: React.ReactNode }) {
    const { isInitialized, isLoading } = useAppConfig();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (!isInitialized) {
        return <SetupWizard />;
    }

    return <>{children}</>;
}
