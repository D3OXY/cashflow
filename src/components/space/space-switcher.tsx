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

export function SpaceSwitcher() {
    const { spaces, currentSpace, switchSpace, createNewSpace } = useSpace();
    const [open, setOpen] = React.useState(false);
    const [showNewSpaceDialog, setShowNewSpaceDialog] = React.useState(false);
    const [newSpaceName, setNewSpaceName] = React.useState("");

    const createSpace = async () => {
        if (!newSpaceName) return;

        try {
            await createNewSpace({ name: newSpaceName, currency: "USD" });
            setShowNewSpaceDialog(false);
            setNewSpaceName("");
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
                    <Button variant="outline" role="combobox" aria-expanded={open} aria-label="Select a space" className="w-[200px] justify-between">
                        {currentSpace?.name || "Select a space"}
                        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandList>
                            <CommandInput placeholder="Search space..." />
                            <CommandEmpty>No space found.</CommandEmpty>
                            <CommandGroup heading="Spaces">
                                {spaces.map((space) => (
                                    <CommandItem
                                        key={space.id}
                                        onSelect={() => {
                                            switchSpace(space.id);
                                            setOpen(false);
                                        }}
                                        className="text-sm"
                                    >
                                        {space.name}
                                        <Check className={cn("ml-auto h-4 w-4", currentSpace?.id === space.id ? "opacity-100" : "opacity-0")} />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                        <CommandSeparator />
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
                        <Label htmlFor="name">Space Name</Label>
                        <Input id="name" placeholder="Enter space name" value={newSpaceName} onChange={(e) => setNewSpaceName(e.target.value)} />
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
