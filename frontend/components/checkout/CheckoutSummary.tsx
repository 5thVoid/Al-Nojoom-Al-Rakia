"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"

interface CartItem {
    id: number
    productId: number
    product: {
        id: number
        name: string
        sku: string
        price: string
        imageUrl?: string
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

interface CheckoutSummaryProps {
    cartData: CartData | null
}

export function CheckoutSummary({ cartData }: CheckoutSummaryProps) {
    const t = useTranslations('Checkout')
    const tCommon = useTranslations('Common')

    if (!cartData) return null

    const shipping = 0 // Free shipping for now
    const tax = cartData.totals.subtotal * 0.15 // 15% VAT
    const total = cartData.totals.subtotal + shipping + tax

    return (
        <Card className="sticky top-4 bg-card">
            <CardHeader>
                <CardTitle>{t('summary.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                    {cartData.items.map((item) => (
                        <div key={item.id} className="flex gap-4 text-sm">
                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-background">
                                {item.product.imageUrl ? (
                                    <Image
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        fill
                                        className="object-contain p-1"
                                        sizes="64px"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-secondary">
                                        <ShoppingCart className="h-4 w-4 opacity-20" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-1 flex-col justify-center">
                                <span className="font-medium line-clamp-2">
                                    {item.product.name}
                                </span>
                                <span className="text-muted-foreground mt-1">
                                    Qty: {item.quantity}
                                </span>
                            </div>
                            <span className="font-medium flex items-center">
                                {tCommon('currency')} {(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>

                <Separator />

                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                    <span>{t('summary.subtotal')}</span>
                    <span>{tCommon('currency')} {cartData.totals.subtotal.toFixed(2)}</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between text-sm">
                    <span>{t('summary.shipping')}</span>
                    <span className="text-green-600">{t('summary.free')}</span>
                </div>

                {/* Tax */}
                <div className="flex justify-between text-sm">
                    <span>{t('summary.tax')} (15%)</span>
                    <span>{tCommon('currency')} {tax.toFixed(2)}</span>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between text-lg font-bold">
                    <span>{t('summary.total')}</span>
                    <span>{tCommon('currency')} {total.toFixed(2)}</span>
                </div>
            </CardContent>
        </Card>
    )
}
