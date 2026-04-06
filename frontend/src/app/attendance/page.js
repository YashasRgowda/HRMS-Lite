"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { AttendanceFilters } from "@/components/attendance/AttendanceFilters";
import { AttendanceSummary } from "@/components/attendance/AttendanceSummary";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { MarkAttendanceDialog } from "@/components/attendance/MarkAttendanceDialog";
import { EditAttendanceDialog } from "@/components/attendance/EditAttendanceDialog";
import { DeleteAttendanceDialog } from "@/components/attendance/DeleteAttendanceDialog";
import { useAttendance } from "@/hooks/useAttendance";
import { useEmployees } from "@/hooks/useEmployees";

export default function AttendancePage() {
  const {
    records,
    loading: attLoading,
    error: attError,
    markAttendance,
    updateAttendance,
    deleteAttendance,
  } = useAttendance();
  const { employees, loading: empLoading } = useEmployees();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [markDialogOpen, setMarkDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loading = attLoading || empLoading;

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesEmployee = selectedEmployee
        ? r.employee_id === Number(selectedEmployee)
        : true;
      const matchesDate = selectedDate ? r.date === selectedDate : true;
      const matchesSearch = searchQuery
        ? (r.employee_name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (r.employee_code || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        : true;
      return matchesEmployee && matchesDate && matchesSearch;
    });
  }, [records, selectedEmployee, selectedDate, searchQuery]);

  const hasFilters = searchQuery || selectedEmployee || selectedDate;

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedEmployee("");
    setSelectedDate("");
  };

  return (
    <>
      <Header
        title="Attendance"
        subtitle="Track daily attendance records"
        actions={
          <Button onClick={() => setMarkDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Mark Attendance</span>
            <span className="sm:hidden ml-2">Mark</span>
          </Button>
        }
      />

      <PageContainer>
        {loading && <PageLoader message="Loading attendance..." />}

        {attError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Failed to load attendance: {attError}
          </div>
        )}

        {!loading && !attError && (
          <div className="space-y-6">
            {/* Summary */}
            {employees.length > 0 && (
              <AttendanceSummary employees={employees} records={records} />
            )}

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <AttendanceFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedEmployee={selectedEmployee}
                onEmployeeChange={setSelectedEmployee}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                employees={employees}
                onClear={clearFilters}
              />
              <span className="text-sm text-muted-foreground">
                {filteredRecords.length} record
                {filteredRecords.length !== 1 && "s"}
              </span>
            </div>

            {/* Table */}
            <AttendanceTable
              records={filteredRecords}
              hasFilters={hasFilters}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />
          </div>
        )}
      </PageContainer>

      {/* Dialogs */}
      <MarkAttendanceDialog
        open={markDialogOpen}
        onOpenChange={setMarkDialogOpen}
        onSubmit={markAttendance}
        employees={employees}
      />

      <EditAttendanceDialog
        record={editTarget}
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        onSubmit={updateAttendance}
      />

      <DeleteAttendanceDialog
        record={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={deleteAttendance}
      />
    </>
  );
}