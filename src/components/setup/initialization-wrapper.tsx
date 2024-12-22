"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAppConfig } from "@/context/app-config";
import { useAuth } from "@/context/auth";
import { SetupWizard } from "@/components/setup/setup-wizard";
import { useEffect } from "react";

const PUBLIC_PATHS = ["/login", "/signup"];

export function InitializationWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isInitialized, isLoading: isConfigLoading } = useAppConfig();
    const { user, isLoading: isAuthLoading } = useAuth();

    const isPublicPath = PUBLIC_PATHS.includes(pathname);
    const isLoading = isConfigLoading || isAuthLoading;

    useEffect(() => {
        if (isLoading) return;

        if (!isInitialized) return;

        if (!user && !isPublicPath) {
            router.push("/login");
            return;
        }

        if (user && isPublicPath) {
            router.push("/");
            return;
        }
    }, [isLoading, isInitialized, user, isPublicPath, router]);

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
