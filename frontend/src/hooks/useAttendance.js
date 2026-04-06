"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
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
    try {
      const newRecord = await attendanceApi.mark(payload);
      await fetchRecords();
      toast.success("Attendance marked successfully!");
      return newRecord;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const updateAttendance = async (id, payload) => {
    try {
      const updated = await attendanceApi.update(id, payload);
      await fetchRecords();
      toast.success("Attendance updated successfully!");
      return updated;
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const deleteAttendance = async (id) => {
    try {
      await attendanceApi.delete(id);
      await fetchRecords();
      toast.success("Attendance record deleted.");
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
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