"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import type { Space } from "@/lib/types/space";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { doc, updateDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/config";
import { Loader2 } from "lucide-react";
import { useSpace } from "@/context/space";

interface SpaceSettingsProps {
    space: Space;
}

const CURRENCIES = {
    USD: "US Dollar",
    EUR: "Euro",
    INR: "Indian Rupee",
} as const;

const DAYS_OF_WEEK = [
    { value: "0", label: "Sunday" },
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
] as const;

const DEFAULT_VIEWS = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
] as const;

const CATEGORY_SORT_OPTIONS = [
    { value: "alphabetical", label: "Alphabetical" },
    { value: "custom", label: "Custom Order" },
    { value: "usage", label: "By Usage" },
] as const;

export function SpaceSettings({ space }: SpaceSettingsProps) {
    const { refreshSpaces } = useSpace();
    const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
    const [spaceName, setSpaceName] = useState(space.name);
    const [spaceIcon, setSpaceIcon] = useState(space.icon);
    const [settings, setSettings] = useState({
        defaultView: space.settings?.defaultView || "monthly",
        startOfWeek: String(space.settings?.startOfWeek || "1"),
        defaultTransactionType: space.settings?.defaultTransactionType || "Expense",
        showRunningBalance: space.settings?.showRunningBalance ?? true,
        categorySortOrder: space.settings?.categorySortOrder || "alphabetical",
        currency: space.currency,
    });

    useEffect(() => {
        setSpaceName(space.name);
        setSpaceIcon(space.icon);
        setSettings({
            defaultView: space.settings?.defaultView || "monthly",
            startOfWeek: String(space.settings?.startOfWeek || "1"),
            defaultTransactionType: space.settings?.defaultTransactionType || "Expense",
            showRunningBalance: space.settings?.showRunningBalance ?? true,
            categorySortOrder: space.settings?.categorySortOrder || "alphabetical",
            currency: space.currency,
        });
    }, [space]);

    type SpaceSettingsType = typeof settings;

    const updateSpace = async (key: keyof Space | keyof SpaceSettingsType, value: string | number | boolean, section: string) => {
        try {
            setIsUpdating((prev) => ({ ...prev, [section]: true }));
            const db = getDb();
            const spaceRef = doc(db, "spaces", space.id);

            let updateData: Partial<Space> = {
                updatedAt: new Date().toISOString(),
            };

            if (key === "name" || key === "icon" || key === "currency") {
                updateData = {
                    ...updateData,
                    [key]: value,
                };
            } else {
                const currentSettings = space.settings || {
                    defaultView: "monthly",
                    startOfWeek: 1,
                    defaultTransactionType: "Expense",
                    showRunningBalance: true,
                    categorySortOrder: "alphabetical",
                };

                updateData = {
                    ...updateData,
                    settings: {
                        ...currentSettings,
                        [key]: value,
                    },
                };
            }

            await updateDoc(spaceRef, updateData);
            await refreshSpaces();
            toast.success("Space updated successfully");
        } catch (error) {
            console.error("Failed to update space:", error);
            toast.error("Failed to update space");
        } finally {
            setIsUpdating((prev) => ({ ...prev, [section]: false }));
        }
    };

    const handleSettingChange = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K], section: string) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
        updateSpace(key, value, section);
    };

    return (
        <div className="grid gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Space Details</CardTitle>
                    <CardDescription>Basic information about your space.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Space Name</Label>
                        <div className="flex gap-2">
                            <Input id="name" value={spaceName} onChange={(e) => setSpaceName(e.target.value)} placeholder="Enter space name" />
                            <Button onClick={() => updateSpace("name", spaceName, "details")} disabled={isUpdating.details || spaceName === space.name}>
                                {isUpdating.details ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="icon">Space Icon</Label>
                        <div className="flex gap-2">
                            <Input id="icon" value={spaceIcon} onChange={(e) => setSpaceIcon(e.target.value)} placeholder="Enter space icon" />
                            <Button onClick={() => updateSpace("icon", spaceIcon, "details")} disabled={isUpdating.details || spaceIcon === space.icon}>
                                {isUpdating.details ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <div className="flex gap-2">
                            <Select value={settings.currency} onValueChange={(value) => handleSettingChange("currency", value as typeof settings.currency, "currency")}>
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
                            {isUpdating.currency && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>View Settings</CardTitle>
                    <CardDescription>Configure how your transactions are displayed.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Default View</Label>
                        <div className="space-y-2">
                            <RadioGroup
                                value={settings.defaultView}
                                onValueChange={(value) => handleSettingChange("defaultView", value as typeof settings.defaultView, "view")}
                                className="grid grid-cols-2 gap-4"
                            >
                                {DEFAULT_VIEWS.map((view) => (
                                    <div key={view.value}>
                                        <RadioGroupItem value={view.value} id={view.value} className="peer sr-only" />
                                        <Label
                                            htmlFor={view.value}
                                            className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                        >
                                            {view.label}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                            {isUpdating.view && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="startOfWeek">Start of Week</Label>
                        <div className="flex gap-2">
                            <Select value={settings.startOfWeek} onValueChange={(value) => handleSettingChange("startOfWeek", value, "week")}>
                                <SelectTrigger id="startOfWeek">
                                    <SelectValue placeholder="Select start day" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DAYS_OF_WEEK.map((day) => (
                                        <SelectItem key={day.value} value={day.value}>
                                            {day.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {isUpdating.week && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="categorySortOrder">Category Sort Order</Label>
                        <div className="flex gap-2">
                            <Select
                                value={settings.categorySortOrder}
                                onValueChange={(value) => handleSettingChange("categorySortOrder", value as typeof settings.categorySortOrder, "sort")}
                            >
                                <SelectTrigger id="categorySortOrder">
                                    <SelectValue placeholder="Select sort order" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORY_SORT_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {isUpdating.sort && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Transaction Settings</CardTitle>
                    <CardDescription>Configure default transaction behavior.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Default Transaction Type</Label>
                        <div className="space-y-2">
                            <RadioGroup
                                value={settings.defaultTransactionType}
                                onValueChange={(value) => handleSettingChange("defaultTransactionType", value as typeof settings.defaultTransactionType, "transaction")}
                                className="grid grid-cols-2 gap-4"
                            >
                                <div>
                                    <RadioGroupItem value="Income" id="income" className="peer sr-only" />
                                    <Label
                                        htmlFor="income"
                                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                    >
                                        Income
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="Expense" id="expense" className="peer sr-only" />
                                    <Label
                                        htmlFor="expense"
                                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                    >
                                        Expense
                                    </Label>
                                </div>
                            </RadioGroup>
                            {isUpdating.transaction && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="showRunningBalance">Show Running Balance</Label>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="showRunningBalance"
                                checked={settings.showRunningBalance}
                                onCheckedChange={(checked) => handleSettingChange("showRunningBalance", checked, "balance")}
                            />
                            {isUpdating.balance && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
