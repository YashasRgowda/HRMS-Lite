"use client";

import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { AddEmployeeDialog } from "@/components/employees/AddEmployeeDialog";
import { DeleteEmployeeDialog } from "@/components/employees/DeleteEmployeeDialog";
import { useEmployees } from "@/hooks/useEmployees";
import { DEPARTMENTS } from "@/lib/constants";

export default function EmployeesPage() {
  const { employees, loading, error, createEmployee, deleteEmployee } = useEmployees();

  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const query = search.toLowerCase();
      const matchesSearch =
        !search ||
        e.full_name.toLowerCase().includes(query) ||
        e.employee_id.toLowerCase().includes(query) ||
        e.email.toLowerCase().includes(query) ||
        e.department.toLowerCase().includes(query);

      const matchesDepartment =
        !selectedDepartment || e.department === selectedDepartment;

      return matchesSearch && matchesDepartment;
    });
  }, [employees, search, selectedDepartment]);

  // Auto-generate next employee ID
  const nextEmployeeId = useMemo(() => {
    if (employees.length === 0) return "EMP001";
    // Extract numeric parts from existing IDs and find the max
    const nums = employees
      .map((e) => {
        const match = e.employee_id.match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(Boolean);
    const next = nums.length > 0 ? Math.max(...nums) + 1 : employees.length + 1;
    return "EMP" + String(next).padStart(3, "0");
  }, [employees]);

  return (
    <>
      <Header
        title="Employees"
        subtitle="Manage employee records"
        actions={
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Employee</span>
            <span className="sm:hidden">Add</span>
          </Button>
        }
      />

      <PageContainer>
        {loading && <PageLoader message="Loading employees..." />}

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            Failed to load employees: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {/* Search + Department Filter */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              {(search || selectedDepartment) && (
                <button
                  onClick={() => { setSearch(""); setSelectedDepartment(""); }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              )}

              <span className="text-sm text-muted-foreground hidden sm:block">
                {filteredEmployees.length} employee
                {filteredEmployees.length !== 1 && "s"}
              </span>
            </div>

            {/* Table */}
            <EmployeeTable
              employees={filteredEmployees}
              onDelete={setDeleteTarget}
              searchQuery={search}
            />
          </div>
        )}
      </PageContainer>

      {/* Dialogs */}
      <AddEmployeeDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={createEmployee}
        nextEmployeeId={nextEmployeeId}
      />

      <DeleteEmployeeDialog
        employee={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={deleteEmployee}
      />
    </>
  );
}