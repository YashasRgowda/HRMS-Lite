import { MobileNavTrigger } from "./MobileNav";

export function Header({ title, subtitle, actions }) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border/60 bg-white/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
            <MobileNavTrigger />

            <div className="flex flex-1 items-center justify-between">
                <div className="space-y-0.5">
                    <h1 className="text-xl font-semibold text-foreground tracking-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground hidden sm:block">
                            {subtitle}
                        </p>
                    )}
                </div>
                {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
        </header>
    );
}