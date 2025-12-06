"use client"

import { useEffect, useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useCart } from "@/hooks/useCart"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ShoppingCart, Filter, X } from "lucide-react"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'

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
}

interface Manufacturer {
    id: number
    name: string
    logoUrl: string
}

interface ProductType {
    id: number
    name: string
    allowedAttributes: string[]
}

interface Category {
    id: number
    name: string
    slug: string
    parentId: number | null
    subcategories?: Category[]
}

export function AllProducts() {
    const t = useTranslations('AllProducts')
    const tProducts = useTranslations('Products')
    const router = useRouter()
    const { addToCart, isAdding } = useCart()

    const [products, setProducts] = useState<Product[]>([])
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
    const [productTypes, setProductTypes] = useState<ProductType[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Filter states
    const [selectedManufacturers, setSelectedManufacturers] = useState<number[]>([])
    const [selectedProductTypes, setSelectedProductTypes] = useState<number[]>([])
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000])
    const [showFilters, setShowFilters] = useState(true)
    const [inStockOnly, setInStockOnly] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Build query parameters for products
                const params = new URLSearchParams({
                    page: '1',
                    limit: '50',
                });

                if (selectedCategory) params.append('categoryId', selectedCategory.toString());
                selectedManufacturers.forEach(id => params.append('manufacturerId', id.toString()));
                selectedProductTypes.forEach(id => params.append('productTypeId', id.toString()));
                if (inStockOnly) params.append('in_stock', 'true');

                // Fetch products with filters
                const productsRes = await fetch(`/api/products?${params.toString()}`);
                const productsData = await productsRes.json();
                setProducts(productsData.data || []);

                // Only fetch filter options on initial load
                if (manufacturers.length === 0) {
                    const [manufacturersRes, productTypesRes, categoriesRes] = await Promise.all([
                        fetch('/api/manufacturers?page=1&limit=50'),
                        fetch('/api/productTypes'),
                        fetch('/api/categories')
                    ]);

                    const manufacturersData = await manufacturersRes.json();
                    const productTypesData = await productTypesRes.json();
                    const categoriesData = await categoriesRes.json();

                    setManufacturers(manufacturersData.data || []);
                    setProductTypes(productTypesData.data || []);
                    setCategories(categoriesData || []);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedCategory, selectedManufacturers, selectedProductTypes, inStockOnly]);

    const toggleManufacturer = (id: number) => {
        setSelectedManufacturers(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        )
    }

    const toggleProductType = (id: number) => {
        setSelectedProductTypes(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        )
    }

    const clearFilters = () => {
        setSelectedManufacturers([])
        setSelectedProductTypes([])
        setSelectedCategory(null)
        setPriceRange([0, 5000])
        setInStockOnly(false)
    }

    // Client-side price range filtering only (other filters are server-side via API)
    const filteredProducts = products.filter(product => {
        const price = parseFloat(product.price)
        return price >= priceRange[0] && price <= priceRange[1]
    })

    const renderCategories = (cats: Category[], level = 0) => {
        return cats.map(cat => (
            <div key={cat.id} className={`${level > 0 ? 'ms-4' : ''}`}>
                <Button
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                    className="mb-2 w-full justify-start"
                >
                    {cat.name}
                </Button>
                {cat.subcategories && cat.subcategories.length > 0 && renderCategories(cat.subcategories, level + 1)}
            </div>
        ))
    }

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
            <div className="container max-w-screen-2xl py-8 px-4">
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
        <div className={`container max-w-screen-2xl py-8 px-28`}>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {t('title')}
                </h1>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="md:hidden"
                >
                    <Filter className="h-4 w-4 me-2" />
                    {showFilters ? t('hideFilters') : t('showFilters')}
                </Button>
            </div>

            {/* Categories Carousel */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-foreground">{t('categories')}</h2>
                <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={16}
                    slidesPerView={2}
                    navigation
                    pagination={{ clickable: true }}
                    breakpoints={{
                        640: {
                            slidesPerView: 3,
                        },
                        1024: {
                            slidesPerView: 4,
                        },
                        1280: {
                            slidesPerView: 5,
                        },
                        1536: {
                            slidesPerView: 8,
                        },
                    }}
                    className="pb-12"
                >
                    {categories.map(cat => (
                        <SwiperSlide key={cat.id}>
                            <Card
                                className={`cursor-pointer transition-all hover:shadow-lg duration-500 ${selectedCategory === cat.id
                                    ? 'border-primary bg-primary/5 shadow-md'
                                    : 'hover:border-primary/50'
                                    }`}
                                onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                            >
                                <CardContent className="p-6 text-center">
                                    <h3 className="font-semibold text-foreground">{cat.name}</h3>
                                    {cat.subcategories && cat.subcategories.length > 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {cat.subcategories.length} subcategories
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Filters Sidebar */}
                <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 space-y-6`}>
                    <Card className="my-9">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">{t('filters')}</CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
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
                                    onValueChange={(value) => setPriceRange(value as [number, number])}
                                    className="w-full"
                                />
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>${priceRange[0]}</span>
                                    <span>${priceRange[1]}</span>
                                </div>
                            </div>

                            {/* Manufacturers */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold">{t('manufacturers')}</Label>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {manufacturers.map(manufacturer => (
                                        <div key={manufacturer.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`manufacturer-${manufacturer.id}`}
                                                checked={selectedManufacturers.includes(manufacturer.id)}
                                                onCheckedChange={() => toggleManufacturer(manufacturer.id)}
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

                            {/* Product Types */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold">{t('productTypes')}</Label>
                                <div className="space-y-2">
                                    {productTypes.map(type => (
                                        <div key={type.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`type-${type.id}`}
                                                checked={selectedProductTypes.includes(type.id)}
                                                onCheckedChange={() => toggleProductType(type.id)}
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

                            {/* In Stock Only */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="in-stock-only"
                                        checked={inStockOnly}
                                        onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
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

                {/* Products Grid */}
                <div className="flex-1">
                    <div className="mb-4 text-sm text-muted-foreground">
                        {t('showing', { count: filteredProducts.length })}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map(product => (
                            <Card
                                key={product.id}
                                className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer duration-500"
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

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">{t('noProducts')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
