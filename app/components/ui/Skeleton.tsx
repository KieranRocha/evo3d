/**
 * Componente de Skeleton para diferentes tipos de dados
 */
export function Skeleton({
    type = "rect",
    width,
    height,
    className = "",
}: {
    type?: "rect" | "circle" | "text" | "button";
    width?: string | number;
    height?: string | number;
    className?: string;
}) {
    let baseClasses = "animate-pulse bg-gray-200";

    switch (type) {
        case "circle":
            baseClasses += " rounded-full";
            break;
        case "text":
            baseClasses += " rounded h-4 w-3/4";
            break;
        case "button":
            baseClasses += " rounded-lg h-10 w-32";
            break;
        default:
            baseClasses += " rounded";
    }

    return (
        <div
            className={`${baseClasses} ${className}`}
            style={{
                width: width || "auto",
                height: height || (type === "text" ? "1rem" : "auto")
            }}
        />
    );
}
