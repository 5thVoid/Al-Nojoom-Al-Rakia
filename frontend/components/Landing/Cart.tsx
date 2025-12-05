"use client"

import * as React from "react"
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet"
import { useTranslations } from "next-intl"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "@/i18n/navigation"
import { toast } from "sonner"

interface CartItem {
    id: number
    productId: number
    product: {
        id: number
        name: string
        sku: string
        price: string
    }
    quantity: number
}

interface CartData {
    cartId: number
    items: CartItem[]
    totals: {
        subtotal: number
        itemCount: number
    }
}

export function Cart() {
    const [cartData, setCartData] = React.useState<CartData | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const [isOpen, setIsOpen] = React.useState(false)
    const t = useTranslations('Cart')
    const { isAuthenticated, token } = useAuth()
    const router = useRouter()

    const fetchCart = React.useCallback(async () => {
        if (!isAuthenticated || !token) return

        try {
            const response = await fetch('/api/cart', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setCartData(data)
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error)
        }
    }, [isAuthenticated, token])

    React.useEffect(() => {
        if (isOpen && isAuthenticated) {
            fetchCart()
        }
    }, [isOpen, isAuthenticated, fetchCart])

    const updateQuantity = async (productId: number, newQuantity: number) => {
        if (!token) return

        if (newQuantity < 1) {
            await removeItem(productId)
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch(`/api/cart/items/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ quantity: newQuantity }),
            })

            if (response.ok) {
                await fetchCart()
                toast.success(t('quantityUpdated'))
            } else {
                toast.error(t('updateFailed'))
            }
        } catch (error) {
            console.error('Failed to update quantity:', error)
            toast.error(t('updateFailed'))
        } finally {
            setIsLoading(false)
        }
    }

    const removeItem = async (productId: number) => {
        if (!token) return

        setIsLoading(true)
        try {
            const response = await fetch(`/api/cart/items/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                await fetchCart()
                toast.success(t('itemRemoved'))
            } else {
                toast.error(t('removeFailed'))
            }
        } catch (error) {
            console.error('Failed to remove item:', error)
            toast.error(t('removeFailed'))
        } finally {
            setIsLoading(false)
        }
    }

    const clearCart = async () => {
        if (!token) return

        setIsLoading(true)
        try {
            const response = await fetch('/api/cart', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                setCartData(null)
                toast.success(t('cartCleared'))
            } else {
                toast.error(t('clearFailed'))
            }
        } catch (error) {
            console.error('Failed to clear cart:', error)
            toast.error(t('clearFailed'))
        } finally {
            setIsLoading(false)
        }
    }

    const handleCheckout = () => {
        setIsOpen(false)
        router.push('/checkout')
    }

    const items = cartData?.items || []
    const total = cartData?.totals.subtotal || 0
    const itemCount = cartData?.totals.itemCount || 0

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9"
                >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="sr-only">{t('title')}</span>
                    {itemCount > 0 && (
                        <span className="absolute -end-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                            {itemCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col pe-0 sm:max-w-lg">
                <SheetHeader className="px-1">
                    <SheetTitle>{t('title')} ({itemCount})</SheetTitle>
                </SheetHeader>

                {!isAuthenticated ? (
                    <div className="flex h-full flex-col items-center justify-center space-y-4 pe-6">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
                        <span className="text-lg font-medium text-muted-foreground text-center">
                            {t('loginRequired')}
                        </span>
                        <Button onClick={() => {
                            setIsOpen(false)
                            router.push('/auth/login')
                        }}>
                            {t('loginButton')}
                        </Button>
                    </div>
                ) : items.length > 0 ? (
                    <>
                        <div className="flex-1 overflow-y-auto pe-6">
                            <ul className="grid gap-6 py-4">
                                {items.map((item) => (
                                    <li key={item.id} className="flex items-center gap-4">
                                        <div className="relative h-20 w-20 overflow-hidden rounded-lg border bg-muted">
                                            <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground">
                                                <ShoppingCart className="h-6 w-6 opacity-20" />
                                            </div>
                                        </div>
                                        <div className="flex flex-1 flex-col gap-1">
                                            <span className="font-medium line-clamp-1">{item.product.name}</span>
                                            <span className="text-sm text-muted-foreground">
                                                ${parseFloat(item.product.price).toFixed(2)}
                                            </span>
                                            <div className="mt-2 flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    disabled={isLoading}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="text-sm w-4 text-center">{item.quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    disabled={isLoading}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => removeItem(item.productId)}
                                            disabled={isLoading}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">{t('remove')}</span>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <SheetFooter className="border-t pt-6 pe-6">
                            <div className="w-full space-y-4">
                                <div className="flex items-center justify-between text-base font-medium">
                                    <span>{t('total')}</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="grid gap-2">
                                    <Button
                                        className="w-full"
                                        size="lg"
                                        onClick={handleCheckout}
                                        disabled={isLoading}
                                    >
                                        {t('checkout')}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {t('continueShopping')}
                                    </Button>
                                    {items.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            className="w-full text-destructive"
                                            onClick={clearCart}
                                            disabled={isLoading}
                                        >
                                            {t('clearCart')}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </SheetFooter>
                    </>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center space-y-2 pe-6">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
                        <span className="text-lg font-medium text-muted-foreground">
                            {t('emptyTitle')}
                        </span>
                        <Button
                            variant="link"
                            className="text-sm text-primary"
                            onClick={() => setIsOpen(false)}
                        >
                            {t('startShopping')}
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
