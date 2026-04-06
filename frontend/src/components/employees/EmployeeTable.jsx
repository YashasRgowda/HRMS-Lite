import { Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";

export function EmployeeTable({ employees, onDelete, searchQuery }) {
    if (employees.length === 0) {
        return (
            <div className="rounded-xl border bg-card shadow-sm">
                <EmptyState
                    icon={Users}
                    title={searchQuery ? "No employees found" : "No employees yet"}
                    description={
                        searchQuery
                            ? "Try adjusting your search query."
                            : "Add your first employee to get started."
                    }
                />
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead className="hidden sm:table-cell">Email</TableHead>
                        <TableHead className="hidden md:table-cell">Department</TableHead>
                        <TableHead className="text-center hidden lg:table-cell">
                            Present
                        </TableHead>
                        <TableHead className="text-center hidden lg:table-cell">
                            Absent
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employees.map((employee) => (
                        <TableRow key={employee.id}>
                            <TableCell className="font-mono text-sm font-medium">
                                {employee.employee_id}
                            </TableCell>
                            <TableCell>
                                <div>
                                    <p className="font-medium">{employee.full_name}</p>
                                    <p className="text-xs text-muted-foreground sm:hidden">
                                        {employee.email}
                                    </p>
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground">
                                {employee.email}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                <Badge variant="secondary">{employee.department}</Badge>
                            </TableCell>
                            <TableCell className="text-center hidden lg:table-cell">
                                <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                    {employee.total_present}
                                </span>
                            </TableCell>
                            <TableCell className="text-center hidden lg:table-cell">
                                <span className="inline-flex items-center justify-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                                    {employee.total_absent}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => onDelete(employee)}
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}