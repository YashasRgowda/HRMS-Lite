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

export default function EmployeesPage() {
  const { employees, loading, error, createEmployee, deleteEmployee } = useEmployees();

  const [search, setSearch] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredEmployees = useMemo(() => {
    if (!search) return employees;
    const query = search.toLowerCase();
    return employees.filter(
      (e) =>
        e.full_name.toLowerCase().includes(query) ||
        e.employee_id.toLowerCase().includes(query) ||
        e.email.toLowerCase().includes(query) ||
        e.department.toLowerCase().includes(query)
    );
  }, [employees, search]);

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
            {/* Search */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
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