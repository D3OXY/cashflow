"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SpaceSwitcher } from "@/components/space/space-switcher";
import { Menu, Settings, LayoutDashboard, LogOut, Moon, Sun, BarChart } from "lucide-react";
import { useAuth } from "@/context/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { appStore } from "@/lib/tauri-store";
import { useTheme } from "next-themes";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const { theme, setTheme } = useTheme();

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

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <div className="h-screen w-full flex">
            <aside className={cn("flex flex-col h-screen border-r bg-sidebar-background transition-all duration-300 ease-in-out", sidebarOpen ? "w-64" : "w-14")}>
                <div className="h-14 border-b flex items-center justify-between px-2">
                    <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-sidebar-foreground">
                        <Menu className="h-5 w-5" />
                    </Button>
                    {sidebarOpen && (
                        <>
                            <div className="flex-1 px-2">
                                <SpaceSwitcher />
                            </div>
                            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-sidebar-foreground">
                                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </Button>
                        </>
                    )}
                </div>
                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
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
                                    <Link href="/dashboard/analytics" className="block">
                                        <Button
                                            variant="ghost"
                                            className={cn("w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", {
                                                "bg-sidebar-accent": pathname === "/dashboard/analytics",
                                            })}
                                        >
                                            <BarChart className="mr-2 h-4 w-4" />
                                            Analytics
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
                </div>
                <div className="border-t">
                    {sidebarOpen ? (
                        <div className="px-3 py-2">
                            <div className="flex items-center mb-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || undefined} />
                                    <AvatarFallback>{user?.displayName?.[0] || user?.email?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="ml-2 overflow-hidden">
                                    <p className="text-sm font-medium truncate text-sidebar-foreground">{user?.displayName || "User"}</p>
                                    <p className="text-xs truncate text-sidebar-foreground/60">{user?.email}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                onClick={signOut}
                                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="ml-2">Sign out</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-1 py-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || undefined} />
                                <AvatarFallback>{user?.displayName?.[0] || user?.email?.[0]}</AvatarFallback>
                            </Avatar>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={signOut}
                                className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
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
                        <div className="h-14 border-b flex items-center justify-between px-2">
                            <Button variant="ghost" size="icon" className="text-sidebar-foreground">
                                <Menu className="h-5 w-5" />
                            </Button>
                            <div className="flex-1 px-2">
                                <SpaceSwitcher />
                            </div>
                            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-sidebar-foreground">
                                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </Button>
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
                                                Overview
                                            </Button>
                                        </Link>
                                        <Link href="/dashboard/analytics" className="block">
                                            <Button
                                                variant="ghost"
                                                className={cn("w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", {
                                                    "bg-sidebar-accent": pathname === "/dashboard/analytics",
                                                })}
                                            >
                                                <BarChart className="mr-2 h-4 w-4" />
                                                Analytics
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
                        <div className="border-t">
                            <div className="px-3 py-2">
                                <div className="flex items-center mb-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || undefined} />
                                        <AvatarFallback>{user?.displayName?.[0] || user?.email?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-2 overflow-hidden">
                                        <p className="text-sm font-medium truncate text-sidebar-foreground">{user?.displayName || "User"}</p>
                                        <p className="text-xs truncate text-sidebar-foreground/60">{user?.email}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={signOut}
                                    className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="ml-2">Sign out</span>
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
