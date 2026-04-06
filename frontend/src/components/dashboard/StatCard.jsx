import { cn } from "@/lib/utils";

const colorVariants = {
    blue: {
        bg: "bg-gradient-to-br from-blue-500 to-blue-600",
        shadow: "shadow-blue-500/25",
        light: "bg-blue-50",
        text: "text-blue-600",
    },
    emerald: {
        bg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
        shadow: "shadow-emerald-500/25",
        light: "bg-emerald-50",
        text: "text-emerald-600",
    },
    rose: {
        bg: "bg-gradient-to-br from-rose-500 to-rose-600",
        shadow: "shadow-rose-500/25",
        light: "bg-rose-50",
        text: "text-rose-600",
    },
    amber: {
        bg: "bg-gradient-to-br from-amber-500 to-amber-600",
        shadow: "shadow-amber-500/25",
        light: "bg-amber-50",
        text: "text-amber-600",
    },
};

export function StatCard({ title, value, subtitle, icon: Icon, color = "blue" }) {
    const variant = colorVariants[color] || colorVariants.blue;

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300">
            {/* Background decoration */}
            <div className={cn("absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10", variant.bg)} />

            <div className="relative flex items-start justify-between">
                <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className={cn("text-4xl font-bold tracking-tight", variant.text)}>
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground">{subtitle}</p>
                    )}
                </div>

                {Icon && (
                    <div
                        className={cn(
                            "rounded-xl p-3 shadow-lg transition-transform duration-300 group-hover:scale-110",
                            variant.bg,
                            variant.shadow
                        )}
                    >
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                )}
            </div>
        </div>
    );
}