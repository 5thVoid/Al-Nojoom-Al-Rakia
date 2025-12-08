"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductCard, Product } from "@/components/products/ProductCard"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

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

    if (isLoading) {
        return (
            <section className="bg-muted/10 px-28">
                <div className="container max-w-screen-2xl">
                    <h2 className="text-3xl font-bold tracking-tight text-center my-12 text-foreground">
                        {t('title')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i} className="overflow-hidden">
                                <Skeleton className="aspect-[4/3]" />
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-5 w-16" />
                                    </div>
                                    <Skeleton className="h-6 w-24" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-3 w-32" />
                                        <Skeleton className="h-3 w-28" />
                                    </div>
                                    <Skeleton className="h-10 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="bg-muted/10 px-28">
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
                            <ProductCard
                                product={product}
                                showMetadata={true}
                                showLowStockWarning={true}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    )
}
