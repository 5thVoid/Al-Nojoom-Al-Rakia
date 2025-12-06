"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ArrowLeft } from "lucide-react"
import { useCart } from "@/hooks/useCart"

interface Product {
    id: number
    name: string
    price: string
    stockStatusOverride: string | null
    quantity: number
    stockLabel: string
    isPurchasable: boolean
    manufacturer?: { id: number, name: string }
    category?: { id: number, name: string }
    productType?: { id: number, name: string }
}

export default function SearchPage() {
    const searchParams = useSearchParams()
    const query = searchParams.get('q') || ''
    const router = useRouter()
    const t = useTranslations('Search')
    const tProducts = useTranslations('Products')
    const { addToCart, isAdding } = useCart()

    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            if (!query || query.length < 2) {
                setProducts([])
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            try {
                const response = await fetch(`/api/products?page=1&limit=50&search=${encodeURIComponent(query)}`)
                const data = await response.json()
                setProducts(data.data || [])
            } catch (error) {
                console.error('Search failed:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProducts()
    }, [query])

    const getStockBadgeColor = (stockLabel: string) => {
        switch (stockLabel) {
            case 'in_stock':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            case 'low_stock':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            case 'out_of_stock':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            case 'pre_order':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }
    }

    const getStockLabel = (stockLabel: string) => {
        const labels: Record<string, string> = {
            in_stock: tProducts('inStock'),
            low_stock: tProducts('lowStock'),
            out_of_stock: tProducts('outOfStock'),
            pre_order: tProducts('preOrder')
        }
        return labels[stockLabel] || stockLabel
    }

    if (isLoading) {
        return (
            <div className="container max-w-screen-2xl py-8 px-28">
                <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-64 bg-muted rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container max-w-screen-2xl py-8 px-28">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6">
                <ArrowLeft className="h-4 w-4 me-2" />
                {t('back')}
            </Button>

            <h1 className="text-3xl font-bold tracking-tight mb-2">
                {t('title')}
            </h1>
            <p className="text-muted-foreground mb-8">
                {t('resultsFor', { query })} ({products.length})
            </p>

            {products.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">{t('noResults')}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                        <Card
                            key={product.id}
                            className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => router.push(`/products/${product.id}`)}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-lg line-clamp-2">
                                        {product.name}
                                    </CardTitle>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStockBadgeColor(
                                            product.stockLabel
                                        )}`}
                                    >
                                        {getStockLabel(product.stockLabel)}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="text-2xl font-bold text-primary">
                                    ${product.price}
                                </div>

                                {/* Product metadata */}
                                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                                    {product.manufacturer && (
                                        <div className="flex items-center gap-1">
                                            <span>{tProducts('manufacturer')} : </span>
                                            <span className="font-semibold">{product.manufacturer.name}</span>
                                        </div>
                                    )}
                                    {product.category && (
                                        <div className="flex items-center gap-1">
                                            <span>{tProducts('category')} : </span>
                                            <span className="font-semibold">{product.category.name}</span>
                                        </div>
                                    )}
                                    {product.productType && (
                                        <div className="flex items-center gap-1">
                                            <span>{tProducts('productType')} : </span>
                                            <span className="font-semibold">{product.productType.name}</span>
                                        </div>
                                    )}
                                </div>

                                {product.quantity > 0 && product.quantity <= 5 && (
                                    <CardDescription className="mt-2">
                                        {tProducts('onlyLeft', { count: product.quantity })}
                                    </CardDescription>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    disabled={!product.isPurchasable || isAdding}
                                    variant={product.isPurchasable ? "default" : "secondary"}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (product.isPurchasable) {
                                            addToCart(product.id)
                                        }
                                    }}
                                >
                                    <ShoppingCart className="h-4 w-4 me-2" />
                                    {product.isPurchasable ? tProducts('addToCart') : tProducts('unavailable')}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
