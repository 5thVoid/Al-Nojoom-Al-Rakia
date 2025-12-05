"use client"

import * as React from "react"
import { Search, Home, ShoppingBag, User, LogIn, Package, Loader2, ArrowRight } from "lucide-react"
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
    manufacturer?: { name: string }
    category?: { name: string }
}

export function SearchBar() {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [products, setProducts] = React.useState<Product[]>([])
    const [isSearching, setIsSearching] = React.useState(false)
    const t = useTranslations('Navbar')
    const router = useRouter()

    const debouncedSearch = useDebounce(searchQuery, 300)

    const navigationItems = [
        { name: t('home'), path: '/', icon: Home },
        { name: t('products'), path: '/products', icon: ShoppingBag },
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

    // Search products when debounced query changes
    React.useEffect(() => {
        const searchProducts = async () => {
            if (!debouncedSearch || debouncedSearch.length < 2) {
                setProducts([])
                return
            }

            setIsSearching(true)
            try {
                const response = await fetch(`/api/products?page=1&limit=5&search=${encodeURIComponent(debouncedSearch)}`)
                const data = await response.json()
                setProducts(data.data || [])
            } catch (error) {
                console.error('Search failed:', error)
                setProducts([])
            } finally {
                setIsSearching(false)
            }
        }

        searchProducts()
    }, [debouncedSearch])

    // Reset search when dialog closes
    React.useEffect(() => {
        if (!open) {
            setSearchQuery("")
            setProducts([])
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

                            {products.length === 0 ? (
                                <CommandEmpty>{t('noResults')}</CommandEmpty>
                            ) : (
                                <CommandGroup heading={t('products')}>
                                    {products.map((product) => (
                                        <CommandItem
                                            key={product.id}
                                            value={product.name}
                                            onSelect={() => handleProductSelect(product.id)}
                                            className="cursor-pointer"
                                        >
                                            <Package className="mr-2 h-4 w-4 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{product.name}</div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                    <span>${product.price}</span>
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
