"use client";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { AppConfigProvider } from "@/context/app-config";
import { AuthProvider } from "@/context/auth";
import { InitializationWrapper } from "@/components/setup/initialization-wrapper";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AppConfigProvider>
                <AuthProvider>
                    <InitializationWrapper>{children}</InitializationWrapper>
                </AuthProvider>
            </AppConfigProvider>
            <Toaster />
        </ThemeProvider>
    );
}
