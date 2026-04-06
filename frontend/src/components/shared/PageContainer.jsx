export function PageContainer({ children }) {
    return (
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn">{children}</div>
        </div>
    );
}