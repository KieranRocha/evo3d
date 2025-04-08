/**
 * Barra de progresso para uploads e processamentos
 */
export function ProgressBar({
    progress,
    label,
    showPercentage = true,
    height = "h-2",
    color = "bg-primary",
}: {
    progress: number; // 0-100
    label?: string;
    showPercentage?: boolean;
    height?: string;
    color?: string;
}) {
    // Garantir que o progresso esteja entre 0-100
    const normalizedProgress = Math.min(100, Math.max(0, progress));

    return (
        <div className="w-full">
            {label && (
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    {showPercentage && (
                        <span className="text-sm font-medium text-gray-700">{Math.round(normalizedProgress)}%</span>
                    )}
                </div>
            )}
            <div className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden`}>
                <div
                    className={`${color} ${height} rounded-full transition-all duration-300 ease-out`}
                    style={{ width: `${normalizedProgress}%` }}
                    role="progressbar"
                    aria-valuenow={normalizedProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
        </div>
    );
}
