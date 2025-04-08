import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Check } from 'lucide-react';

/**
 * Card de produto padronizado com skeleton e estados
 */
export function ProductCard({
    product,
    onAddToCart,
    isInCart = false,
    isLoading = false,
}: {
    product?: {
        id: string;
        name: string;
        price: number;
        imageUrl?: string;
        description?: string;
    };
    onAddToCart?: (productId: string) => void;
    isInCart?: boolean;
    isLoading?: boolean;
}) {
    // Se estiver carregando, mostrar skeleton
    if (isLoading || !product) {
        return (
            <div className="bg-white p-4 rounded-lg shadow animate-pulse">
                <div className="bg-gray-200 h-40 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded mb-4 w-1/2"></div>
                <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-200 rounded-lg w-1/4"></div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
        >
            <div className="relative h-40 mb-4 bg-gray-100 rounded-md overflow-hidden">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Sem imagem
                    </div>
                )}
            </div>

            <h3 className="font-medium text-gray-800 mb-1 line-clamp-1" title={product.name}>
                {product.name}
            </h3>

            {product.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2" title={product.description}>
                    {product.description}
                </p>
            )}

            <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-primary">
                    R$ {product.price.toFixed(2)}
                </span>

                <motion.button
                    onClick={() => onAddToCart?.(product.id)}
                    className={`p-2 rounded-full ${isInCart
                            ? "bg-green-100 text-green-600"
                            : "bg-primary text-white hover:bg-primary-hover"
                        }`}
                    whileTap={{ scale: 0.95 }}
                    disabled={isInCart}
                >
                    {isInCart ? <Check size={18} /> : <ShoppingCart size={18} />}
                </motion.button>
            </div>
        </motion.div>
    );
}