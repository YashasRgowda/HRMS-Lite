"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, UserX, Clock, TrendingUp } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardApi, attendanceApi, employeesApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`rounded-lg p-2.5 ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [s, attendance] = await Promise.all([
          dashboardApi.stats(),
          attendanceApi.list(),
        ]);
        setStats(s);
        setRecentAttendance(attendance.slice(0, 10));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AppLayout
      title="Dashboard"
      subtitle={`Overview for ${new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`}
    >
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
            <p className="mt-3 text-sm text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          Could not load dashboard data: {error}
        </div>
      )}

      {!loading && !error && stats && (
        <div className="space-y-8">
          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Employees"
              value={stats.total_employees}
              icon={Users}
              color="bg-primary"
              subtitle="Registered in the system"
            />
            <StatCard
              title="Present Today"
              value={stats.present_today}
              icon={UserCheck}
              color="bg-emerald-500"
              subtitle="Marked present today"
            />
            <StatCard
              title="Absent Today"
              value={stats.absent_today}
              icon={UserX}
              color="bg-rose-500"
              subtitle="Marked absent today"
            />
            <StatCard
              title="Not Marked"
              value={stats.not_marked_today}
              icon={Clock}
              color="bg-amber-500"
              subtitle="Attendance pending today"
            />
          </div>

          {/* Recent attendance */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-4">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">Recent Attendance</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentAttendance.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No attendance records yet.
                </div>
              ) : (
                <div className="divide-y">
                  {recentAttendance.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between px-6 py-3.5"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {record.employee_name || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {record.employee_code} · {new Date(record.date).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <Badge
                        variant={record.status === "present" ? "default" : "destructive"}
                        className={record.status === "present" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
