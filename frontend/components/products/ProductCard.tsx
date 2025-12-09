"use client"

import { useTranslations } from "next-intl"
import { useCart } from "@/hooks/useCart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/navigation"
import { ShoppingCart, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Product {
    id: number
    name: string
    sku?: string
    price: string
    stockStatusOverride?: string | null
    quantity: number
    stockLabel: string
    isPurchasable: boolean
    manufacturerId?: number
    categoryId?: number
    productTypeId?: number
    manufacturer?: {
        id: number
        name: string
    }
    category?: {
        id: number
        name: string
    }
    productType?: {
        id: number
        name: string
    }
}

interface ProductCardProps {
    product: Product
    /** Variant of the card layout */
    variant?: "default" | "compact" | "grid"
    /** Whether to show the product image placeholder */
    showImage?: boolean
    /** Whether clicking the card navigates to product page */
    clickable?: boolean
    /** Additional class names */
    className?: string
    /** Whether to show low stock warning */
    showLowStockWarning?: boolean
    /** Whether to show metadata (manufacturer, category, type) */
    showMetadata?: boolean
}

export function ProductCard({
    product,
    variant = "default",
    showImage = false,
    clickable = true,
    className,
    showLowStockWarning = true,
    showMetadata = true,
}: ProductCardProps) {
    const t = useTranslations('Products')
    const { addToCart, isAdding } = useCart()

    const getStockBadgeColor = (stockLabel: string) => {
        switch (stockLabel) {
            case 'in_stock':
                return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'low_stock':
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            case 'out_of_stock':
                return 'bg-red-500/10 text-red-500 border-red-500/20'
            case 'pre_order':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            default:
                return 'bg-muted text-muted-foreground'
        }
    }

    const getStockLabel = (stockLabel: string) => {
        const labels: Record<string, string> = {
            in_stock: t('inStock'),
            low_stock: t('lowStock'),
            out_of_stock: t('outOfStock'),
            pre_order: t('preOrder')
        }
        return labels[stockLabel] || stockLabel
    }

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (product.isPurchasable) {
            addToCart(product.id)
        }
    }

    const cardContent = (
        <>
            {showImage && (
                <div className="aspect-square bg-muted flex items-center justify-center">
                    <span className="text-4xl text-muted-foreground/50">📦</span>
                </div>
            )}
            <CardHeader className={variant === "compact" ? "p-4" : ""}>
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className={cn(
                        "line-clamp-2",
                        variant === "compact" ? "text-sm" : "text-lg"
                    )}>
                        {product.name}
                    </CardTitle>
                    <span
                        className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap border",
                            getStockBadgeColor(product.stockLabel)
                        )}
                    >
                        {getStockLabel(product.stockLabel)}
                    </span>
                </div>
            </CardHeader>
            <CardContent className={cn("flex-1", variant === "compact" ? "p-4 pt-0" : "")}>
                <div className={cn(
                    "font-bold text-primary",
                    variant === "compact" ? "text-lg" : "text-2xl"
                )}>
                    SAR {parseFloat(product.price).toFixed(2)}
                </div>

                {/* Product metadata */}
                {showMetadata && (
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                        {product.manufacturer && (
                            <div className="flex items-center gap-1">
                                <span>{t('manufacturer')}:</span>
                                <span className="font-semibold">{product.manufacturer.name}</span>
                            </div>
                        )}
                        {product.category && (
                            <div className="flex items-center gap-1">
                                <span>{t('category')}:</span>
                                <span className="font-semibold">{product.category.name}</span>
                            </div>
                        )}
                        {product.productType && (
                            <div className="flex items-center gap-1">
                                <span>{t('productType')}:</span>
                                <span className="font-semibold">{product.productType.name}</span>
                            </div>
                        )}
                    </div>
                )}

                {showLowStockWarning && product.quantity > 0 && product.quantity <= 5 && (
                    <CardDescription className="mt-2">
                        {t('onlyLeft', { count: product.quantity })}
                    </CardDescription>
                )}
            </CardContent>
            <CardFooter className={variant === "compact" ? "p-4 pt-0" : ""}>
                <Button
                    className="w-full"
                    size={variant === "compact" ? "sm" : "default"}
                    disabled={!product.isPurchasable || isAdding}
                    variant={product.isPurchasable ? "default" : "secondary"}
                    onClick={handleAddToCart}
                >
                    {isAdding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <ShoppingCart className="h-4 w-4 me-2" />
                            {product.isPurchasable ? t('addToCart') : t('unavailable')}
                        </>
                    )}
                </Button>
            </CardFooter>
        </>
    )

    const cardClasses = cn(
        "flex flex-col bg-card hover:shadow-lg transition-shadow duration-300",
        clickable && "cursor-pointer",
        className
    )

    if (clickable) {
        return (
            <Link href={`/products/${product.id}`}>
                <Card className={cn(cardClasses, "h-full")}>
                    {cardContent}
                </Card>
            </Link>
        )
    }

    return (
        <Card className={cn(cardClasses, "h-full")}>
            {cardContent}
        </Card>
    )
}

// Compact variant for grid displays with image
export function ProductCardCompact({
    product,
    className,
}: {
    product: Product
    className?: string
}) {
    const t = useTranslations('Products')
    const { addToCart, isAdding } = useCart()

    const getStockBadgeColor = (stockLabel: string) => {
        switch (stockLabel) {
            case 'in_stock':
                return 'bg-green-500/10 text-green-500 border-green-500/20'
            case 'low_stock':
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            case 'out_of_stock':
                return 'bg-red-500/10 text-red-500 border-red-500/20'
            case 'pre_order':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            default:
                return 'bg-muted text-muted-foreground'
        }
    }

    const getStockLabel = (stockLabel: string) => {
        const labels: Record<string, string> = {
            in_stock: t('inStock'),
            low_stock: t('lowStock'),
            out_of_stock: t('outOfStock'),
            pre_order: t('preOrder')
        }
        return labels[stockLabel] || stockLabel
    }

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (product.isPurchasable) {
            addToCart(product.id)
        }
    }

    return (
        <Card className={cn(
            "group overflow-hidden bg-card hover:shadow-lg transition-shadow",
            className
        )}>
            <Link href={`/products/${product.id}`}>
                <div className="aspect-square bg-muted flex items-center justify-center">
                    <span className="text-4xl text-muted-foreground/50">📦</span>
                </div>
            </Link>
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                        {product.manufacturer?.name}
                    </Badge>
                    <span
                        className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            getStockBadgeColor(product.stockLabel)
                        )}
                    >
                        {getStockLabel(product.stockLabel)}
                    </span>
                </div>
                <Link href={`/products/${product.id}`}>
                    <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors mb-2">
                        {product.name}
                    </h3>
                </Link>
                <p className="text-xs text-muted-foreground mb-2">
                    {product.productType?.name}
                </p>
                <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">
                        SAR {parseFloat(product.price).toFixed(2)}
                    </span>
                </div>
                <Button
                    size="sm"
                    className="w-full mt-3"
                    disabled={!product.isPurchasable || isAdding}
                    onClick={handleAddToCart}
                >
                    {isAdding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {t('addToCart')}
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
