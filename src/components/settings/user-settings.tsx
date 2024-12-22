"use client";

import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { PROFILE_IMAGES } from "@/lib/constants";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
    const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.photoURL || PROFILE_IMAGES[0].url);

    const handleProfileUpdate = async () => {
        if (!user) return;

        try {
            setIsUpdating(true);

            // Update display name in Firebase Auth
            if (displayName !== user.displayName) {
                await updateProfile(user, { displayName });
            }

            // Update photo URL in Firebase Auth if changed
            if (selectedAvatar !== user.photoURL) {
                await updateProfile(user, { photoURL: selectedAvatar });
            }

            // Check if user document exists
            const userDoc = doc(getDb(), "users", user.uid);
            const userSnap = await getDoc(userDoc);

            const userData = {
                displayName,
                email: user.email,
                photoURL: selectedAvatar,
                updatedAt: new Date().toISOString(),
            };

            if (userSnap.exists()) {
                // Update existing document
                await updateDoc(userDoc, userData);
            } else {
                // Create new document
                await setDoc(userDoc, {
                    ...userData,
                    createdAt: new Date().toISOString(),
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
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <Label>Profile Picture</Label>
                        <RadioGroup value={selectedAvatar} onValueChange={setSelectedAvatar} className="grid grid-cols-4 gap-4">
                            {PROFILE_IMAGES.map((avatar) => (
                                <div key={avatar.id}>
                                    <RadioGroupItem value={avatar.url} id={avatar.id} className="peer sr-only" />
                                    <Label
                                        htmlFor={avatar.id}
                                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                    >
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={avatar.url} />
                                            <AvatarFallback>??</AvatarFallback>
                                        </Avatar>
                                        <span className="mt-2 text-xs">{avatar.label}</span>
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
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
        </div>
    );
}
