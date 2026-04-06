"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    X,
    Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/context/SidebarContext";
import { Button } from "@/components/ui/button";

const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Employees", href: "/employees", icon: Users },
    { label: "Attendance", href: "/attendance", icon: CalendarCheck },
];

export function MobileNavTrigger() {
    const { toggleMobile } = useSidebar();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobile}
            className="lg:hidden hover:bg-gray-100"
        >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
        </Button>
    );
}

export function MobileNav() {
    const pathname = usePathname();
    const { isMobileOpen, closeMobile } = useSidebar();

    if (!isMobileOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fadeIn"
                onClick={closeMobile}
            />

            {/* Drawer */}
            <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar lg:hidden animate-slideIn shadow-2xl">
                {/* Header */}
                <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                            <span className="text-sm font-bold text-white">HR</span>
                        </div>
                        <span className="text-sm font-semibold text-sidebar-foreground">
                            HRMS Lite
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={closeMobile}
                        className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="space-y-1.5 p-3 mt-2">
                    {navItems.map(({ label, href, icon: Icon }) => {
                        const isActive =
                            pathname === href || pathname.startsWith(href + "/");
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={closeMobile}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                )}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <span>{label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-sm font-semibold text-white">
                            A
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-sidebar-foreground">
                                Admin User
                            </span>
                            <span className="text-xs text-sidebar-foreground/50">
                                admin@hrms.com
                            </span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}