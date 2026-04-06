"use client";

import { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext(undefined);

const STORAGE_KEY = "hrms-sidebar-collapsed";

export function SidebarProvider({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Load saved state from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
            setIsCollapsed(JSON.parse(saved));
        }
    }, []);

    // Save state to localStorage when it changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    // Close mobile nav on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, []);

    const toggleCollapsed = () => setIsCollapsed((prev) => !prev);
    const toggleMobile = () => setIsMobileOpen((prev) => !prev);
    const closeMobile = () => setIsMobileOpen(false);

    return (
        <SidebarContext.Provider
            value={{
                isCollapsed,
                isMobileOpen,
                toggleCollapsed,
                toggleMobile,
                closeMobile,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}