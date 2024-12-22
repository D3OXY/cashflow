"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth";
import { useSpace } from "@/context/space";
import { Home, PieChart, Settings, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SpaceSwitcher } from "@/components/space/space-switcher";
import { toast } from "sonner";
import Link from "next/link";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const { user, signOut } = useAuth();
    const { currentSpace } = useSpace();

    const handleSignOut = async () => {
        try {
            await signOut();
            toast.success("Successfully logged out");
        } catch (error) {
            console.error("Failed to sign out:", error);
            toast.error("Failed to sign out");
        }
    };

    const userInitials = user?.email?.slice(0, 2).toUpperCase() || "??";

    return (
        <SidebarProvider defaultOpen>
            <div className="flex min-h-screen">
                <Sidebar className="border-r">
                    <SidebarHeader className="border-b border-border px-4 py-2">
                        <div className="flex items-center gap-2">
                            <Avatar>
                                <AvatarFallback>{userInitials}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{user?.email}</span>
                                <span className="text-xs text-muted-foreground">{currentSpace?.name || "No Space Selected"}</span>
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Link href="/dashboard" passHref legacyBehavior>
                                    <SidebarMenuButton className="w-full flex items-center px-4 py-2 hover:bg-accent">
                                        <Home className="mr-2 h-4 w-4" />
                                        Dashboard
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <Link href="/dashboard/analytics" passHref legacyBehavior>
                                    <SidebarMenuButton className="w-full flex items-center px-4 py-2 hover:bg-accent">
                                        <PieChart className="mr-2 h-4 w-4" />
                                        Analytics
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <Link href="/dashboard/settings" passHref legacyBehavior>
                                    <SidebarMenuButton className="w-full flex items-center px-4 py-2 hover:bg-accent">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>

                    <SidebarFooter className="border-t p-4">
                        <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </SidebarFooter>
                </Sidebar>

                <div className="flex-1">
                    <header className="border-b border-border">
                        <div className="flex h-16 items-center gap-4 px-6">
                            <SidebarTrigger>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SidebarTrigger>
                            <h1 className="text-xl font-semibold">Cashflow</h1>
                            <div className="ml-auto">
                                <SpaceSwitcher />
                            </div>
                        </div>
                    </header>
                    <main className="p-6">{children}</main>
                </div>
            </div>
        </SidebarProvider>
    );
}
