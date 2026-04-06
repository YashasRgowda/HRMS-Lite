"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";

const SidebarContext = createContext(undefined);

const STORAGE_KEY = "hrms-sidebar-collapsed";

// Helper to safely get from localStorage (only on client)
function getInitialCollapsed() {
    if (typeof window === "undefined") return false;
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : false;
    } catch {
        return false;
    }
}

export function SidebarProvider({ children }) {
    // Initialize state directly from localStorage (no useEffect needed)
    const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsed);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const toggleCollapsed = useCallback(() => {
        setIsCollapsed((prev) => {
            const newValue = !prev;
            // Save to localStorage when toggling
            if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue));
            }
            return newValue;
        });
    }, []);

    const toggleMobile = useCallback(() => {
        setIsMobileOpen((prev) => !prev);
    }, []);

    const closeMobile = useCallback(() => {
        setIsMobileOpen(false);
    }, []);

    const value = useMemo(
        () => ({
            isCollapsed,
            isMobileOpen,
            toggleCollapsed,
            toggleMobile,
            closeMobile,
        }),
        [isCollapsed, isMobileOpen, toggleCollapsed, toggleMobile, closeMobile]
    );

    return (
        <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}