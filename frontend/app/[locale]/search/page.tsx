"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"
import { ProductCard, Product } from "@/components/products/ProductCard"
import { ProductsGridSkeleton } from "@/components/products/ProductFilters"

export default function SearchPage() {
    const searchParams = useSearchParams()
    const query = searchParams.get('q') || ''
    const router = useRouter()
    const t = useTranslations('Search')

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

    if (isLoading) {
        return (
            <div className="container max-w-screen-2xl py-8 px-28">
                {/* Back button skeleton */}
                <Skeleton className="h-10 w-24 mb-6" />

                {/* Title skeleton */}
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-5 w-48 mb-8" />

                {/* Products grid skeleton */}
                <ProductsGridSkeleton count={6} />
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
                        <ProductCard
                            key={product.id}
                            product={product}
                            showMetadata={true}
                            showLowStockWarning={true}
                            variant="grid"
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
