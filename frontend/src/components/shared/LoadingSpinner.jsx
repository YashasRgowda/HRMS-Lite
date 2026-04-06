import { cn } from "@/lib/utils";

export function LoadingSpinner({ className, size = "default" }) {
    const sizeClasses = {
        sm: "h-4 w-4 border-2",
        default: "h-8 w-8 border-2",
        lg: "h-12 w-12 border-3",
    };

    return (
        <div
            className={cn(
                "animate-spin rounded-full border-primary border-t-transparent",
                sizeClasses[size],
                className
            )}
        />
    );
}

export function PageLoader({ message = "Loading..." }) {
    return (
        <div className="flex h-64 flex-col items-center justify-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    );
}