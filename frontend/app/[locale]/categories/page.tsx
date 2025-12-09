"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProductCardCompact, Product } from "@/components/products/ProductCard"
import { CategoriesGrid, Category } from "@/components/products/CategoriesGrid"
import { ProductsGridSkeleton } from "@/components/products/ProductFilters"
import { Link } from "@/i18n/navigation"
import { Grid3X3 } from "lucide-react"

interface ProductsResponse {
    data: Product[]
    meta: {
        totalItems: number
        itemsPerPage: number
        totalPages: number
        currentPage: number
    }
}

interface CategoriesResponse {
    data: Category[]
    meta: {
        totalItems: number
        itemsPerPage: number
        totalPages: number
        currentPage: number
    }
}

export default function CategoriesPage() {
    const t = useTranslations('CategoriesPage')

    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [isLoadingCategories, setIsLoadingCategories] = useState(true)
    const [isLoadingProducts, setIsLoadingProducts] = useState(false)

    // Get selected category object
    const selectedCategory = categories.find(c => c.id === selectedCategoryId) || null

    // Fetch all categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/categories?limit=50')
                const data: CategoriesResponse = await response.json()
                setCategories(data.data || [])

                // Auto-select first category
                if (data.data && data.data.length > 0) {
                    setSelectedCategoryId(data.data[0].id)
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error)
            } finally {
                setIsLoadingCategories(false)
            }
        }

        fetchCategories()
    }, [])

    // Fetch products when category is selected
    useEffect(() => {
        if (!selectedCategoryId) return

        const fetchProducts = async () => {
            setIsLoadingProducts(true)
            try {
                const response = await fetch(
                    `/api/products?page=1&limit=12&categoryId=${selectedCategoryId}`
                )
                const data: ProductsResponse = await response.json()
                setProducts(data.data || [])
            } catch (error) {
                console.error('Failed to fetch products:', error)
            } finally {
                setIsLoadingProducts(false)
            }
        }

        fetchProducts()
    }, [selectedCategoryId])

    return (
        <div className="max-w-screen-2xl mx-auto py-8 px-4 md:px-8">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Grid3X3 className="h-8 w-8" />
                    {t('title')}
                </h1>
                <p className="text-muted-foreground mt-2">{t('description')}</p>
            </div>

            {/* Categories Grid */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">{t('allCategories')}</h2>
                <CategoriesGrid
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onSelectCategory={setSelectedCategoryId}
                    isLoading={isLoadingCategories}
                    variant="grid"
                    showParentName={true}
                />
            </div>

            {/* Selected Category Products */}
            {selectedCategory && (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">
                            {selectedCategory.name}
                        </h2>
                        <Badge variant="secondary">
                            {products.length} {t('products')}
                        </Badge>
                    </div>

                    {isLoadingProducts ? (
                        <ProductsGridSkeleton count={6} variant="compact" />
                    ) : products.length === 0 ? (
                        <Card className="bg-background">
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground">{t('noProducts')}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {products.map((product) => (
                                <ProductCardCompact
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    )}

                    {/* View All Link */}
                    {products.length > 0 && (
                        <div className="mt-6 text-center">
                            <Link href={`/products?categoryId=${selectedCategoryId}`}>
                                <Button variant="outline">
                                    {t('viewAllInCategory', { category: selectedCategory.name })}
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
