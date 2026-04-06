"use client";

import { Users, UserCheck, UserX, Clock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentAttendance } from "@/components/dashboard/RecentAttendance";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardPage() {
  const { stats, recentAttendance, loading, error } = useDashboard();

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
                subtitle="Marked present"
                icon={UserCheck}
                color="emerald"
              />
              <StatCard
                title="Absent Today"
                value={stats.absent_today}
                subtitle="Marked absent"
                icon={UserX}
                color="rose"
              />
              <StatCard
                title="Not Marked"
                value={stats.not_marked_today}
                subtitle="Pending today"
                icon={Clock}
                color="amber"
              />
            </div>

            {/* Recent Attendance */}
            <RecentAttendance records={recentAttendance} />
          </div>
        )}
      </PageContainer>
    </>
  );
}