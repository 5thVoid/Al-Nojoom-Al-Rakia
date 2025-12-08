"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useDebounce } from "@/hooks/useDebounce"
import { Button } from "@/components/ui/button"
import { ProductSearchBar } from "@/components/products/ProductSearchBar"
import { ProductCard, Product } from "@/components/products/ProductCard"
import { CategoriesGrid, Category } from "@/components/products/CategoriesGrid"
import {
    ProductFilters,
    ProductsGridSkeleton,
    AllProductsPageSkeleton,
    Manufacturer,
    ProductType
} from "@/components/products/ProductFilters"
import { Filter, X } from "lucide-react"

interface AllProductsProps {
    /** Initial search query */
    initialSearch?: string
    /** Whether to show the integrated search bar */
    showSearch?: boolean
    /** Custom title for the page */
    title?: string
    /** Whether to show the title */
    showTitle?: boolean
}

export function AllProducts({
    initialSearch = '',
    showSearch = false,
    title,
    showTitle = true
}: AllProductsProps = {}) {
    const t = useTranslations('AllProducts')
    const tPage = useTranslations('ProductsPage')

    const [products, setProducts] = useState<Product[]>([])
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
    const [productTypes, setProductTypes] = useState<ProductType[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Search state with debounce
    const [searchQuery, setSearchQuery] = useState(initialSearch)
    const debouncedSearch = useDebounce(searchQuery, 300)

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

                if (debouncedSearch) params.append('search', debouncedSearch);
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
                    setCategories(categoriesData.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [debouncedSearch, selectedCategory, selectedManufacturers, selectedProductTypes, inStockOnly]);

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
        setSearchQuery('')
    }

    // Client-side price range filtering only (other filters are server-side via API)
    const filteredProducts = products.filter(product => {
        const price = parseFloat(product.price)
        return price >= priceRange[0] && price <= priceRange[1]
    })

    if (isLoading) {
        return <AllProductsPageSkeleton />
    }

    return (
        <div className={`container max-w-screen-2xl py-8 px-4 md:px-8 lg:px-28`}>
            {/* Header Section */}
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex items-center justify-between">
                    {showTitle && (
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {title || t('title')}
                        </h1>
                    )}
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

                {/* Search Bar */}
                {showSearch && (
                    <ProductSearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        className="max-w-2xl"
                    />
                )}

                {/* Active Filters Summary */}
                {(searchQuery || selectedCategory || selectedManufacturers.length > 0 || selectedProductTypes.length > 0 || inStockOnly) && showSearch && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-muted-foreground">{tPage('activeFilters')}:</span>
                        {searchQuery && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setSearchQuery('')}
                                className="h-7 gap-1"
                            >
                                "{searchQuery}"
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                        {selectedCategory && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setSelectedCategory(null)}
                                className="h-7 gap-1"
                            >
                                {categories.find(c => c.id === selectedCategory)?.name}
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                        {selectedManufacturers.map(id => (
                            <Button
                                key={id}
                                variant="secondary"
                                size="sm"
                                onClick={() => toggleManufacturer(id)}
                                className="h-7 gap-1"
                            >
                                {manufacturers.find(m => m.id === id)?.name}
                                <X className="h-3 w-3" />
                            </Button>
                        ))}
                        {selectedProductTypes.map(id => (
                            <Button
                                key={id}
                                variant="secondary"
                                size="sm"
                                onClick={() => toggleProductType(id)}
                                className="h-7 gap-1"
                            >
                                {productTypes.find(p => p.id === id)?.name}
                                <X className="h-3 w-3" />
                            </Button>
                        ))}
                        {inStockOnly && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setInStockOnly(false)}
                                className="h-7 gap-1"
                            >
                                {t('inStockOnly')}
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-7 text-destructive hover:text-destructive"
                        >
                            {tPage('clearAll')}
                        </Button>
                    </div>
                )}
            </div>

            {/* Categories Carousel */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-foreground">{t('categories')}</h2>
                <CategoriesGrid
                    categories={categories}
                    selectedCategoryId={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    variant="carousel"
                    showParentName={true}
                />
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Filters Sidebar */}
                <ProductFilters
                    manufacturers={manufacturers}
                    productTypes={productTypes}
                    selectedManufacturers={selectedManufacturers}
                    selectedProductTypes={selectedProductTypes}
                    priceRange={priceRange}
                    inStockOnly={inStockOnly}
                    onManufacturerToggle={toggleManufacturer}
                    onProductTypeToggle={toggleProductType}
                    onPriceRangeChange={setPriceRange}
                    onInStockOnlyChange={setInStockOnly}
                    onClearFilters={clearFilters}
                    isVisible={showFilters}
                />

                {/* Products Grid */}
                <div className="flex-1">
                    <div className="mb-4 text-sm text-muted-foreground">
                        {t('showing', { count: filteredProducts.length })}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                showMetadata={true}
                                showLowStockWarning={true}
                            />
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
