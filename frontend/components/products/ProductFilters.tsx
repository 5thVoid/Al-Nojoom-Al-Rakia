"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import { X } from "lucide-react"

export interface Manufacturer {
    id: number
    name: string
    logoUrl?: string
}

export interface ProductType {
    id: number
    name: string
    allowedAttributes?: string[]
}

interface ProductFiltersProps {
    /** List of manufacturers for filtering */
    manufacturers: Manufacturer[]
    /** List of product types for filtering */
    productTypes: ProductType[]
    /** Currently selected manufacturer IDs */
    selectedManufacturers: number[]
    /** Currently selected product type IDs */
    selectedProductTypes: number[]
    /** Price range [min, max] */
    priceRange: [number, number]
    /** Whether to show only in-stock items */
    inStockOnly: boolean
    /** Callback when manufacturer selection changes */
    onManufacturerToggle: (id: number) => void
    /** Callback when product type selection changes */
    onProductTypeToggle: (id: number) => void
    /** Callback when price range changes */
    onPriceRangeChange: (value: [number, number]) => void
    /** Callback when in-stock filter changes */
    onInStockOnlyChange: (checked: boolean) => void
    /** Callback to clear all filters */
    onClearFilters: () => void
    /** Whether filters are loading */
    isLoading?: boolean
    /** Whether the sidebar is visible (for mobile) */
    isVisible?: boolean
    /** Additional class names */
    className?: string
}

export function ProductFilters({
    manufacturers,
    productTypes,
    selectedManufacturers,
    selectedProductTypes,
    priceRange,
    inStockOnly,
    onManufacturerToggle,
    onProductTypeToggle,
    onPriceRangeChange,
    onInStockOnlyChange,
    onClearFilters,
    isLoading = false,
    isVisible = true,
    className,
}: ProductFiltersProps) {
    const t = useTranslations('AllProducts')

    if (isLoading) {
        return (
            <aside className={`${isVisible ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-6 ${className}`}>
                <Card className="my-9">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-8 w-16" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Price Range Skeleton */}
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-2 w-full" />
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-10" />
                                <Skeleton className="h-4 w-10" />
                            </div>
                        </div>
                        {/* Manufacturers Skeleton */}
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-28" />
                            <div className="space-y-2">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex items-center space-x-2">
                                        <Skeleton className="h-4 w-4" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Product Types Skeleton */}
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-24" />
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-center space-x-2">
                                        <Skeleton className="h-4 w-4" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </aside>
        )
    }

    return (
        <aside className={`${isVisible ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-6 ${className}`}>
            <Card className="my-9 bg-background">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">{t('filters')}</CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                    >
                        <X className="h-4 w-4 me-2" />
                        {t('clear')}
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Price Range */}
                    <div className="space-y-4">
                        <Label className="text-sm font-semibold">{t('priceRange')}</Label>
                        <Slider
                            min={0}
                            max={5000}
                            step={50}
                            value={priceRange}
                            onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                            className="w-full"
                        />
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>SAR {priceRange[0]}</span>
                            <span>SAR {priceRange[1]}</span>
                        </div>
                    </div>

                    {/* Manufacturers */}
                    {manufacturers.length > 0 && (
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold">{t('manufacturers')}</Label>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {manufacturers.map(manufacturer => (
                                    <div key={manufacturer.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`manufacturer-${manufacturer.id}`}
                                            checked={selectedManufacturers.includes(manufacturer.id)}
                                            onCheckedChange={() => onManufacturerToggle(manufacturer.id)}
                                        />
                                        <Label
                                            htmlFor={`manufacturer-${manufacturer.id}`}
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            {manufacturer.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Product Types */}
                    {productTypes.length > 0 && (
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold">{t('productTypes')}</Label>
                            <div className="space-y-2">
                                {productTypes.map(type => (
                                    <div key={type.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`type-${type.id}`}
                                            checked={selectedProductTypes.includes(type.id)}
                                            onCheckedChange={() => onProductTypeToggle(type.id)}
                                        />
                                        <Label
                                            htmlFor={`type-${type.id}`}
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            {type.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* In Stock Only */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="in-stock-only"
                                checked={inStockOnly}
                                onCheckedChange={(checked) => onInStockOnlyChange(checked as boolean)}
                            />
                            <Label
                                htmlFor="in-stock-only"
                                className="text-sm font-semibold cursor-pointer"
                            >
                                {t('inStockOnly')}
                            </Label>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </aside>
    )
}

// Single product card skeleton
export function ProductCardSkeleton() {
    return (
        <Card className="overflow-hidden">
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
                    <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    )
}

// Compact product card skeleton (for grid displays)
export function ProductCardCompactSkeleton() {
    return (
        <Card className="overflow-hidden">
            <Skeleton className="aspect-square" />
            <CardContent className="p-4 space-y-2">
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-full" />
            </CardContent>
        </Card>
    )
}

// Loading skeleton for products grid
export function ProductsGridSkeleton({
    count = 6,
    variant = "default",
    gridClassName
}: {
    count?: number
    variant?: "default" | "compact"
    gridClassName?: string
}) {
    const defaultGridClass = variant === "compact"
        ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

    return (
        <div className={gridClassName || defaultGridClass}>
            {[...Array(count)].map((_, i) => (
                variant === "compact"
                    ? <ProductCardCompactSkeleton key={i} />
                    : <ProductCardSkeleton key={i} />
            ))}
        </div>
    )
}

// Page loading skeleton
export function AllProductsPageSkeleton() {
    return (
        <div className="container max-w-screen-2xl py-8 px-4">
            {/* Title Skeleton */}
            <Skeleton className="h-9 w-48 mb-8" />

            {/* Categories Skeleton */}
            <div className="mb-8">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="flex gap-4 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-20 min-w-[150px] rounded-lg flex-shrink-0" />
                    ))}
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Filters Sidebar Skeleton */}
                <aside className="hidden md:block w-64 space-y-6">
                    <Card className="my-9">
                        <CardHeader>
                            <Skeleton className="h-5 w-16" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </aside>

                {/* Products Grid Skeleton */}
                <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-4" />
                    <ProductsGridSkeleton count={6} />
                </div>
            </div>
        </div>
    )
}
