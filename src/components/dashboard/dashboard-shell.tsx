"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SpaceSwitcher } from "@/components/space/space-switcher";
import { Separator } from "@/components/ui/separator";
import { Menu, Settings, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { appStore } from "@/lib/tauri-store";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const [open, setOpen] = React.useState(false);
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    // Load initial sidebar state
    React.useEffect(() => {
        const loadSidebarState = async () => {
            const uiState = await appStore.get("ui-state");
            if (uiState) {
                setSidebarOpen(uiState.sidebarOpen);
            }
        };
        loadSidebarState();
    }, []);

    // Save sidebar state when it changes
    const toggleSidebar = async () => {
        const newState = !sidebarOpen;
        setSidebarOpen(newState);
        await appStore.set("ui-state", { sidebarOpen: newState });
    };

    return (
        <div className="h-screen w-full flex">
            <aside className={cn("relative h-screen border-r bg-sidebar-background transition-all duration-300 ease-in-out", sidebarOpen ? "w-64" : "w-14")}>
                <div className="h-14 border-b flex items-center px-4">
                    <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-sidebar-foreground">
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
                <div className={cn("h-14 border-b transition-all", !sidebarOpen && "hidden")}>
                    <SpaceSwitcher />
                </div>
                <ScrollArea className="h-[calc(100vh-8rem)]">
                    <div className="space-y-4 py-4">
                        <div className="px-3 py-2">
                            <div className="space-y-1">
                                <Link href="/dashboard" className="block">
                                    <Button
                                        variant="ghost"
                                        className={cn("w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", {
                                            "bg-sidebar-accent": pathname === "/dashboard",
                                        })}
                                    >
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        {sidebarOpen && <span>Overview</span>}
                                    </Button>
                                </Link>
                                <Link href="/dashboard/settings" className="block">
                                    <Button
                                        variant="ghost"
                                        className={cn("w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", {
                                            "bg-sidebar-accent": pathname === "/dashboard/settings",
                                        })}
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        {sidebarOpen && <span>Settings</span>}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <div className="h-14 border-t flex items-center px-3">
                    <DropdownMenu open={open} onOpenChange={setOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-10 w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || undefined} />
                                    <AvatarFallback>{user?.displayName?.[0] || user?.email?.[0]}</AvatarFallback>
                                </Avatar>
                                {sidebarOpen && <span className="ml-2 truncate">{user?.displayName || user?.email}</span>}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 bg-sidebar-background p-0">
                        <SpaceSwitcher />
                        <Separator className="bg-sidebar-border/10" />
                        <ScrollArea className="h-[calc(100vh-8rem)]">
                            <div className="space-y-4 py-4">
                                <div className="px-3 py-2">
                                    <div className="space-y-1">
                                        <Link href="/dashboard" className="block">
                                            <Button
                                                variant="ghost"
                                                className={cn("w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", {
                                                    "bg-sidebar-accent": pathname === "/dashboard",
                                                })}
                                            >
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                Overview
                                            </Button>
                                        </Link>
                                        <Link href="/dashboard/settings" className="block">
                                            <Button
                                                variant="ghost"
                                                className={cn("w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", {
                                                    "bg-sidebar-accent": pathname === "/dashboard/settings",
                                                })}
                                            >
                                                <Settings className="mr-2 h-4 w-4" />
                                                Settings
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                        <div className="h-14 border-t flex items-center px-3">
                            <Button variant="ghost" className="h-10 w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || undefined} />
                                    <AvatarFallback>{user?.displayName?.[0] || user?.email?.[0]}</AvatarFallback>
                                </Avatar>
                                <span className="ml-2 truncate">{user?.displayName || user?.email}</span>
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
