"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AttendanceFilters({
    searchQuery,
    onSearchChange,
    selectedEmployee,
    onEmployeeChange,
    selectedDate,
    onDateChange,
    employees,
    onClear,
}) {
    const hasFilters = searchQuery || selectedEmployee || selectedDate;

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search employee..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <select
                value={selectedEmployee}
                onChange={(e) => onEmployeeChange(e.target.value)}
                className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                        {emp.full_name} ({emp.employee_id})
                    </option>
                ))}
            </select>

            <Input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-full sm:w-40"
            />

            {hasFilters && (
                <Button variant="ghost" size="sm" onClick={onClear}>
                    <X className="h-4 w-4 mr-1" />
                    Clear
                </Button>
            )}
        </div>
    );
}