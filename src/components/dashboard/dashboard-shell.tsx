"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth";
import { useSpace } from "@/context/space";
import { Home, PieChart, Settings, LogOut } from "lucide-react";
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
                <Sidebar>
                    <SidebarHeader className="border-b border-border">
                        <div className="flex items-center justify-between px-4 py-2">
                            <div className="flex items-center gap-2">
                                <Avatar>
                                    <AvatarFallback>{userInitials}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{user?.email}</span>
                                    <span className="text-xs text-muted-foreground">{currentSpace?.name || "No Space Selected"}</span>
                                </div>
                            </div>
                            <SidebarTrigger />
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Button variant="ghost" className="w-full justify-start" asChild>
                                        <Link href="/dashboard">
                                            <Home className="mr-2 h-4 w-4" />
                                            Dashboard
                                        </Link>
                                    </Button>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Button variant="ghost" className="w-full justify-start" asChild>
                                        <Link href="/dashboard/analytics">
                                            <PieChart className="mr-2 h-4 w-4" />
                                            Analytics
                                        </Link>
                                    </Button>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Button variant="ghost" className="w-full justify-start" asChild>
                                        <Link href="/dashboard/settings">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Settings
                                        </Link>
                                    </Button>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>

                    <SidebarFooter>
                        <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </SidebarFooter>
                </Sidebar>

                <div className="flex-1">
                    <header className="border-b border-border">
                        <div className="flex h-16 items-center gap-4 px-6">
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
