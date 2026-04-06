import { cn } from "@/lib/utils";

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center py-16 text-center animate-fadeIn",
                className
            )}
        >
            {Icon && (
                <div className="mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 p-4 shadow-inner">
                    <Icon className="h-8 w-8 text-gray-400" />
                </div>
            )}
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            {description && (
                <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
                    {description}
                </p>
            )}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}