"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { ShoppingCart } from "lucide-react"

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface Product {
    id: number
    name: string
    price: string
    stockStatusOverride: string | null
    quantity: number
    stockLabel: string
    isPurchasable: boolean
}

interface ProductsResponse {
    data: Product[]
    meta: {
        totalItems: number
        itemsPerPage: number
        totalPages: number
        currentPage: number
    }
}

export function FeaturedProducts() {
    const t = useTranslations('Products')
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products?page=1&limit=10')
                const data: ProductsResponse = await response.json()
                setProducts(data.data)
            } catch (error) {
                console.error('Failed to fetch products:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProducts()
    }, [])

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
            in_stock: t('inStock'),
            low_stock: t('lowStock'),
            out_of_stock: t('outOfStock'),
            pre_order: t('preOrder')
        }
        return labels[stockLabel] || stockLabel
    }

    if (isLoading) {
        return (
            <section>
                <div className="container max-w-screen-2xl">
                    <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
                        {t('title')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardHeader>
                                    <div className="h-6 bg-muted rounded w-3/4"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-4 bg-muted rounded w-1/2"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="bg-muted/30 px-28">
            <div className="container max-w-screen-2xl">
                <h2 className="text-3xl font-bold tracking-tight text-center my-12 text-foreground ml-3">
                    {t('title')}
                </h2>

                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={24}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    breakpoints={{
                        640: {
                            slidesPerView: 1,
                        },
                        1024: {
                            slidesPerView: 2,
                        },
                        1280: {
                            slidesPerView: 3,
                        },
                    }}
                    className="pb-12"
                >
                    {products.map((product) => (
                        <SwiperSlide key={product.id} className="mb-12">
                            <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
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
                                    {product.quantity > 0 && product.quantity <= 5 && (
                                        <CardDescription className="mt-2">
                                            {t('onlyLeft', { count: product.quantity })}
                                        </CardDescription>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full"
                                        disabled={!product.isPurchasable}
                                        variant={product.isPurchasable ? "default" : "secondary"}
                                    >
                                        <ShoppingCart className="h-4 w-4 me-2" />
                                        {product.isPurchasable ? t('addToCart') : t('unavailable')}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    )
}
