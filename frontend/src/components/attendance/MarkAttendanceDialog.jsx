"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

const TODAY = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .split("T")[0];

export function MarkAttendanceDialog({ open, onOpenChange, onSubmit, employees }) {
    const [form, setForm] = useState({
        employee_id: "",
        date: TODAY,
        status: "present",
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.employee_id) {
            setError("Please select an employee.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await onSubmit({
                employee_id: Number(form.employee_id),
                date: form.date,
                status: form.status,
            });
            setForm({ employee_id: "", date: TODAY, status: "present" });
            onOpenChange(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (open) => {
        if (!open) {
            setForm({ employee_id: "", date: TODAY, status: "present" });
            setError(null);
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Mark Attendance</DialogTitle>
                    <DialogDescription>
                        Record attendance for an employee.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="employee_id">Employee</Label>
                        <select
                            id="employee_id"
                            name="employee_id"
                            value={form.employee_id}
                            onChange={handleChange}
                            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="" disabled>
                                Select employee...
                            </option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.full_name} ({emp.employee_id})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            name="date"
                            type="date"
                            value={form.date}
                            onChange={handleChange}
                            max={TODAY}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Status</Label>
                        <div className="flex gap-3">
                            {["present", "absent"].map((status) => (
                                <label
                                    key={status}
                                    className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm font-medium transition-colors ${form.status === status
                                        ? status === "present"
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                            : "border-rose-500 bg-rose-50 text-rose-700"
                                        : "border-border text-muted-foreground hover:bg-muted"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="status"
                                        value={status}
                                        className="sr-only"
                                        checked={form.status === status}
                                        onChange={handleChange}
                                    />
                                    {status === "present" ? "✓ Present" : "✗ Absent"}
                                </label>
                            ))}
                        </div>
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Mark Attendance"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}