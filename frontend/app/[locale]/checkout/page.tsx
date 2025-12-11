"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "@/i18n/navigation"
import { useAuth } from "@/context/AuthContext"
import { useUser, Address } from "@/hooks/useUser"
import { useTranslations } from "next-intl"
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary"
import { ShippingForm } from "@/components/checkout/ShippingForm"
import { PaymentForm } from "@/components/checkout/PaymentForm"
import { OrderReview } from "@/components/checkout/OrderReview"
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

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

export interface ShippingData {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
}

export interface PaymentData {
    cardNumber: string
    cardHolder: string
    expiryDate: string
    cvv: string
}

export default function CheckoutPage() {
    const router = useRouter()
    const { isAuthenticated, token, isLoading: authLoading } = useAuth()
    const { createAddress, userEmail } = useUser()
    const t = useTranslations('Checkout')

    const [currentStep, setCurrentStep] = useState(1)
    const [cartData, setCartData] = useState<CartData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [addresses, setAddresses] = useState<Address[]>([])
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
    const [shippingData, setShippingData] = useState<ShippingData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
    })
    const [paymentData, setPaymentData] = useState<PaymentData>({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
    })

    // Redirect if not authenticated (only after auth has loaded)
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login')
        }
    }, [authLoading, isAuthenticated, router])

    // Fetch cart data
    useEffect(() => {
        const fetchCart = async () => {
            if (!token) return

            try {
                const response = await fetch('/api/cart', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                })

                if (response.ok) {
                    const data = await response.json()
                    setCartData(data)

                    // Redirect to products if cart is empty
                    if (!data.items || data.items.length === 0) {
                        router.push('/products')
                    }
                }
            } catch (error) {
                console.error('Failed to fetch cart:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchCart()
    }, [token, router])

    // Fetch user addresses
    const fetchAddresses = useCallback(async () => {
        if (!token) return

        setIsLoadingAddresses(true)
        try {
            const response = await fetch('/api/address', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setAddresses(data.addresses || [])
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error)
        } finally {
            setIsLoadingAddresses(false)
        }
    }, [token])

    useEffect(() => {
        if (isAuthenticated && token) {
            fetchAddresses()
        }
    }, [isAuthenticated, token, fetchAddresses])

    const handleShippingSubmit = (data: ShippingData, addressId?: number) => {
        setShippingData(data)
        if (addressId) {
            setSelectedAddressId(addressId)
        }
        setCurrentStep(2)
    }

    const handlePaymentSubmit = (data: PaymentData) => {
        setPaymentData(data)
        setCurrentStep(3)
    }

    const handlePlaceOrder = async () => {
        // TODO: Implement order placement API
        console.log('Placing order...', { shippingData, paymentData, cartData, selectedAddressId })
        // For now, just show success
        router.push('/checkout/success')
    }

    // Show loading while auth is initializing or if not authenticated yet
    if (authLoading || !isAuthenticated) {
        return null
    }

    if (isLoading) {
        return (
            <div className="container max-w-screen-xl py-8 px-4 md:px-28">
                <div className="space-y-6">
                    {/* Title skeleton */}
                    <Skeleton className="h-9 w-48" />

                    {/* Steps skeleton */}
                    <div className="flex justify-between gap-4 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-12 flex-1" />
                        ))}
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Form skeleton */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <Skeleton className="h-6 w-40" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Summary skeleton */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex justify-between">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                ))}
                                <Skeleton className="h-px w-full my-2" />
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-16" />
                                    <Skeleton className="h-5 w-24" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-screen-3xl py-8 px-4 md:px-28">
            <h1 className="text-3xl font-bold tracking-tight mb-8">{t('title')}</h1>

            <CheckoutSteps currentStep={currentStep} />

            <div className="grid md:grid-cols-3 gap-8 mt-8">
                <div className="md:col-span-2">
                    {currentStep === 1 && (
                        <ShippingForm
                            initialData={shippingData}
                            addresses={addresses}
                            isLoadingAddresses={isLoadingAddresses}
                            userEmail={userEmail}
                            onSubmit={handleShippingSubmit}
                            onCreateAddress={createAddress}
                            onRefreshAddresses={fetchAddresses}
                        />
                    )}
                    {currentStep === 2 && (
                        <PaymentForm
                            initialData={paymentData}
                            onSubmit={handlePaymentSubmit}
                            onBack={() => setCurrentStep(1)}
                        />
                    )}
                    {currentStep === 3 && (
                        <OrderReview
                            shippingData={shippingData}
                            paymentData={paymentData}
                            onPlaceOrder={handlePlaceOrder}
                            onBack={() => setCurrentStep(2)}
                        />
                    )}
                </div>

                <div>
                    <CheckoutSummary cartData={cartData} />
                </div>
            </div>
        </div>
    )
}
