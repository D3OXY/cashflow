"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAppConfig } from "@/context/app-config";
import { useAuth } from "@/context/auth";
import { useSpace } from "@/context/space";
import { SetupWizard } from "@/components/setup/setup-wizard";
import { useEffect, useState } from "react";

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
    const [isRouteReady, setIsRouteReady] = useState(false);

    const isPublicPath = PUBLIC_PATHS.includes(pathname);
    const isLoading = isConfigLoading || isAuthLoading || isSpaceLoading || !isRouteReady;

    useEffect(() => {
        if (isConfigLoading || isAuthLoading || isSpaceLoading || !isInitialized) {
            setIsRouteReady(false);
            return;
        }

        const shouldRedirect =
            (!user && !isPublicPath) || // Not logged in and trying to access private page
            (user && isPublicPath); // Logged in and trying to access public page

        if (shouldRedirect) {
            const redirectPath = user ? "/" : "/login";
            if (pathname !== redirectPath) {
                router.replace(redirectPath);
                return;
            }
        }

        // Only mark route as ready when we're sure we're on the correct page
        setIsRouteReady(true);
    }, [isConfigLoading, isAuthLoading, isSpaceLoading, isInitialized, user, isPublicPath, pathname, router]);

    // Show loading screen until everything is ready
    if (isLoading) {
        return <LoadingScreen />;
    }

    // Show setup wizard if not initialized
    if (!isInitialized) {
        return <SetupWizard />;
    }

    // Only render children when we're sure we're on the right page
    return <>{children}</>;
}
