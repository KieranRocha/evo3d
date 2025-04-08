export function Alert({
    title,
    message,
    variant = "info",
    icon,
    onClose,
}: {
    title?: string;
    message: string;
    variant?: "info" | "success" | "warning" | "error";
    icon?: React.ReactNode;
    onClose?: () => void;
}) {
    // Configurações de variantes
    const variantConfig = {
        info: {
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            textColor: "text-blue-800",
            iconColor: "text-blue-400",
        },
        success: {
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            textColor: "text-green-800",
            iconColor: "text-green-400",
        },
        warning: {
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-200",
            textColor: "text-yellow-800",
            iconColor: "text-yellow-400",
        },
        error: {
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
            textColor: "text-red-800",
            iconColor: "text-red-400",
        },
    };

    const config = variantConfig[variant];

    return (
        <div className={`${config.bgColor} ${config.textColor} border ${config.borderColor} p-4 rounded-lg`}>
            <div className="flex">
                {icon && (
                    <div className={`flex-shrink-0 ${config.iconColor} mr-3`}>
                        {icon}
                    </div>
                )}
                <div className="flex-1">
                    {title && (
                        <h3 className="text-sm font-medium mb-1">{title}</h3>
                    )}
                    <div className="text-sm">{message}</div>
                </div>
                {onClose && (
                    <button
                        type="button"
                        className={`ml-auto -mx-1.5 -my-1.5 ${config.bgColor} ${config.textColor} rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-opacity-75`}
                        onClick={onClose}
                        aria-label="Fechar"
                    >
                        <span className="sr-only">Fechar</span>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}