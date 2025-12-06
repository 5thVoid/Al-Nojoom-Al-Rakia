"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth, User, Address } from "@/context/AuthContext"

// Re-export types for convenience
export type { User, Address }

/**
 * Hook to retrieve the logged-in user's data and their default address.
 * 
 * @returns The user object with id, email, role, and address information,
 * along with authentication state, loading status, and default address.
 */
export function useUser() {
    const { user, isAuthenticated, isLoading, token } = useAuth()
    const [defaultAddress, setDefaultAddress] = useState<Address | null>(null)
    const [isLoadingAddress, setIsLoadingAddress] = useState(false)

    // Fetch user's default address
    const fetchDefaultAddress = useCallback(async () => {
        if (!token || !isAuthenticated) {
            setDefaultAddress(null)
            return
        }

        setIsLoadingAddress(true)
        try {
            const response = await fetch('/api/address/default', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                const data = await response.json()
                setDefaultAddress(data.address || null)
            } else {
                setDefaultAddress(null)
            }
        } catch (error) {
            console.error('Failed to fetch default address:', error)
            setDefaultAddress(null)
        } finally {
            setIsLoadingAddress(false)
        }
    }, [token, isAuthenticated])

    // Fetch default address when authenticated
    useEffect(() => {
        if (isAuthenticated && token) {
            fetchDefaultAddress()
        }
    }, [isAuthenticated, token, fetchDefaultAddress])

    // Function to save or update an address
    const saveAddress = async (addressData: Partial<Address>, existingAddressId?: number): Promise<Address | null> => {
        if (!token) return null

        try {
            const url = existingAddressId
                ? `/api/address/${existingAddressId}`
                : '/api/address'

            const method = existingAddressId ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...addressData,
                    isDefault: true,
                }),
            })

            if (response.ok) {
                const data = await response.json()
                const savedAddress = data.address || data
                setDefaultAddress(savedAddress)
                return savedAddress
            }
            return null
        } catch (error) {
            console.error('Failed to save address:', error)
            return null
        }
    }

    return {
        user,
        isAuthenticated,
        isLoading,
        token,
        // Convenience getters for common user properties
        userId: user?.id ?? null,
        userEmail: user?.email ?? null,
        userRole: user?.role ?? null,
        userAddress: user?.address ?? null,
        // Default address from API
        defaultAddress,
        isLoadingAddress,
        fetchDefaultAddress,
        saveAddress,
    }
}
