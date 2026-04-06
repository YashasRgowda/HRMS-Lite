"use client";

import { Users, UserCheck, UserX, Clock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentAttendance } from "@/components/dashboard/RecentAttendance";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardPage() {
  const { stats, recentAttendance, loading, error, refetch } = useDashboard();

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Header title="Dashboard" subtitle={`Overview for ${today}`} />

      <PageContainer>
        {loading && <PageLoader message="Loading dashboard..." />}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Failed to load dashboard: {error}
          </div>
        )}

        {!loading && !error && stats && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Employees"
                value={stats.total_employees}
                subtitle="Registered in system"
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Present Today"
                value={stats.present_today}
                subtitle="Marked present today"
                icon={UserCheck}
                color="emerald"
              />
              <StatCard
                title="Absent Today"
                value={stats.absent_today}
                subtitle="Marked absent today"
                icon={UserX}
                color="rose"
              />
              <StatCard
                title="Not Marked"
                value={stats.not_marked_today}
                subtitle="Pending for today"
                icon={Clock}
                color="amber"
              />
            </div>

            {/* Today's note */}
            {stats.not_marked_today > 0 && stats.total_employees > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                ⚠️ {stats.not_marked_today} employee{stats.not_marked_today !== 1 ? "s have" : " has"} not been marked for today yet.
              </div>
            )}

            {/* Recent Attendance */}
            <RecentAttendance records={recentAttendance} />
          </div>
        )}
      </PageContainer>
    </>
  );
}