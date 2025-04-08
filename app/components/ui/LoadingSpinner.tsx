/**
 * Componente de spinner de carregamento em diferentes tamanhos
 */
export function LoadingSpinner({ size = "md", className = "" }: {
    size?: "sm" | "md" | "lg";
    className?: string;
}) {
    const sizeConfig = {
        sm: "w-4 h-4 border-2",
        md: "w-8 h-8 border-3",
        lg: "w-12 h-12 border-4",
    };

    return (
        <div
            className={`rounded-full border-primary border-t-transparent animate-spin ${sizeConfig[size]} ${className}`}
            role="status"
            aria-label="Carregando"
        />
    );
}