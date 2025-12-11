"use client"

import { useTranslations } from "next-intl"
import { useCart } from "@/hooks/useCart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "@/i18n/navigation"
import { ShoppingCart, Loader2, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { cva, type VariantProps } from "class-variance-authority"

const productCardVariants = cva(
    "flex bg-card group overflow-hidden transition-all duration-300 hover:shadow-lg",
    {
        variants: {
            variant: {
                default: "flex-col h-full",
                horizontal: "flex-row w-full h-[180px]",
                compact: "flex-col h-full text-sm",
                featured: "flex-col h-full text-sm",
            },
            clickable: {
                true: "cursor-pointer",
                false: "",
            }
        },
        defaultVariants: {
            variant: "default",
            clickable: true,
        },
    }
)

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
    // Admin-specific fields
    imageUrl?: string
    stock?: number
    specs?: string | Record<string, any>
}

interface ProductCardProps {
    product: Product
    /** Whether to show the product image placeholder */
    showImage?: boolean
    /** Whether clicking the card navigates to product page */
    clickable?: boolean
    /** Additional class names */
    className?: string
    /** Whether to show low stock warning (User mode) */
    showLowStockWarning?: boolean
    /** Whether to show metadata (manufacturer, category, type) */
    showMetadata?: boolean

    // New Props for Unified Card
    /** Admin mode: enables edit/delete actions, shows SKU and stock count */
    isAdmin?: boolean
    /** Shows "Best Seller" badge */
    isBestSeller?: boolean
    /** Shows "New" badge */
    isJustAdded?: boolean
    /** Callback for delete action (Admin mode) */
    onDelete?: (id: number) => void
    /** Layout variant */
    variant?: VariantProps<typeof productCardVariants>["variant"]
}

export function ProductCard({
    product,
    showImage = true,
    clickable = true,
    className,
    showLowStockWarning = true,
    showMetadata = true,
    isAdmin = false,
    isBestSeller = false,
    isJustAdded = false,
    onDelete,
    variant = "default"
}: ProductCardProps) {
    const t = useTranslations('Products')
    const tCommon = useTranslations('Common')
    const tAdmin = useTranslations('Admin.Products')
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

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (onDelete) {
            onDelete(product.id)
        }
    }

    const stockQuantity = product.stock ?? product.quantity ?? 0

    // Styles for sub-elements based on variant
    const imageContainerClasses = cn(
        "bg-muted flex items-center justify-center relative overflow-hidden",
        variant === "horizontal" ? "w-[180px] h-full shrink-0" : "aspect-square w-full",
        (variant === "compact" || variant === "featured") && "aspect-square"
    )

    const contentContainerClasses = cn(
        "flex flex-1 flex-col p-4",
        variant === "horizontal" && "justify-between",
        variant === "compact" && "p-3",
        variant === "featured" && "p-2"
    )

    const badgeContainerClasses = cn(
        "absolute flex z-10",
        variant === "horizontal" ? "top-2 left-2 flex-col gap-1" : "top-2 left-2 flex-col gap-1"
    )

    const cardContent = (
        <>
            {showImage && (
                <div className={imageContainerClasses}>
                    {product.imageUrl ? (
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className={cn(
                                "object-contain p-2 transition-transform duration-300 group-hover:scale-105",
                            )}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <span className="text-4xl text-muted-foreground/50">📦</span>
                    )}

                    {/* Floating Badges */}
                    <div className={badgeContainerClasses}>
                        {isBestSeller && (
                            <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-sm text-[10px] px-1.5 h-5">
                                Best Seller
                            </Badge>
                        )}
                        {isJustAdded && (
                            <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-none shadow-sm text-[10px] px-1.5 h-5">
                                New
                            </Badge>
                        )}
                    </div>
                </div>
            )}

            <div className={contentContainerClasses}>
                <div className="flex flex-col gap-1">
                    <CardHeader className="p-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                            <CardTitle className={cn(
                                "font-semibold line-clamp-2",
                                variant === "horizontal" ? "text-lg" : "text-base",
                                (variant === "compact" || variant === "featured") && "text-sm"
                            )}>
                                {product.name}
                            </CardTitle>
                        </div>
                        {/* Admin SKU */}
                        {isAdmin && product.sku && (
                            <p className="text-xs text-muted-foreground font-mono">
                                SKU: {product.sku}
                            </p>
                        )}
                    </CardHeader>

                    {/* Product metadata */}
                    {showMetadata && variant !== "compact" && variant !== "featured" && (
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 mt-1">
                            {product.manufacturer && (
                                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                                    {product.manufacturer.name}
                                </span>
                            )}
                            {product.productType && (
                                <span className="inline-flex items-center gap-1">
                                    • {product.productType.name}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className={cn("mt-auto flex flex-col gap-3", variant === "horizontal" && "flex-row items-end justify-between")}>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="font-bold text-lg text-primary">
                                {tCommon('currency')} {parseFloat(product.price).toFixed(2)}
                            </div>

                            {/* Stock Status Badge */}
                            {isAdmin ? (
                                <Badge variant={stockQuantity > 0 ? "default" : "destructive"} className="h-fit">
                                    {stockQuantity > 0 ? `${stockQuantity} ${t('inStock')}` : t('outOfStock')}
                                </Badge>
                            ) : (
                                <span
                                    className={cn(
                                        "px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap border",
                                        getStockBadgeColor(product.stockLabel)
                                    )}
                                >
                                    {getStockLabel(product.stockLabel)}
                                </span>
                            )}
                        </div>

                        {/* Low Stock Warning (User only) */}
                        {!isAdmin && showLowStockWarning && product.quantity > 0 && product.quantity <= 5 && (
                            <CardDescription className="text-xs text-orange-600">
                                {t('onlyLeft', { count: product.quantity })}
                            </CardDescription>
                        )}
                    </div>

                    <CardFooter className="p-0 pt-0 gap-2 min-w-[120px]">
                        {isAdmin ? (
                            <div className="flex gap-2 w-full">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    asChild
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Link href={`/admin/products/${product.id}/edit`}>
                                        <Pencil className="h-4 w-4 mr-2" />
                                        {tAdmin('edit')}
                                    </Link>
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="flex-1"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {tAdmin('delete')}
                                </Button>
                            </div>
                        ) : (
                            <Button
                                className="w-full"
                                size="sm"
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
                        )}
                    </CardFooter>
                </div>
            </div>
        </>
    )

    // For admin mode, don't wrap in Link to avoid nested <a> tags
    // The edit button has its own Link
    if (clickable && !isAdmin) {
        // User mode: card links to product details
        return (
            <Link href={`/products/${product.id}`} className="block h-full">
                <div className={productCardVariants({ variant, clickable, className })}>
                    {cardContent}
                </div>
            </Link>
        )
    }

    return (
        <div className={productCardVariants({ variant, clickable: isAdmin ? false : clickable, className })}>
            {cardContent}
        </div>
    )
}
