"use client";

import { SidebarProvider } from "@/context/SidebarContext";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function AppShell({ children }) {
    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <MobileNav />
                <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
            </div>
        </SidebarProvider>
    );
}