"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useSpace } from "@/context/space";
import { addCategory, deleteCategory } from "@/lib/firebase/spaces";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORY_ICONS } from "@/lib/constants";
import type { Category } from "@/lib/types/space";

export function CategoryDialog() {
    const { currentSpace } = useSpace();
    const [open, setOpen] = useState(false);
    const [newCategory, setNewCategory] = useState<Omit<Category, "id">>({
        name: "",
        type: "Expense",
        icon: "📦",
        color: "#6b7280",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddCategory = async () => {
        if (!currentSpace) return;
        if (!newCategory.name.trim()) {
            toast.error("Category name is required");
            return;
        }

        try {
            setIsSubmitting(true);
            await addCategory(currentSpace.id, newCategory);
            setNewCategory({ name: "", type: "Expense", icon: "📦", color: "#6b7280" });
            toast.success("Category added successfully");
        } catch (error) {
            console.error("Failed to add category:", error);
            toast.error("Failed to add category");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (!currentSpace) return;

        try {
            await deleteCategory(currentSpace.id, categoryId);
            toast.success("Category deleted successfully");
        } catch (error) {
            console.error("Failed to delete category:", error);
            toast.error("Failed to delete category");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Manage Categories
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Manage Categories</DialogTitle>
                    <DialogDescription>Add or remove categories for your transactions.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid gap-2">
                        <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                            <Input placeholder="Category name" value={newCategory.name} onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))} />
                            <Select value={newCategory.type} onValueChange={(value) => setNewCategory((prev) => ({ ...prev, type: value as Category["type"] }))}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Income">Income</SelectItem>
                                    <SelectItem value="Expense">Expense</SelectItem>
                                    <SelectItem value="Both">Both</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={newCategory.icon} onValueChange={(value) => setNewCategory((prev) => ({ ...prev, icon: value }))}>
                                <SelectTrigger className="w-[60px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORY_ICONS.map((icon) => (
                                        <SelectItem key={icon.value} value={icon.value}>
                                            <span className="flex items-center">
                                                <span className="mr-2">{icon.value}</span>
                                                {icon.label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleAddCategory} disabled={isSubmitting}>
                            Add Category
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {currentSpace?.categories.map((category) => (
                            <div key={category.id} className="flex items-center justify-between p-2 rounded-md border">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{category.icon}</span>
                                    <div>
                                        <p className="font-medium">{category.name}</p>
                                        <p className="text-sm text-muted-foreground">{category.type}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
