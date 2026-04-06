"use client";

import { useState, useEffect } from "react";
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
import { DEPARTMENTS } from "@/lib/constants";

const EMPTY_FORM = {
    employee_id: "",
    full_name: "",
    email: "",
    department: "",
};

export function AddEmployeeDialog({ open, onOpenChange, onSubmit, nextEmployeeId }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Auto-fill employee ID when dialog opens
    useEffect(() => {
        if (open && nextEmployeeId) {
            setForm((prev) => ({ ...prev, employee_id: nextEmployeeId }));
        }
    }, [open, nextEmployeeId]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.employee_id || !form.full_name || !form.email || !form.department) {
            setError("All fields are required.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await onSubmit(form);
            setForm(EMPTY_FORM);
            onOpenChange(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (open) => {
        if (!open) {
            setForm(EMPTY_FORM);
            setError(null);
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                    <DialogDescription>
                        Enter the details to register a new employee.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="employee_id">
                            Employee ID
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                (auto-generated, you can edit)
                            </span>
                        </Label>
                        <Input
                            id="employee_id"
                            name="employee_id"
                            placeholder="e.g. EMP001"
                            value={form.employee_id}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                            id="full_name"
                            name="full_name"
                            placeholder="e.g. John Doe"
                            value={form.full_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="e.g. john@company.com"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <select
                            id="department"
                            name="department"
                            value={form.department}
                            onChange={handleChange}
                            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="" disabled>
                                Select department...
                            </option>
                            {DEPARTMENTS.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>
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
                            {loading ? "Adding..." : "Add Employee"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}