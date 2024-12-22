"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSpace } from "@/context/space";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CURRENCIES = {
    INR: "Indian Rupee",
    USD: "US Dollar",
    EUR: "Euro",
} as const;

export function SpaceOnboarding() {
    const router = useRouter();
    const { spaces, createNewSpace } = useSpace();
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [name, setName] = useState("");
    const [currency, setCurrency] = useState<keyof typeof CURRENCIES>("USD");

    useEffect(() => {
        // If user has spaces, redirect to dashboard
        if (spaces.length > 0) {
            router.push("/dashboard");
            return;
        }

        // If no spaces, show space creation dialog
        setShowDialog(true);
        setLoading(false);
    }, [spaces, router]);

    const handleCreateSpace = async () => {
        if (!name) return;

        try {
            await createNewSpace({ name, currency });
            setShowDialog(false);
            toast.success("Space created successfully");
            router.push("/dashboard");
        } catch (error) {
            console.error("Failed to create space:", error);
            toast.error("Failed to create space");
        }
    };

    if (loading) {
        return null;
    }

    return (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Your First Space</DialogTitle>
                    <DialogDescription>
                        A space is where you&apos;ll track your income and expenses. You can create multiple spaces for different purposes (e.g., Personal, Business).
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Space Name</Label>
                        <Input id="name" placeholder="e.g., Personal Finance" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={currency} onValueChange={(value) => setCurrency(value as keyof typeof CURRENCIES)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(CURRENCIES).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleCreateSpace} disabled={!name}>
                        Create Space
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
