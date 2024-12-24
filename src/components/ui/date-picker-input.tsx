"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DatePickerInputProps {
    value?: Date;
    onChange?: (date: Date) => void;
    showCalendar?: boolean;
    disabled?: boolean;
    className?: string;
    calendarProps?: Omit<React.ComponentProps<typeof Calendar>, "selected" | "onSelect">;
}

export function DatePickerInput({ value = new Date(), onChange, showCalendar = true, disabled = false, className, calendarProps }: DatePickerInputProps): React.JSX.Element {
    const [date, setDate] = React.useState<Date>(value);
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        onChange?.(date);
    }, [date, onChange]);

    const handleSelect = (selectedDate: Date | { from: Date; to: Date }): void => {
        if (selectedDate instanceof Date) {
            const newDate = new Date(date);
            newDate.setFullYear(selectedDate.getFullYear());
            newDate.setMonth(selectedDate.getMonth());
            newDate.setDate(selectedDate.getDate());
            setDate(newDate);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className={cn("h-10 w-full justify-start text-left font-normal", !date && "text-muted-foreground", className)} disabled={disabled}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] max-w-[320px] p-0" align="start">
                <div className="">{showCalendar && <Calendar mode="single" selected={date} onSelect={handleSelect} {...calendarProps} />}</div>
            </PopoverContent>
        </Popover>
    );
}
