"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAppConfig } from "@/context/app-config";
import { useAuth } from "@/context/auth";
import { useSpace } from "@/context/space";
import { SetupWizard } from "@/components/setup/setup-wizard";
import { useEffect } from "react";

const PUBLIC_PATHS = ["/login", "/signup"];

function LoadingScreen() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="space-y-4 text-center">
                <div className="text-4xl font-bold">Cashflow</div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto" />
            </div>
        </div>
    );
}

export function InitializationWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isInitialized, isLoading: isConfigLoading } = useAppConfig();
    const { user, isLoading: isAuthLoading } = useAuth();
    const { loading: isSpaceLoading } = useSpace();

    const isPublicPath = PUBLIC_PATHS.includes(pathname);
    const isLoading = isConfigLoading || isAuthLoading || isSpaceLoading;

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

        // If user is logged in and has no spaces, they should stay on the current page
        // to see the space creation dialog
    }, [isLoading, isInitialized, user, isPublicPath, router]);

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (!isInitialized) {
        return <SetupWizard />;
    }

    return <>{children}</>;
}
