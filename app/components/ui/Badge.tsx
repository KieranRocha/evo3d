export function Badge({
    children,
    variant = "primary",
    size = "md",
    rounded = "full",
}: {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "gray";
    size?: "sm" | "md" | "lg";
    rounded?: "full" | "md";
}) {
    // Variantes de cor
    const variantClasses = {
        primary: "bg-primary-100 text-primary-800",
        secondary: "bg-secondary-100 text-secondary-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        error: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
        gray: "bg-gray-100 text-gray-800",
    };

    // Tamanhos
    const sizeClasses = {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2.5 py-0.5",
        lg: "text-base px-3 py-1",
    };

    // Arredondamento
    const roundedClasses = {
        full: "rounded-full",
        md: "rounded-md",
    };

    return (
        <span className={`
        inline-flex items-center font-medium
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${roundedClasses[rounded]}
      `}>
            {children}
        </span>
    );
}