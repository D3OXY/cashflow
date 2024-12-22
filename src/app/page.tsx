"use client";

import { useAuth } from "@/context/auth";
import { SpaceOnboarding } from "@/components/space/space-onboarding";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="container flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Welcome to Cashflow</CardTitle>
                        <CardDescription>A privacy-focused expense tracking desktop application.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">Please sign in to continue.</p>
                        <Button asChild>
                            <Link href="/login">
                                <LogIn className="mr-2 h-4 w-4" />
                                Sign In
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <SpaceOnboarding />;
}
