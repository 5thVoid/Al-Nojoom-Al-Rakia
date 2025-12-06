"use client"

import { useEffect, useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useAuth } from "@/context/AuthContext"
import { useUser } from "@/hooks/useUser"
import { useTranslations } from "next-intl"
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary"
import { ShippingForm } from "@/components/checkout/ShippingForm"
import { PaymentForm } from "@/components/checkout/PaymentForm"
import { OrderReview } from "@/components/checkout/OrderReview"
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps"

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
    const { defaultAddress, isLoadingAddress, saveAddress, userEmail } = useUser()
    const t = useTranslations('Checkout')

    const [currentStep, setCurrentStep] = useState(1)
    const [cartData, setCartData] = useState<CartData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
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

    const handleShippingSubmit = (data: ShippingData) => {
        setShippingData(data)
        setCurrentStep(2)
    }

    const handlePaymentSubmit = (data: PaymentData) => {
        setPaymentData(data)
        setCurrentStep(3)
    }

    const handlePlaceOrder = async () => {
        // TODO: Implement order placement API
        console.log('Placing order...', { shippingData, paymentData, cartData })
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
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 h-96 bg-muted rounded"></div>
                        <div className="h-64 bg-muted rounded"></div>
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
                            defaultAddress={defaultAddress}
                            userEmail={userEmail}
                            onSubmit={handleShippingSubmit}
                            onSaveAddress={saveAddress}
                            existingAddressId={defaultAddress?.id}
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
