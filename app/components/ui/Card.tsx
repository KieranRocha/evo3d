/**
 * Card padronizado para conteúdo, com variações
 */
export function Card({
    children,
    className = "",
    variant = "default",
    hover = false,
    onClick,
}: {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "outlined" | "elevated" | "interactive";
    hover?: boolean;
    onClick?: () => void;
}) {
    // Variantes de estilo para o card
    const variants = {
        default: "bg-white rounded-lg p-4",
        outlined: "bg-white rounded-lg p-4 border border-gray-200",
        elevated: "bg-white rounded-lg p-4 shadow-md",
        interactive: "bg-white rounded-lg p-4 border border-gray-200 cursor-pointer",
    };

    // Efeito hover
    const hoverEffect = hover ? "transition-all duration-200 hover:shadow-md" : "";

    return (
        <div
            className={`${variants[variant]} ${hoverEffect} ${className}`}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {children}
        </div>
    );
}