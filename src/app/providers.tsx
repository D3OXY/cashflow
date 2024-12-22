"use client";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { AppConfigProvider } from "@/context/app-config";
import { AuthProvider } from "@/context/auth";
import { SpaceProvider } from "@/context/space";
import { InitializationWrapper } from "@/components/setup/initialization-wrapper";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AppConfigProvider>
                <AuthProvider>
                    <SpaceProvider>
                        <InitializationWrapper>{children}</InitializationWrapper>
                    </SpaceProvider>
                </AuthProvider>
            </AppConfigProvider>
            <Toaster />
        </ThemeProvider>
    );
}
