"use client"

import * as React from "react"
import { Search, Home, ShoppingBag, User, LogIn, Package, Loader2, ArrowRight, Tag, Building2, Layers } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useDebounce } from "@/hooks/useDebounce"

interface Product {
    id: number
    name: string
    price: string
    manufacturer?: { id: number; name: string }
    category?: { id: number; name: string }
    productType?: { id: number; name: string }
    imageUrl?: string | null
}

interface Category {
    id: number
    name: string
}

interface Manufacturer {
    id: number
    name: string
}

interface ProductType {
    id: number
    name: string
}

interface SearchResults {
    products: Product[]
    categories: Category[]
    manufacturers: Manufacturer[]
    productTypes: ProductType[]
}

export function SearchBar() {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [searchResults, setSearchResults] = React.useState<SearchResults>({
        products: [],
        categories: [],
        manufacturers: [],
        productTypes: []
    })
    const [isSearching, setIsSearching] = React.useState(false)
    const t = useTranslations('Navbar')
    const tCommon = useTranslations('Common')
    const router = useRouter()

    const debouncedSearch = useDebounce(searchQuery, 300)

    const navigationItems = [
        { name: t('home'), path: '/', icon: Home },
        { name: t('products'), path: '/products', icon: ShoppingBag },
        { name: t('profile'), path: '/profile', icon: User },
        { name: t('login'), path: '/auth/login', icon: LogIn },
        { name: t('signup'), path: '/auth/signup', icon: User },
    ]

    // Toggle command menu with Ctrl+S
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    // Search all items when debounced query changes
    React.useEffect(() => {
        const searchAll = async () => {
            if (!debouncedSearch || debouncedSearch.length < 2) {
                setSearchResults({
                    products: [],
                    categories: [],
                    manufacturers: [],
                    productTypes: []
                })
                return
            }

            setIsSearching(true)
            try {
                const searchTerm = encodeURIComponent(debouncedSearch)

                // Fetch all data in parallel
                const [productsRes, categoriesRes, manufacturersRes, productTypesRes] = await Promise.all([
                    fetch(`/api/products?page=1&limit=5&search=${searchTerm}`),
                    fetch(`/api/categories?limit=50`),
                    fetch(`/api/manufacturers?page=1&limit=50`),
                    fetch(`/api/productTypes`)
                ])

                const [productsData, categoriesData, manufacturersData, productTypesData] = await Promise.all([
                    productsRes.json(),
                    categoriesRes.json(),
                    manufacturersRes.json(),
                    productTypesRes.json()
                ])

                // Filter categories, manufacturers, and product types by search query
                const query = debouncedSearch.toLowerCase()
                const filteredCategories = (categoriesData.data || []).filter((cat: Category) =>
                    cat.name.toLowerCase().includes(query)
                ).slice(0, 3)

                const filteredManufacturers = (manufacturersData.data || []).filter((mfr: Manufacturer) =>
                    mfr.name.toLowerCase().includes(query)
                ).slice(0, 3)

                const filteredProductTypes = (productTypesData.data || []).filter((type: ProductType) =>
                    type.name.toLowerCase().includes(query)
                ).slice(0, 3)

                setSearchResults({
                    products: productsData.data || [],
                    categories: filteredCategories,
                    manufacturers: filteredManufacturers,
                    productTypes: filteredProductTypes
                })
            } catch (error) {
                console.error('Search failed:', error)
                setSearchResults({
                    products: [],
                    categories: [],
                    manufacturers: [],
                    productTypes: []
                })
            } finally {
                setIsSearching(false)
            }
        }

        searchAll()
    }, [debouncedSearch])

    // Reset search when dialog closes
    React.useEffect(() => {
        if (!open) {
            setSearchQuery("")
            setSearchResults({
                products: [],
                categories: [],
                manufacturers: [],
                productTypes: []
            })
        }
    }, [open])

    const handleNavigate = (path: string) => {
        setOpen(false)
        router.push(path)
    }

    const handleProductSelect = (productId: number) => {
        setOpen(false)
        router.push(`/products/${productId}`)
    }

    const handleCategorySelect = (categoryId: number) => {
        setOpen(false)
        router.push(`/categories?categoryId=${categoryId}`)
    }

    const handleManufacturerSelect = (manufacturerId: number) => {
        setOpen(false)
        router.push(`/products?manufacturerId=${manufacturerId}`)
    }

    const handleProductTypeSelect = (productTypeId: number) => {
        setOpen(false)
        router.push(`/products?productTypeId=${productTypeId}`)
    }

    const handleViewAllResults = () => {
        if (searchQuery.length >= 2) {
            setOpen(false)
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    // Handle Enter key to go to search results page
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && searchQuery.length >= 2 && !isSearching) {
            e.preventDefault()
            handleViewAllResults()
        }
    }

    const hasResults = searchResults.products.length > 0 ||
        searchResults.categories.length > 0 ||
        searchResults.manufacturers.length > 0 ||
        searchResults.productTypes.length > 0

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setOpen(true)}
            >
                <Search className="h-5 w-5" />
                <span className="sr-only">{t('search')}</span>
            </Button>
            <CommandDialog
                open={open}
                onOpenChange={setOpen}
                shouldFilter={false}
            >
                <CommandInput
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    onKeyDown={handleKeyDown}
                />
                <CommandList>
                    {/* Loading state */}
                    {isSearching && (
                        <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t('searching')}...
                        </div>
                    )}

                    {/* No search or short query - show navigation */}
                    {!isSearching && searchQuery.length < 2 && (
                        <CommandGroup heading={t('pages')}>
                            {navigationItems.map((item) => (
                                <CommandItem
                                    key={item.path}
                                    onSelect={() => handleNavigate(item.path)}
                                    className="cursor-pointer"
                                >
                                    <item.icon className="mr-2 h-4 w-4" />
                                    <span>{item.name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {/* Search results */}
                    {!isSearching && searchQuery.length >= 2 && (
                        <>
                            {/* View All Results - Always show when there's a search query */}
                            <CommandGroup>
                                <CommandItem
                                    onSelect={handleViewAllResults}
                                    className="cursor-pointer bg-muted/50"
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    <span className="flex-1">{t('viewAllResults')} "{searchQuery}"</span>
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </CommandItem>
                            </CommandGroup>

                            <CommandSeparator />

                            {!hasResults ? (
                                <CommandEmpty>{t('noResults')}</CommandEmpty>
                            ) : (
                                <>
                                    {/* Categories */}
                                    {searchResults.categories.length > 0 && (
                                        <>
                                            <CommandGroup heading="Categories">
                                                {searchResults.categories.map((category) => (
                                                    <CommandItem
                                                        key={`category-${category.id}`}
                                                        value={category.name}
                                                        onSelect={() => handleCategorySelect(category.id)}
                                                        className="cursor-pointer"
                                                    >
                                                        <Tag className="mr-2 h-4 w-4 text-blue-500" />
                                                        <span>{category.name}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                            <CommandSeparator />
                                        </>
                                    )}

                                    {/* Manufacturers */}
                                    {searchResults.manufacturers.length > 0 && (
                                        <>
                                            <CommandGroup heading="Manufacturers">
                                                {searchResults.manufacturers.map((manufacturer) => (
                                                    <CommandItem
                                                        key={`manufacturer-${manufacturer.id}`}
                                                        value={manufacturer.name}
                                                        onSelect={() => handleManufacturerSelect(manufacturer.id)}
                                                        className="cursor-pointer"
                                                    >
                                                        <Building2 className="mr-2 h-4 w-4 text-green-500" />
                                                        <span>{manufacturer.name}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                            <CommandSeparator />
                                        </>
                                    )}

                                    {/* Product Types */}
                                    {searchResults.productTypes.length > 0 && (
                                        <>
                                            <CommandGroup heading="Product Types">
                                                {searchResults.productTypes.map((productType) => (
                                                    <CommandItem
                                                        key={`productType-${productType.id}`}
                                                        value={productType.name}
                                                        onSelect={() => handleProductTypeSelect(productType.id)}
                                                        className="cursor-pointer"
                                                    >
                                                        <Layers className="mr-2 h-4 w-4 text-purple-500" />
                                                        <span>{productType.name}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                            <CommandSeparator />
                                        </>
                                    )}

                                    {/* Products */}
                                    {searchResults.products.length > 0 && (
                                        <CommandGroup heading={t('products')}>
                                            {searchResults.products.map((product) => (
                                                <CommandItem
                                                    key={product.id}
                                                    value={product.name}
                                                    onSelect={() => handleProductSelect(product.id)}
                                                    className="cursor-pointer"
                                                >
                                                    <div className="mr-2 h-8 w-8 relative flex-shrink-0 overflow-hidden rounded-md border bg-background">
                                                        {product.imageUrl ? (
                                                            <Image
                                                                src={product.imageUrl}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover"
                                                                sizes="32px"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center bg-muted">
                                                                <Package className="h-4 w-4 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium truncate">{product.name}</div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                            <span>{tCommon('currency')} {product.price}</span>
                                                            {product.manufacturer && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>{product.manufacturer.name}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    )}
                                </>
                            )}

                            {/* Navigation still available during search */}
                            <CommandSeparator />
                            <CommandGroup heading={t('pages')}>
                                {navigationItems.map((item) => (
                                    <CommandItem
                                        key={item.path}
                                        onSelect={() => handleNavigate(item.path)}
                                        className="cursor-pointer"
                                    >
                                        <item.icon className="mr-2 h-4 w-4" />
                                        <span>{item.name}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    )
}
