"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

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

interface CheckoutSummaryProps {
    cartData: CartData | null
}

export function CheckoutSummary({ cartData }: CheckoutSummaryProps) {
    const t = useTranslations('Checkout')

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
                        <div key={item.id} className="flex justify-between text-sm">
                            <span className="flex-1 line-clamp-1">
                                {item.product.name} × {item.quantity}
                            </span>
                            <span className="font-medium ms-2">
                                ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>

                <Separator />

                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                    <span>{t('summary.subtotal')}</span>
                    <span>${cartData.totals.subtotal.toFixed(2)}</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between text-sm">
                    <span>{t('summary.shipping')}</span>
                    <span className="text-green-600">{t('summary.free')}</span>
                </div>

                {/* Tax */}
                <div className="flex justify-between text-sm">
                    <span>{t('summary.tax')} (15%)</span>
                    <span>${tax.toFixed(2)}</span>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between text-lg font-bold">
                    <span>{t('summary.total')}</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </CardContent>
        </Card>
    )
}
