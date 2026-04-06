import { CalendarCheck, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import Link from "next/link";

export function RecentAttendance({ records }) {
    if (records.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
                    <CalendarCheck className="h-5 w-5 text-blue-500" />
                    <h2 className="font-semibold text-gray-900">Recent Attendance</h2>
                </div>
                <EmptyState
                    icon={CalendarCheck}
                    title="No attendance records"
                    description="Attendance records will appear here once marked."
                />
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-blue-500" />
                    <h2 className="font-semibold text-gray-900">Recent Attendance</h2>
                </div>
                <Link
                    href="/attendance"
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                    View all
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
            <div className="divide-y divide-gray-50">
                {records.map((record, index) => (
                    <div
                        key={record.id}
                        className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                                {(record.employee_name || "U")[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {record.employee_name || "Unknown"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {record.employee_code} ·{" "}
                                    {new Date(record.date + "T00:00:00").toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>
                        <StatusBadge status={record.status} />
                    </div>
                ))}
            </div>
        </div>
    );
}