"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth";
import { useSpace } from "@/context/space";
import { Home, PieChart, Settings, LogOut, Menu, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SpaceSwitcher } from "@/components/space/space-switcher";
import { toast } from "sonner";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUser } from "@/context/user";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const { signOut } = useAuth();
    const { userData } = useUser();
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

    const userInitials = userData?.email?.slice(0, 2).toUpperCase() || "??";

    return (
        <SidebarProvider defaultOpen>
            <div className="flex min-h-screen w-full">
                <Sidebar className="border-r border-sidebar-border shrink-0 flex flex-col w-64 bg-sidebar-background text-sidebar-foreground">
                    <SidebarHeader className="border-b border-sidebar-border h-14">
                        <SpaceSwitcher />
                    </SidebarHeader>

                    <div className="flex-1">
                        <div className="py-6">
                            <SidebarContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <Link href="/dashboard" passHref legacyBehavior>
                                            <SidebarMenuButton className="w-full flex items-center px-4 py-2 hover:bg-sidebar-accent text-sidebar-foreground">
                                                <Home className="mr-3 h-4 w-4" />
                                                Dashboard
                                            </SidebarMenuButton>
                                        </Link>
                                    </SidebarMenuItem>

                                    <SidebarMenuItem>
                                        <Link href="/dashboard/analytics" passHref legacyBehavior>
                                            <SidebarMenuButton className="w-full flex items-center px-4 py-2 hover:bg-sidebar-accent text-sidebar-foreground">
                                                <PieChart className="mr-3 h-4 w-4" />
                                                Analytics
                                            </SidebarMenuButton>
                                        </Link>
                                    </SidebarMenuItem>

                                    <SidebarMenuItem>
                                        <Link href="/dashboard/settings" passHref legacyBehavior>
                                            <SidebarMenuButton className="w-full flex items-center px-4 py-2 hover:bg-sidebar-accent text-sidebar-foreground">
                                                <Settings className="mr-3 h-4 w-4" />
                                                Settings
                                            </SidebarMenuButton>
                                        </Link>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarContent>
                        </div>
                    </div>

                    <div className="mt-auto border-t border-sidebar-border/10 flex-none">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" className="w-full justify-between h-auto py-3 px-4 hover:bg-sidebar-accent text-sidebar-foreground">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 border border-sidebar-border/20">
                                            <AvatarImage src={userData?.photoURL || undefined} />
                                            <AvatarFallback className="bg-sidebar-accent text-sm">{userInitials}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-medium truncate max-w-[120px]">{userData?.displayName}</span>
                                            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{userData?.email}</span>
                                        </div>
                                    </div>
                                    <ChevronsUpDown className="h-4 w-4 text-sidebar-foreground/50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-2" align="end" side="right" sideOffset={8}>
                                <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign out
                                </Button>
                            </PopoverContent>
                        </Popover>
                    </div>
                </Sidebar>

                <div className="flex-1 w-0 min-w-0">
                    <header className="sticky top-0 z-10 bg-background border-b border-border h-14">
                        <div className="flex h-full items-center gap-4 px-6">
                            <SidebarTrigger>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SidebarTrigger>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-semibold">Cashflow</h1>
                                {currentSpace && (
                                    <>
                                        <span className="text-muted-foreground">/</span>
                                        <span className="text-muted-foreground">{currentSpace.name}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </header>
                    <main className="container mx-auto p-6">{children}</main>
                </div>
            </div>
        </SidebarProvider>
    );
}
