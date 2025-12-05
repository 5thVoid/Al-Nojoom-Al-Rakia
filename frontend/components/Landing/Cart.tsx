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

// Dummy data for the cart
const dummyCartItems = [
    {
        id: 1,
        name: "Premium Wireless Headphones",
        price: 299.99,
        quantity: 1,
        image: "/placeholder.svg", // We'll handle the missing image gracefully or use a color block
    },
    {
        id: 2,
        name: "Ergonomic Office Chair",
        price: 159.50,
        quantity: 2,
        image: "/placeholder.svg",
    },
    {
        id: 3,
        name: "Mechanical Keyboard",
        price: 120.00,
        quantity: 1,
        image: "/placeholder.svg",
    },
]

export function Cart() {
    const [items, setItems] = React.useState(dummyCartItems)
    const t = useTranslations('Cart')

    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9"
                >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="sr-only">{t('title')}</span>
                    {items.length > 0 && (
                        <span className="absolute -end-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                            {items.length}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col pe-0 sm:max-w-lg">
                <SheetHeader className="px-1">
                    <SheetTitle>{t('title')} ({items.length})</SheetTitle>
                </SheetHeader>

                {items.length > 0 ? (
                    <>
                        <div className="flex-1 overflow-y-auto pe-6">
                            <ul className="grid gap-6 py-4">
                                {items.map((item) => (
                                    <li key={item.id} className="flex items-center gap-4">
                                        <div className="relative h-20 w-20 overflow-hidden rounded-lg border bg-muted">
                                            {/* Fallback for missing image since we don't have real product images yet */}
                                            <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground">
                                                <ShoppingCart className="h-6 w-6 opacity-20" />
                                            </div>
                                        </div>
                                        <div className="flex flex-1 flex-col gap-1">
                                            <span className="font-medium">{item.name}</span>
                                            <span className="text-sm text-muted-foreground">
                                                ${item.price.toFixed(2)}
                                            </span>
                                            <div className="mt-2 flex items-center gap-2">
                                                <Button variant="outline" size="icon" className="h-6 w-6">
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="text-sm w-4 text-center">{item.quantity}</span>
                                                <Button variant="outline" size="icon" className="h-6 w-6">
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
                                    <Button className="w-full" size="lg">
                                        {t('checkout')}
                                    </Button>
                                    <Button variant="outline" className="w-full">
                                        {t('continueShopping')}
                                    </Button>
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
                        <Button variant="link" className="text-sm text-primary">
                            {t('startShopping')}
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
