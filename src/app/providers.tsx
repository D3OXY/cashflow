"use client";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { AppConfigProvider } from "@/context/app-config";
import { InitializationWrapper } from "@/components/setup/initialization-wrapper";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AppConfigProvider>
                <InitializationWrapper>{children}</InitializationWrapper>
            </AppConfigProvider>
            <Toaster />
        </ThemeProvider>
    );
}
