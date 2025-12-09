"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MapPin, CreditCard, Check } from "lucide-react"
import { ShippingData, PaymentData } from "@/app/[locale]/checkout/page"

interface OrderReviewProps {
    shippingData: ShippingData
    paymentData: PaymentData
    onPlaceOrder: () => void
    onBack: () => void
}

export function OrderReview({ shippingData, paymentData, onPlaceOrder, onBack }: OrderReviewProps) {
    const t = useTranslations('Checkout')

    // Mask card number for display
    const maskedCard = paymentData.cardNumber.slice(-4).padStart(paymentData.cardNumber.length, '*')

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    {t('review.title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Shipping Address */}
                <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4" />
                        {t('review.shippingAddress')}
                    </h3>
                    <div className="text-sm text-muted-foreground space-y-1 ps-6">
                        <p>{shippingData.firstName} {shippingData.lastName}</p>
                        <p>{shippingData.address}</p>
                        <p>{shippingData.city}, {shippingData.state} {shippingData.zipCode}</p>
                        <p>{shippingData.country}</p>
                        <p>{shippingData.phone}</p>
                        <p>{shippingData.email}</p>
                    </div>
                </div>

                <Separator />

                {/* Payment Method */}
                <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-3">
                        <CreditCard className="h-4 w-4" />
                        {t('review.paymentMethod')}
                    </h3>
                    <div className="text-sm text-muted-foreground ps-6">
                        <p>{paymentData.cardHolder}</p>
                        <p>**** **** **** {paymentData.cardNumber.slice(-4)}</p>
                        <p>{t('review.expires')}: {paymentData.expiryDate}</p>
                    </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                        <ArrowLeft className="h-4 w-4 me-2" />
                        {t('review.back')}
                    </Button>
                    <Button onClick={onPlaceOrder} className="flex-1" size="lg">
                        {t('review.placeOrder')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
