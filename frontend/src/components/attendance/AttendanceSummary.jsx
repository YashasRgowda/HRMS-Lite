import { CalendarCheck } from "lucide-react";

export function AttendanceSummary({ employees, records }) {
    // Calculate summary per employee
    const summaryMap = {};

    employees.forEach((emp) => {
        summaryMap[emp.id] = {
            name: emp.full_name,
            code: emp.employee_id,
            department: emp.department,
            present: 0,
            absent: 0,
        };
    });

    records.forEach((record) => {
        if (summaryMap[record.employee_id]) {
            if (record.status === "present") {
                summaryMap[record.employee_id].present++;
            } else {
                summaryMap[record.employee_id].absent++;
            }
        }
    });

    const summaryList = Object.values(summaryMap);

    if (summaryList.length === 0) return null;

    return (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 border-b px-6 py-4">
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Attendance Summary</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/30">
                            <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                                Employee
                            </th>
                            <th className="px-6 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">
                                Department
                            </th>
                            <th className="px-6 py-3 text-center font-medium text-muted-foreground">
                                Present
                            </th>
                            <th className="px-6 py-3 text-center font-medium text-muted-foreground">
                                Absent
                            </th>
                            <th className="px-6 py-3 text-center font-medium text-muted-foreground hidden md:table-cell">
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {summaryList.map((item, index) => (
                            <tr key={index} className="hover:bg-muted/20">
                                <td className="px-6 py-3">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-xs text-muted-foreground font-mono">
                                        {item.code}
                                    </p>
                                </td>
                                <td className="px-6 py-3 text-muted-foreground hidden sm:table-cell">
                                    {item.department}
                                </td>
                                <td className="px-6 py-3 text-center">
                                    <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                        {item.present}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-center">
                                    <span className="inline-flex items-center justify-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                                        {item.absent}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-center text-muted-foreground hidden md:table-cell">
                                    {item.present + item.absent}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}