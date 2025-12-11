"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useCart } from "@/hooks/useCart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingCart, ArrowLeft, Package, Tag, Layers } from "lucide-react"
import Image from "next/image"

interface ProductDetails {
    id: number
    name: string
    sku: string
    price: string
    specs: Record<string, string>
    stockStatusOverride: string | null
    manufacturerId: number
    categoryId: number
    productTypeId: number
    imageUrl?: string | null
}

interface Manufacturer {
    id: number
    name: string
    logoUrl: string
}

interface Category {
    id: number
    name: string
    slug: string
}

interface ProductType {
    id: number
    name: string
}

export default function ProductPage() {
    const params = useParams()
    const router = useRouter()
    const t = useTranslations('ProductPage')
    const tProducts = useTranslations('Products')
    const { addToCart, isAdding } = useCart()

    const [product, setProduct] = useState<ProductDetails | null>(null)
    const [manufacturer, setManufacturer] = useState<Manufacturer | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const productRes = await fetch(`/api/products/${params.id}`)

                if (!productRes.ok) {
                    throw new Error('Product not found')
                }

                const productData = await productRes.json()
                setProduct(productData)

                // Fetch manufacturer details if available
                if (productData.manufacturerId) {
                    const manufacturersRes = await fetch('/api/manufacturers?page=1&limit=50')
                    const manufacturersData = await manufacturersRes.json()
                    const foundManufacturer = manufacturersData.data?.find(
                        (m: Manufacturer) => m.id === productData.manufacturerId
                    )
                    if (foundManufacturer) {
                        setManufacturer(foundManufacturer)
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load product')
            } finally {
                setIsLoading(false)
            }
        }

        if (params.id) {
            fetchProductDetails()
        }
    }, [params.id])

    if (isLoading) {
        return (
            <div className="container max-w-screen-xl py-8 px-4 md:px-28">
                {/* Back button skeleton */}
                <Skeleton className="h-10 w-24 mb-6" />

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Image skeleton */}
                    <Card className="overflow-hidden">
                        <Skeleton className="aspect-square" />
                    </Card>

                    {/* Details skeleton */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-9 w-3/4" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    <Skeleton className="h-6 w-20" />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Skeleton className="h-10 w-32" />
                                <Separator />
                                <div className="space-y-3">
                                    <Skeleton className="h-5 w-28" />
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex justify-between">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-11 w-full" />
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !product) {
        return (
            <div className="container max-w-screen-xl py-8 px-4">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="h-4 w-4 me-2" />
                    {t('back')}
                </Button>
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">{error || t('notFound')}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container max-w-screen-xl py-8 px-4 md:px-28">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6">
                <ArrowLeft className="h-4 w-4 me-2" />
                {t('back')}
            </Button>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Product Image Card */}
                <Card className="overflow-hidden bg-background">
                    <CardContent className="p-0">
                        <div className="relative aspect-square flex items-center justify-center">
                            {product.imageUrl ? (
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-contain p-8"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                            ) : (
                                <Package className="h-32 w-32 text-muted-foreground/20" />
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Product Details Card */}
                <div className="space-y-6">
                    <Card className="bg-background">
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <CardTitle className="text-3xl">{product.name}</CardTitle>
                                    <CardDescription className="flex items-center gap-2">
                                        <Tag className="h-4 w-4" />
                                        {t('sku')}: {product.sku}
                                    </CardDescription>
                                </div>
                                {manufacturer && (
                                    <Badge variant="outline" className="text-sm">
                                        {manufacturer.name}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <div className="text-4xl font-bold text-primary">
                                    ${product.price}
                                </div>
                            </div>

                            <Separator />

                            {/* Specifications */}
                            {product.specs && Object.keys(product.specs).length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Layers className="h-4 w-4" />
                                        {t('specifications')}
                                    </h3>
                                    <div className="space-y-2">
                                        {Object.entries(product.specs).map(([key, value]) => (
                                            <div key={key} className="flex justify-between text-sm">
                                                <span className="text-muted-foreground capitalize">
                                                    {key.replace(/_/g, ' ')}:
                                                </span>
                                                <span className="font-medium">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex gap-3">
                            <Button
                                className="flex-1"
                                size="lg"
                                disabled={isAdding}
                                onClick={() => addToCart(product.id)}
                            >
                                <ShoppingCart className="h-5 w-5 me-2" />
                                {tProducts('addToCart')}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Additional Info Card */}
                    <Card className="bg-background">
                        <CardHeader>
                            <CardTitle className="text-lg">{t('productInfo')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('productId')}:</span>
                                <span className="font-medium">#{product.id}</span>
                            </div>
                            {manufacturer && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('manufacturer')}:</span>
                                    <span className="font-medium">{manufacturer.name}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('category')}:</span>
                                <span className="font-medium">{t('categoryId')} #{product.categoryId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('productType')}:</span>
                                <span className="font-medium">{t('typeId')} #{product.productTypeId}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
