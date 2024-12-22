"use client";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { AppConfigProvider } from "@/context/app-config";
import { AuthProvider } from "@/context/auth";
import { SpaceProvider } from "@/context/space";
import { InitializationWrapper } from "@/components/setup/initialization-wrapper";
import { UserProvider } from "@/context/user";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TransactionProvider } from "@/context/transaction";

export default function Providers({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <AppConfigProvider>
                    <AuthProvider>
                        <UserProvider>
                            <SpaceProvider>
                                <InitializationWrapper>
                                    <TransactionProvider>
                                        {children}
                                        <Toaster />
                                    </TransactionProvider>
                                </InitializationWrapper>
                            </SpaceProvider>
                        </UserProvider>
                    </AuthProvider>
                </AppConfigProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
