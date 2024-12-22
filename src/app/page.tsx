"use client";

import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function HomePage() {
    const { user, signOut } = useAuth();

    const handleSignOut = async () => {
        try {
            await signOut();
            toast.success("Successfully logged out");
        } catch (error) {
            console.error("Failed to sign out:", error);
            toast.error("Failed to sign out");
        }
    };

    return (
        <div className="container max-w-2xl mx-auto py-10">
            <Card className="p-6">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold">Welcome to Cashflow</h1>
                        <p className="text-muted-foreground">You are signed in as {user?.email}</p>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold">Account Details</h2>
                        <div className="grid gap-2 text-sm">
                            <div>
                                <span className="font-medium">Email:</span> {user?.email}
                            </div>
                            <div>
                                <span className="font-medium">Email Verified:</span> {user?.emailVerified ? "Yes" : "No"}
                            </div>
                            <div>
                                <span className="font-medium">User ID:</span> {user?.uid}
                            </div>
                            <div>
                                <span className="font-medium">Created:</span> {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleString() : "N/A"}
                            </div>
                            <div>
                                <span className="font-medium">Last Sign In:</span> {user?.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : "N/A"}
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <Button variant="destructive" onClick={handleSignOut}>
                            Sign Out
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
