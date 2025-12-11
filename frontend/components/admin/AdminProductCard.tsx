"use client"

import { useTranslations } from "next-intl"
import { Product } from "@/components/products/ProductCard"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "@/i18n/navigation"

interface AdminProductCardProps {
    product: Product
    onDelete?: (productId: number) => void
}

export default function AdminProductCard({ product, onDelete }: AdminProductCardProps) {
    const t = useTranslations("Admin.Products")
    const router = useRouter()

    const handleEdit = () => {
        router.push(`/admin/products/${product.id}/edit`)
    }

    const handleDelete = () => {
        if (onDelete) {
            onDelete(product.id)
        }
    }

    const handleViewDetails = () => {
        router.push(`/admin/products/${product.id}`)
    }

    // Use quantity from API response (stock is the same as quantity)
    const stockQuantity = product.stock ?? product.quantity ?? 0

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div onClick={handleViewDetails}>
                <CardHeader className="p-0">
                    <div className="relative w-full h-48 bg-muted">
                        {product.imageUrl ? (
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                {t("noImage")}
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">SKU: {product.sku}</p>
                    <p className="text-xl font-bold text-primary mb-3">
                        {product.price} {t("currency")}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-3">
                        {product.category && (
                            <Badge variant="secondary" className="text-xs">
                                {product.category.name}
                            </Badge>
                        )}
                        {product.manufacturer && (
                            <Badge variant="outline" className="text-xs">
                                {product.manufacturer.name}
                            </Badge>
                        )}
                        {product.productType && (
                            <Badge variant="default" className="text-xs">
                                {product.productType.name}
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t("stock")}:</span>
                        <Badge variant={stockQuantity > 0 ? "default" : "destructive"}>
                            {stockQuantity > 0 ? `${stockQuantity} ${t("inStock")}` : t("outOfStock")}
                        </Badge>
                    </div>
                </CardContent>
            </div>

            <CardFooter className="p-4 pt-0 flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleEdit}
                >
                    <Pencil className="h-4 w-4 mr-2" />
                    {t("edit")}
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={handleDelete}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t("delete")}
                </Button>
            </CardFooter>
        </Card>
    )
}
