"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

interface CalendarProps {
    mode?: "single" | "range";
    selected?: Date | { from: Date; to: Date };
    onSelect?: (date: Date | { from: Date; to: Date }) => void;
    showControls?: "dropdown" | "arrows" | "both";
    showWeekDays?: boolean;
    disabled?: (date: Date) => boolean;
    className?: string;
}

const WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function Calendar({ mode = "single", selected, onSelect, showControls = "both", className, showWeekDays = true, disabled, ...props }: CalendarProps): React.JSX.Element {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const years = Array.from({ length: 100 }, (_, i) => year - 50 + i);

    const handleDateClick = (date: Date) => {
        if (disabled?.(date)) return;

        if (mode === "single") {
            onSelect?.(date);
        } else if (mode === "range") {
            if (!selected || !("from" in selected)) {
                onSelect?.({ from: date, to: date });
            } else {
                const { from, to } = selected;
                if (date.toDateString() === from.toDateString() || date.toDateString() === to.toDateString()) {
                    onSelect?.({ from: date, to: date });
                } else if (date < from) {
                    onSelect?.({ from: date, to: from });
                } else {
                    onSelect?.({ from, to: date });
                }
            }
        }
    };

    const isSelected = (date: Date): boolean => {
        if (!selected) return false;
        if (mode === "single") {
            return selected instanceof Date && date.toDateString() === selected.toDateString();
        }
        if ("from" in selected && "to" in selected) {
            return date >= selected.from && date <= selected.to;
        }
        return false;
    };

    const isInRange = (date: Date): boolean => {
        if (mode !== "range" || !selected || !("from" in selected)) return false;
        if (!hoveredDate) return false;
        const start = selected.from < hoveredDate ? selected.from : hoveredDate;
        const end = selected.from < hoveredDate ? hoveredDate : selected.from;
        return date > start && date < end;
    };

    return (
        <div className={cn("w-[320px] p-3", className)} {...props}>
            <div className="mb-3 flex items-center justify-between gap-2">
                {(showControls === "both" || showControls === "dropdown") && (
                    <>
                        <Select value={month.toString()} onValueChange={(value) => setCurrentDate(new Date(year, parseInt(value), 1))}>
                            <SelectTrigger className="w-[110px]">
                                <SelectValue>{MONTHS[month]}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {MONTHS.map((month, index) => (
                                    <SelectItem key={month} value={index.toString()}>
                                        {month}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={year.toString()} onValueChange={(value) => setCurrentDate(new Date(parseInt(value), month, 1))}>
                            <SelectTrigger className="w-[85px]">
                                <SelectValue>{year}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </>
                )}
                {(showControls === "both" || showControls === "arrows") && (
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {showWeekDays &&
                    WEEKDAYS.map((day) => (
                        <div key={day} className="flex h-8 items-center justify-center text-sm font-medium text-muted-foreground">
                            {day}
                        </div>
                    ))}
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                    <div key={`empty-${index}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                    const date = new Date(year, month, index + 1);
                    const isDisabled = disabled?.(date);

                    return (
                        <Button
                            key={index}
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-8 w-8 p-0 font-normal",
                                isSelected(date) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                                isInRange(date) && "bg-secondary",
                                isDisabled && "cursor-not-allowed opacity-50"
                            )}
                            disabled={isDisabled}
                            onClick={() => handleDateClick(date)}
                            onMouseEnter={() => mode === "range" && setHoveredDate(date)}
                            onMouseLeave={() => mode === "range" && setHoveredDate(null)}
                        >
                            {index + 1}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
