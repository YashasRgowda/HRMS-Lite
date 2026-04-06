"use client";

import { useState, useEffect, useCallback } from "react";
import { dashboardApi, attendanceApi } from "@/lib/api";

export function useDashboard() {
  const [stats, setStats] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, attendanceData] = await Promise.all([
        dashboardApi.stats(),
        attendanceApi.list(),
      ]);
      setStats(statsData);
      setRecentAttendance(attendanceData.slice(0, 10));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    stats,
    recentAttendance,
    loading,
    error,
    refetch: fetchDashboard,
  };
}