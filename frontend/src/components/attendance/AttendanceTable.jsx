import { CalendarCheck, Pencil, Trash2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";

export function AttendanceTable({ records, hasFilters, onEdit, onDelete }) {
    if (records.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                <EmptyState
                    icon={CalendarCheck}
                    title={hasFilters ? "No records found" : "No attendance records"}
                    description={
                        hasFilters
                            ? "Try adjusting your filters."
                            : "Mark your first attendance to get started."
                    }
                />
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50/50">
                        <TableHead>Employee</TableHead>
                        <TableHead className="hidden sm:table-cell">Employee ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Recorded At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.map((record) => (
                        <TableRow key={record.id} className="hover:bg-gray-50/50">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                                        {(record.employee_name || "U")[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{record.employee_name || "—"}</p>
                                        <p className="text-xs text-muted-foreground sm:hidden">
                                            {record.employee_code}
                                        </p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell font-mono text-sm text-muted-foreground">
                                {record.employee_code || "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {new Date(record.date + "T00:00:00").toLocaleDateString(
                                    "en-IN",
                                    {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    }
                                )}
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={record.status} />
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                                {new Date(record.created_at).toLocaleString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => onEdit(record)}
                                        className="text-muted-foreground hover:text-blue-600 hover:bg-blue-50"
                                        title="Edit attendance"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => onDelete(record)}
                                        className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                                        title="Delete attendance"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}