export function EmptyState({
    icon,
    title,
    description,
    actionButton,
    type = "default",
}: {
    icon?: React.ReactNode;
    title: string;
    description: string;
    actionButton?: React.ReactNode;
    type?: "default" | "cart" | "orders" | "search" | "upload";
}) {
    // Estilos base
    let containerClasses = "text-center py-16 px-4";

    // Estilos específicos por tipo
    if (type === "cart") {
        containerClasses += " bg-white rounded-lg shadow-sm";
    }

    return (
        <div className={containerClasses}>
            {icon && (
                <div className="mx-auto h-24 w-24 flex items-center justify-center bg-gray-100 rounded-full mb-6">
                    {icon}
                </div>
            )}
            <h3 className="text-xl font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">{description}</p>
            {actionButton && (
                <div className="mt-2">{actionButton}</div>
            )}
        </div>
    );
}