"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export interface Category {
    id: number
    name: string
    slug: string
    parentId: number | null
}

interface CategoriesGridProps {
    /** List of categories to display */
    categories: Category[]
    /** Currently selected category ID */
    selectedCategoryId: number | null
    /** Callback when a category is selected */
    onSelectCategory: (categoryId: number | null) => void
    /** Whether data is loading */
    isLoading?: boolean
    /** Display variant - grid or carousel */
    variant?: "grid" | "carousel"
    /** Show parent category name for subcategories */
    showParentName?: boolean
    /** Additional class names */
    className?: string
}

export function CategoriesGrid({
    categories,
    selectedCategoryId,
    onSelectCategory,
    isLoading = false,
    variant = "grid",
    showParentName = true,
    className,
}: CategoriesGridProps) {
    // Get parent category name helper
    const getParentName = (parentId: number | null) => {
        if (!parentId) return null
        return categories.find(c => c.id === parentId)?.name
    }

    // Handle category click with toggle behavior
    const handleCategoryClick = (categoryId: number) => {
        if (selectedCategoryId === categoryId) {
            onSelectCategory(null) // Deselect if clicking the same category
        } else {
            onSelectCategory(categoryId)
        }
    }

    if (isLoading) {
        if (variant === "carousel") {
            return (
                <div className={cn("flex gap-4 overflow-hidden", className)}>
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-20 min-w-[150px] rounded-lg flex-shrink-0" />
                    ))}
                </div>
            )
        }
        return (
            <div className={cn("grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3", className)}>
                {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
            </div>
        )
    }

    if (variant === "carousel") {
        return (
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={16}
                slidesPerView={2}
                navigation
                pagination={{ clickable: true }}
                breakpoints={{
                    640: { slidesPerView: 3 },
                    1024: { slidesPerView: 4 },
                    1280: { slidesPerView: 5 },
                    1536: { slidesPerView: 8 },
                }}
                className={cn("pb-12", className)}
            >
                {categories.map(category => (
                    <SwiperSlide key={category.id}>
                        <Card
                            className={cn(
                                "cursor-pointer transition-all hover:shadow-lg duration-300",
                                selectedCategoryId === category.id
                                    ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary"
                                    : "hover:border-primary/50 bg-background"
                            )}
                            onClick={() => handleCategoryClick(category.id)}
                        >
                            <CardContent className="p-6 text-center">
                                <h3 className="font-semibold text-foreground">{category.name}</h3>
                                {showParentName && category.parentId && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {getParentName(category.parentId)}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </SwiperSlide>
                ))}
            </Swiper>
        )
    }

    // Grid variant
    return (
        <div className={cn("grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3", className)}>
            {categories.map((category) => (
                <Card
                    key={category.id}
                    className={cn(
                        "cursor-pointer transition-all hover:border-primary/50 bg-background",
                        selectedCategoryId === category.id &&
                        "ring-2 ring-primary border-primary bg-primary/5"
                    )}
                    onClick={() => handleCategoryClick(category.id)}
                >
                    <CardContent className="p-3 text-center">
                        <p className="text-sm font-medium truncate">
                            {category.name}
                        </p>
                        {showParentName && category.parentId && (
                            <p className="text-xs text-muted-foreground truncate">
                                {getParentName(category.parentId)}
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
