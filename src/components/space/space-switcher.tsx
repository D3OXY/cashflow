"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSpace } from "@/context/space";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SPACE_ICONS } from "@/lib/constants";

export function SpaceSwitcher() {
    const { spaces, currentSpace, switchSpace, createNewSpace } = useSpace();
    const [open, setOpen] = React.useState(false);
    const [showNewSpaceDialog, setShowNewSpaceDialog] = React.useState(false);
    const [newSpaceName, setNewSpaceName] = React.useState("");
    const [selectedIcon, setSelectedIcon] = React.useState<string>("💰");

    const createSpace = async () => {
        if (!newSpaceName) return;

        try {
            await createNewSpace({
                name: newSpaceName,
                currency: "USD",
                icon: selectedIcon || "💰",
            });
            setShowNewSpaceDialog(false);
            setNewSpaceName("");
            setSelectedIcon(SPACE_ICONS[0].value);
            toast.success("Space created successfully");
        } catch (error) {
            console.error("Failed to create space:", error);
            toast.error("Failed to create space");
        }
    };

    return (
        <Dialog open={showNewSpaceDialog} onOpenChange={setShowNewSpaceDialog}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        role="combobox"
                        aria-expanded={open}
                        aria-label="Select a space"
                        className="w-full  justify-between px-4 hover:bg-sidebar-accent text-sidebar-foreground"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{currentSpace?.icon || "💰"}</span>
                            <span className="font-medium truncate">{currentSpace?.name || "Select a space"}</span>
                        </div>
                        <ChevronsUpDown className="h-4 w-4 shrink-0 text-sidebar-foreground/50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="center" side="bottom" sideOffset={8}>
                    <Command className="border border-sidebar-border/10">
                        <CommandList>
                            <CommandInput placeholder="Search spaces..." className="h-9" />
                            <CommandEmpty>No space found.</CommandEmpty>
                            {spaces.length > 0 && (
                                <CommandGroup>
                                    {spaces.map((space) => (
                                        <CommandItem
                                            key={space.id}
                                            onSelect={() => {
                                                switchSpace(space.id);
                                                setOpen(false);
                                            }}
                                            className="text-sm"
                                        >
                                            <span className="text-xl mr-2">{space.icon}</span>
                                            {space.name}
                                            <Check className={cn("ml-auto h-4 w-4", currentSpace?.id === space.id ? "opacity-100" : "opacity-0")} />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                        <CommandSeparator className="bg-sidebar-border/10" />
                        <CommandList>
                            <CommandGroup>
                                <CommandItem
                                    onSelect={() => {
                                        setOpen(false);
                                        setShowNewSpaceDialog(true);
                                    }}
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create Space
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Space</DialogTitle>
                    <DialogDescription>Add a new space to manage your finances.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Icon</Label>
                        <RadioGroup value={selectedIcon} onValueChange={setSelectedIcon} className="grid grid-cols-6 gap-2">
                            {SPACE_ICONS.map((icon) => (
                                <div key={icon.value}>
                                    <RadioGroupItem value={icon.value} id={icon.value} className="peer sr-only" />
                                    <Label
                                        htmlFor={icon.value}
                                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-transparent p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                    >
                                        <span className="text-2xl">{icon.value}</span>
                                        <span className="text-[10px] font-normal text-muted-foreground mt-1">{icon.label}</span>
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Space Name</Label>
                        <Input id="name" placeholder="e.g., Personal Finance" value={newSpaceName} onChange={(e) => setNewSpaceName(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewSpaceDialog(false)}>
                        Cancel
                    </Button>
                    <Button onClick={createSpace} disabled={!newSpaceName}>
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
