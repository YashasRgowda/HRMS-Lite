"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

export function EditAttendanceDialog({ record, open, onOpenChange, onSubmit }) {
    const [status, setStatus] = useState("present");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (record) {
            setStatus(record.status);
        }
    }, [record]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await onSubmit(record.id, { status });
            onOpenChange(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!record) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Attendance</DialogTitle>
                    <DialogDescription>
                        Update attendance status for{" "}
                        <span className="font-semibold text-foreground">
                            {record.employee_name}
                        </span>{" "}
                        on{" "}
                        {new Date(record.date + "T00:00:00").toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        })}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <div className="flex gap-3">
                            {["present", "absent"].map((s) => (
                                <label
                                    key={s}
                                    className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-all duration-200 ${status === s
                                        ? s === "present"
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                                            : "border-rose-500 bg-rose-50 text-rose-700 shadow-sm"
                                        : "border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="status"
                                        value={s}
                                        className="sr-only"
                                        checked={status === s}
                                        onChange={(e) => setStatus(e.target.value)}
                                    />
                                    {s === "present" ? "✓ Present" : "✗ Absent"}
                                </label>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">
                            {error}
                        </p>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Update Attendance"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}