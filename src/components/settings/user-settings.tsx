"use client";

import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/config";
import { Loader2 } from "lucide-react";

const CURRENCIES = {
    USD: "US Dollar",
    EUR: "Euro",
    INR: "Indian Rupee",
} as const;

export function UserSettings() {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const [isUpdating, setIsUpdating] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(user?.photoURL || null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileUpdate = async () => {
        if (!user) return;

        try {
            setIsUpdating(true);

            // Update display name in Firebase Auth
            if (displayName !== user.displayName) {
                await updateProfile(user, { displayName });
            }

            // Update photo URL (in a real app, you'd upload to storage first)
            if (photoFile) {
                // TODO: Implement file upload to Firebase Storage
                // For now, we'll just update the profile without the photo
                // await updateProfile(user, { photoURL: uploadedPhotoUrl });
            }

            // Check if user document exists
            const userDoc = doc(getDb(), "users", user.uid);
            const userSnap = await getDoc(userDoc);

            if (userSnap.exists()) {
                // Update existing document
                await updateDoc(userDoc, {
                    displayName,
                    email: user.email,
                    updatedAt: new Date().toISOString(),
                });
            } else {
                // Create new document
                await setDoc(userDoc, {
                    displayName,
                    email: user.email,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
            }

            toast.success("Profile updated successfully");
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="grid gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Update your personal information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={photoPreview || undefined} />
                            <AvatarFallback className="text-lg">{user?.email?.slice(0, 2).toUpperCase() || "??"}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                            <Label htmlFor="photo">Profile Photo</Label>
                            <Input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Enter your name" />
                    </div>

                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={user?.email || ""} disabled />
                    </div>

                    <Button onClick={handleProfileUpdate} disabled={isUpdating}>
                        {isUpdating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            "Update Profile"
                        )}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize how Cashflow looks on your device.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="theme">Theme</Label>
                        <Select value={theme} onValueChange={setTheme}>
                            <SelectTrigger id="theme">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Regional</CardTitle>
                    <CardDescription>Manage your regional preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currency">Default Currency</Label>
                        <Select defaultValue="USD">
                            <SelectTrigger id="currency">
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
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Configure your notification preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="recurring-transactions">Recurring Transactions</Label>
                        <Switch
                            id="recurring-transactions"
                            onCheckedChange={(checked) => {
                                toast.success(`Recurring transactions notifications ${checked ? "enabled" : "disabled"}`);
                            }}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="budget-alerts">Budget Alerts</Label>
                        <Switch
                            id="budget-alerts"
                            onCheckedChange={(checked) => {
                                toast.success(`Budget alerts ${checked ? "enabled" : "disabled"}`);
                            }}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
