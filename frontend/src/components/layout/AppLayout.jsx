import Sidebar from "./Sidebar";

export default function AppLayout({ title, subtitle, actions, children }) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Page header */}
        <header className="flex items-center justify-between border-b bg-background px-8 py-5">
          <div>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-auto bg-muted/30 p-8">{children}</main>
      </div>
    </div>
  );
}
