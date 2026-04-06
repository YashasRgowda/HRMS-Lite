"use client";

import { useState, useEffect, useCallback } from "react";
import { attendanceApi } from "@/lib/api";

export function useAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecords = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await attendanceApi.list(filters);
      setRecords(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const markAttendance = async (payload) => {
    const newRecord = await attendanceApi.mark(payload);
    await fetchRecords();
    return newRecord;
  };

  const updateAttendance = async (id, payload) => {
    const updated = await attendanceApi.update(id, payload);
    await fetchRecords();
    return updated;
  };

  const deleteAttendance = async (id) => {
    await attendanceApi.delete(id);
    await fetchRecords();
  };

  return {
    records,
    loading,
    error,
    refetch: fetchRecords,
    markAttendance,
    updateAttendance,
    deleteAttendance,
  };
}