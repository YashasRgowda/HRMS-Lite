"use client";

import { useState, useEffect, useCallback } from "react";
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
    const newEmployee = await employeesApi.create(payload);
    await fetchEmployees();
    return newEmployee;
  };

  const deleteEmployee = async (id) => {
    await employeesApi.delete(id);
    await fetchEmployees();
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