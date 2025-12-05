import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "@/i18n/navigation"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export function useCart() {
    const [isAdding, setIsAdding] = useState(false)
    const { isAuthenticated, token } = useAuth()
    const router = useRouter()
    const t = useTranslations('Cart')

    const addToCart = async (productId: number, quantity: number = 1) => {
        if (!isAuthenticated) {
            toast.error(t('loginRequired'))
            router.push('/auth/login')
            return false
        }

        if (!token) {
            toast.error(t('authError'))
            return false
        }

        setIsAdding(true)
        try {
            const response = await fetch('/api/cart/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ productId, quantity }),
            })

            if (response.ok) {
                toast.success(t('itemAdded'))
                return true
            } else {
                const error = await response.json()
                toast.error(error.message || t('addFailed'))
                return false
            }
        } catch (error) {
            console.error('Failed to add to cart:', error)
            toast.error(t('addFailed'))
            return false
        } finally {
            setIsAdding(false)
        }
    }

    return { addToCart, isAdding }
}
