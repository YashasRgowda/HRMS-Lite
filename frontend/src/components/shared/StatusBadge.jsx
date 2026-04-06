import { cn } from "@/lib/utils";

export function StatusBadge({ status }) {
    const isPresent = status === "present";

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200",
                isPresent
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                    : "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20"
            )}
        >
            <span
                className={cn(
                    "h-1.5 w-1.5 rounded-full animate-pulse",
                    isPresent ? "bg-emerald-500" : "bg-rose-500"
                )}
            />
            {isPresent ? "Present" : "Absent"}
        </span>
    );
}