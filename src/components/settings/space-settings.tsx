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
import { Loader2, Trash2 } from "lucide-react";
import { useSpace } from "@/context/space";
import { SPACE_ICONS } from "@/lib/constants";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteSpace } from "@/lib/firebase/spaces";
import { useRouter } from "next/navigation";
import { getUserSpaces } from "@/lib/firebase/spaces";
import { Plus, Pencil, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CATEGORY_ICONS } from "@/lib/constants";
import { addCategory, deleteCategory, updateCategory } from "@/lib/firebase/spaces";
import type { Category } from "@/lib/types/space";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    icon: z.string().min(1, "Icon is required"),
    type: z.enum(["Income", "Expense", "Both"]).default("Expense"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

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
    const router = useRouter();
    const { refreshSpaces } = useSpace();
    const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
    const [showEditCategoryDialog, setShowEditCategoryDialog] = useState(false);
    const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
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

    const handleDeleteSpace = async () => {
        try {
            setIsDeleting(true);
            await deleteSpace(space.id);
            toast.success("Space deleted successfully");
            setShowDeleteDialog(false);

            // Get remaining spaces
            const remainingSpaces = await getUserSpaces();

            // If no spaces left, show create space dialog
            if (remainingSpaces.length === 0) {
                router.push("/dashboard");
            } else {
                // If there are spaces, redirect to the first available space
                router.push(`/dashboard?spaceId=${remainingSpaces[0].id}`);
            }
        } catch (error) {
            console.error("Failed to delete space:", error);
            toast.error("Failed to delete space");
        } finally {
            setIsDeleting(false);
        }
    };

    const newCategoryForm = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            icon: "",
            type: "Expense",
        },
    });

    const editCategoryForm = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: selectedCategory?.name ?? "",
            icon: selectedCategory?.icon ?? "",
            type: selectedCategory?.type ?? "Expense",
        },
    });

    useEffect(() => {
        if (selectedCategory) {
            editCategoryForm.reset({
                name: selectedCategory.name,
                icon: selectedCategory.icon,
                type: selectedCategory.type,
            });
        }
    }, [selectedCategory, editCategoryForm]);

    const handleAddCategory = async (values: CategoryFormData) => {
        try {
            setIsUpdating((prev) => ({ ...prev, newCategory: true }));
            await addCategory(space.id, values);
            await refreshSpaces();
            toast.success("Category added successfully");
            setShowNewCategoryDialog(false);
            newCategoryForm.reset();
        } catch (error) {
            console.error("Failed to add category:", error);
            toast.error("Failed to add category");
        } finally {
            setIsUpdating((prev) => ({ ...prev, newCategory: false }));
        }
    };

    const handleEditCategory = async (values: CategoryFormData) => {
        if (!selectedCategory) return;
        try {
            setIsUpdating((prev) => ({ ...prev, editCategory: true }));
            await updateCategory(space.id, selectedCategory.id, values);
            await refreshSpaces();
            toast.success("Category updated successfully");
            setShowEditCategoryDialog(false);
        } catch (error) {
            console.error("Failed to update category:", error);
            toast.error("Failed to update category");
        } finally {
            setIsUpdating((prev) => ({ ...prev, editCategory: false }));
        }
    };

    const handleDeleteCategory = async () => {
        if (!selectedCategory) return;
        try {
            setIsUpdating((prev) => ({ ...prev, deleteCategory: true }));
            await deleteCategory(space.id, selectedCategory.id);
            await refreshSpaces();
            toast.success("Category deleted successfully");
            setShowDeleteCategoryDialog(false);
        } catch (error) {
            console.error("Failed to delete category:", error);
            toast.error("Failed to delete category");
        } finally {
            setIsUpdating((prev) => ({ ...prev, deleteCategory: false }));
        }
    };

    return (
        <>
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
                                <Select
                                    value={spaceIcon}
                                    onValueChange={(value) => {
                                        setSpaceIcon(value);
                                        updateSpace("icon", value, "details");
                                    }}
                                >
                                    <SelectTrigger id="icon" className="w-full">
                                        <SelectValue>
                                            <span className="text-xl">{spaceIcon}</span>
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SPACE_ICONS.map((icon) => (
                                            <SelectItem key={icon.value} value={icon.value}>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">{icon.value}</span>
                                                    <span className="text-muted-foreground">{icon.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {isUpdating.details && <Loader2 className="h-4 w-4 animate-spin" />}
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

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Categories</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => setShowNewCategoryDialog(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Category
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {space.categories?.map((category) => (
                                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{category.icon}</span>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{category.name}</span>
                                            <span className="text-xs text-muted-foreground">{category.type}</span>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setSelectedCategory(category);
                                                    setShowEditCategoryDialog(true);
                                                }}
                                            >
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => {
                                                    setSelectedCategory(category);
                                                    setShowDeleteCategoryDialog(true);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Danger Zone</CardTitle>
                        <CardDescription>Irreversible and destructive actions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between space-x-4">
                            <div>
                                <h4 className="text-sm font-semibold">Delete Space</h4>
                                <p className="text-sm text-muted-foreground">Permanently delete this space and all of its data. This action cannot be undone.</p>
                            </div>
                            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Space
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Space</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this space? This action cannot be undone and will permanently delete all data associated with this space.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{space.icon}</span>
                            <span className="font-medium">{space.name}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteSpace} disabled={isDeleting}>
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Space
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Category</DialogTitle>
                        <DialogDescription>Create a new category for your transactions.</DialogDescription>
                    </DialogHeader>
                    <Form {...newCategoryForm}>
                        <form onSubmit={newCategoryForm.handleSubmit(handleAddCategory)} className="space-y-4">
                            <FormField
                                control={newCategoryForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="e.g. Groceries" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={newCategoryForm.control}
                                name="icon"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Icon</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an icon" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {CATEGORY_ICONS.map((icon) => (
                                                    <SelectItem key={icon.value} value={icon.value}>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl">{icon.value}</span>
                                                            <span>{icon.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={newCategoryForm.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Income">Income</SelectItem>
                                                <SelectItem value="Expense">Expense</SelectItem>
                                                <SelectItem value="Both">Both</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => setShowNewCategoryDialog(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isUpdating.newCategory}>
                                    {isUpdating.newCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Add Category
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={showEditCategoryDialog} onOpenChange={setShowEditCategoryDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>Update the category details.</DialogDescription>
                    </DialogHeader>
                    <Form {...editCategoryForm}>
                        <form onSubmit={editCategoryForm.handleSubmit(handleEditCategory)} className="space-y-4">
                            <FormField
                                control={editCategoryForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="e.g. Groceries" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={editCategoryForm.control}
                                name="icon"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Icon</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an icon" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {CATEGORY_ICONS.map((icon) => (
                                                    <SelectItem key={icon.value} value={icon.value}>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl">{icon.value}</span>
                                                            <span>{icon.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={editCategoryForm.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Income">Income</SelectItem>
                                                <SelectItem value="Expense">Expense</SelectItem>
                                                <SelectItem value="Both">Both</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => setShowEditCategoryDialog(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isUpdating.editCategory}>
                                    {isUpdating.editCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={showDeleteCategoryDialog} onOpenChange={setShowDeleteCategoryDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this category? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-4">
                        <Button variant="outline" onClick={() => setShowDeleteCategoryDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" disabled={isUpdating.deleteCategory} onClick={handleDeleteCategory}>
                            {isUpdating.deleteCategory && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Category
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
