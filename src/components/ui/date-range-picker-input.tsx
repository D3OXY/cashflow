"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DateRangePickerInputProps {
    value?: { from: Date; to: Date };
    onChange?: (date: { from: Date; to: Date }) => void;
    showCalendar?: boolean;
    disabled?: boolean;
    className?: string;
    calendarProps?: Omit<React.ComponentProps<typeof Calendar>, "selected" | "onSelect">;
    align?: "start" | "end" | "center";
}

export function DateRangePickerInput({
    value = { from: new Date(), to: new Date() },
    onChange,
    showCalendar = true,
    disabled = false,
    className,
    calendarProps,
    align = "start",
}: DateRangePickerInputProps): React.JSX.Element {
    const [date, setDate] = React.useState<{ from: Date; to: Date }>(value);
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        onChange?.(date);
    }, [date, onChange]);

    const handleSelect = (selectedDate: Date | { from: Date; to: Date }): void => {
        if ("from" in selectedDate && "to" in selectedDate) {
            setDate(selectedDate);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className={cn("h-10 w-full justify-start text-left font-normal", !date && "text-muted-foreground", className)} disabled={disabled}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date.from && date.to ? (
                        <>
                            {format(date.from, "PP")} - {format(date.to, "PP")}
                        </>
                    ) : (
                        <span>Pick a date range</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align={align}>
                <div>{showCalendar && <Calendar mode="range" selected={{ from: date.from, to: date.to }} onSelect={handleSelect} {...calendarProps} />}</div>
            </PopoverContent>
        </Popover>
    );
}
