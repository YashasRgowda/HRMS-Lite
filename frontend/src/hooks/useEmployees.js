"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { employeesApi } from "@/lib/api";

export function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeesApi.list();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const createEmployee = async (payload) => {
    try {
      const newEmployee = await employeesApi.create(payload);
      await fetchEmployees();
      toast.success(`Employee "${payload.full_name}" added successfully!`);
      return newEmployee;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await employeesApi.delete(id);
      await fetchEmployees();
      toast.success("Employee deleted successfully.");
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  return {
    employees,
    loading,
    error,
    refetch: fetchEmployees,
    createEmployee,
    deleteEmployee,
  };
}