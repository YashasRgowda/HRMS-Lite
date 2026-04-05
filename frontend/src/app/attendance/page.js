"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, CalendarCheck, Search, Filter } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { attendanceApi, employeesApi } from "@/lib/api";

const TODAY = new Date().toISOString().split("T")[0];

export default function AttendancePage() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [searchName, setSearchName] = useState("");

  // Mark attendance dialog
  const [markOpen, setMarkOpen] = useState(false);
  const [form, setForm] = useState({ employee_id: "", date: TODAY, status: "present" });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [att, emps] = await Promise.all([
        attendanceApi.list(),
        employeesApi.list(),
      ]);
      setRecords(att);
      setEmployees(emps);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Client-side filtering
  const filtered = records.filter((r) => {
    const empMatch = filterEmployee ? r.employee_id === Number(filterEmployee) : true;
    const dateMatch = filterDate ? r.date === filterDate : true;
    const nameMatch = searchName
      ? (r.employee_name || "").toLowerCase().includes(searchName.toLowerCase()) ||
        (r.employee_code || "").toLowerCase().includes(searchName.toLowerCase())
      : true;
    return empMatch && dateMatch && nameMatch;
  });

  // Attendance summary by employee
  const summaryMap = {};
  employees.forEach((e) => {
    summaryMap[e.id] = {
      name: e.full_name,
      code: e.employee_id,
      present: 0,
      absent: 0,
      department: e.department,
    };
  });
  records.forEach((r) => {
    if (summaryMap[r.employee_id]) {
      if (r.status === "present") summaryMap[r.employee_id].present++;
      else summaryMap[r.employee_id].absent++;
    }
  });

  function handleFormChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError(null);
  }

  async function handleMarkSubmit(e) {
    e.preventDefault();
    if (!form.employee_id) {
      setFormError("Please select an employee.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await attendanceApi.mark({
        employee_id: Number(form.employee_id),
        date: form.date,
        status: form.status,
      });
      setMarkOpen(false);
      setForm({ employee_id: "", date: TODAY, status: "present" });
      await loadData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const clearFilters = () => {
    setFilterEmployee("");
    setFilterDate("");
    setSearchName("");
  };
  const hasFilters = filterEmployee || filterDate || searchName;

  return (
    <AppLayout
      title="Attendance"
      subtitle="Track and manage daily attendance records"
      actions={
        <Button onClick={() => { setForm({ employee_id: "", date: TODAY, status: "present" }); setFormError(null); setMarkOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Mark Attendance
        </Button>
      }
    >
      {/* Summary cards */}
      {!loading && employees.length > 0 && (
        <div className="mb-6 rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Attendance Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Employee</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Department</th>
                  <th className="px-6 py-3 text-center font-medium text-muted-foreground">Present Days</th>
                  <th className="px-6 py-3 text-center font-medium text-muted-foreground">Absent Days</th>
                  <th className="px-6 py-3 text-center font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Object.entries(summaryMap).map(([id, s]) => (
                  <tr key={id} className="hover:bg-muted/20">
                    <td className="px-6 py-3">
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{s.code}</p>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{s.department}</td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        {s.present}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                        {s.absent}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center text-muted-foreground">
                      {s.present + s.absent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search employee…"
            className="pl-9 w-52"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>

        <select
          value={filterEmployee}
          onChange={(e) => setFilterEmployee(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">All Employees</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.full_name} ({e.employee_id})
            </option>
          ))}
        </select>

        <Input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="w-44"
        />

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            Clear filters
          </Button>
        )}

        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "record" : "records"}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Employee</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recorded At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <CalendarCheck className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        {hasFilters
                          ? "No records match the selected filters."
                          : "No attendance records yet. Mark your first attendance."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{record.employee_name || "—"}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {record.employee_code || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(record.date + "T00:00:00").toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={record.status === "present" ? "default" : "destructive"}
                        className={record.status === "present" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                      >
                        {record.status === "present" ? "Present" : "Absent"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(record.created_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Mark Attendance Dialog */}
      <Dialog open={markOpen} onOpenChange={setMarkOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
            <DialogDescription>Record attendance for an employee.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMarkSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="employee_id">Employee</Label>
              <select
                id="employee_id"
                name="employee_id"
                value={form.employee_id}
                onChange={handleFormChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="" disabled>Select employee…</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.full_name} ({e.employee_id})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleFormChange}
                max={TODAY}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <div className="flex gap-3">
                {["present", "absent"].map((s) => (
                  <label
                    key={s}
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm font-medium transition-colors ${
                      form.status === s
                        ? s === "present"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-rose-500 bg-rose-50 text-rose-700"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      className="sr-only"
                      checked={form.status === s}
                      onChange={handleFormChange}
                    />
                    {s === "present" ? "✓ Present" : "✗ Absent"}
                  </label>
                ))}
              </div>
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setMarkOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving…" : "Mark Attendance"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
