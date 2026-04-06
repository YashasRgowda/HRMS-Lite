"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Employees", href: "/employees", icon: Users },
    { label: "Attendance", href: "/attendance", icon: CalendarCheck },
];

export function Sidebar() {
    const pathname = usePathname();
    const { isCollapsed, toggleCollapsed } = useSidebar();

    return (
        <aside
            className={cn(
                "hidden lg:flex h-full flex-col bg-sidebar relative transition-all duration-300 ease-in-out",
                isCollapsed ? "w-[72px]" : "w-64"
            )}
        >
            {/* Edge Collapse Button */}
            <button
                onClick={toggleCollapsed}
                className="absolute -right-3 top-7 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white shadow-md hover:bg-gray-50 hover:shadow-lg transition-all duration-200"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                <ChevronLeft
                    className={cn(
                        "h-3.5 w-3.5 text-gray-600 transition-transform duration-300",
                        isCollapsed && "rotate-180"
                    )}
                />
            </button>

            {/* Logo */}
            <div
                className={cn(
                    "flex h-16 items-center border-b border-sidebar-border",
                    isCollapsed ? "justify-center px-2" : "gap-3 px-5"
                )}
            >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                    <span className="text-sm font-bold text-white">HR</span>
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-sidebar-foreground tracking-tight">
                            HRMS Lite
                        </span>
                        <span className="text-[11px] text-sidebar-foreground/50">
                            Admin Panel
                        </span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1.5 p-3 mt-2">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href || pathname.startsWith(href + "/");
                    return (
                        <Link
                            key={href}
                            href={href}
                            title={isCollapsed ? label : undefined}
                            className={cn(
                                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isCollapsed && "justify-center px-2",
                                isActive
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                            )}
                        >
                            <Icon
                                className={cn(
                                    "h-5 w-5 shrink-0 transition-transform duration-200",
                                    !isActive && "group-hover:scale-110"
                                )}
                            />
                            {!isCollapsed && <span>{label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            {!isCollapsed && (
                <div className="border-t border-sidebar-border px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-xs font-semibold text-white shadow-md">
                            A
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-sidebar-foreground">
                                Admin User
                            </span>
                            <span className="text-[10px] text-sidebar-foreground/50">
                                admin@hrms.com
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}