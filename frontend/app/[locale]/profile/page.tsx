"use client"

import { useEffect, useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useUser, Address } from "@/hooks/useUser"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AddressCard } from "@/components/profile/AddressCard"
import { AddressFormDialog } from "@/components/profile/AddressFormDialog"
import { DeleteAddressDialog } from "@/components/profile/DeleteAddressDialog"
import { toast } from "sonner"
import { Plus, Mail, Shield, User as UserIcon, MapPin } from "lucide-react"

export default function ProfilePage() {
    const router = useRouter()
    const t = useTranslations('Profile')
    const { user, userEmail, userRole, isAuthenticated, isLoading: authLoading, token } = useUser()
    const { logout } = useAuth()

    const [addresses, setAddresses] = useState<Address[]>([])
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [editingAddress, setEditingAddress] = useState<Address | null>(null)
    const [deletingAddress, setDeletingAddress] = useState<Address | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login')
        }
    }, [authLoading, isAuthenticated, router])

    // Fetch all addresses
    const fetchAddresses = async () => {
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
            toast.error(t('errors.fetchFailed'))
        } finally {
            setIsLoadingAddresses(false)
        }
    }

    useEffect(() => {
        if (isAuthenticated && token) {
            fetchAddresses()
        }
    }, [isAuthenticated, token])

    // Create or update address
    const handleSaveAddress = async (addressData: Partial<Address>) => {
        if (!token) return

        setIsSaving(true)
        try {
            const isEditing = !!editingAddress
            const url = isEditing ? `/api/address/${editingAddress.id}` : '/api/address'
            const method = isEditing ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(addressData),
            })

            if (response.ok) {
                toast.success(isEditing ? t('address.updated') : t('address.created'))
                setShowAddressForm(false)
                setEditingAddress(null)
                fetchAddresses()
            } else {
                const error = await response.json()
                toast.error(error.message || t('errors.saveFailed'))
            }
        } catch (error) {
            console.error('Failed to save address:', error)
            toast.error(t('errors.saveFailed'))
        } finally {
            setIsSaving(false)
        }
    }

    // Delete address
    const handleDeleteAddress = async () => {
        if (!token || !deletingAddress) return

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/address/${deletingAddress.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                toast.success(t('address.deleted'))
                setDeletingAddress(null)
                fetchAddresses()
            } else {
                const error = await response.json()
                toast.error(error.message || t('errors.deleteFailed'))
            }
        } catch (error) {
            console.error('Failed to delete address:', error)
            toast.error(t('errors.deleteFailed'))
        } finally {
            setIsDeleting(false)
        }
    }

    // Set address as default
    const handleSetDefault = async (addressId: number) => {
        if (!token) return

        try {
            const response = await fetch(`/api/address/${addressId}/default`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (response.ok) {
                toast.success(t('address.defaultSet'))
                fetchAddresses()
            } else {
                const error = await response.json()
                toast.error(error.message || t('errors.setDefaultFailed'))
            }
        } catch (error) {
            console.error('Failed to set default address:', error)
            toast.error(t('errors.setDefaultFailed'))
        }
    }

    // Show loading while auth is initializing
    if (authLoading || !isAuthenticated) {
        return null
    }

    return (
        <div className="max-w-screen-xl mx-auto py-8 px-4 md:px-8">
            <h1 className="text-3xl font-bold tracking-tight mb-8">{t('title')}</h1>

            <div className="grid gap-8 md:grid-cols-3">
                {/* User Info Section */}
                <div className="md:col-span-1">
                    <Card className="bg-background">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserIcon className="h-5 w-5" />
                                {t('info.title')}
                            </CardTitle>
                            <CardDescription>{t('info.description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <UserIcon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('info.userId')}</p>
                                    <p className="font-medium">#{user?.id}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <Mail className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('info.email')}</p>
                                    <p className="font-medium">{userEmail}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <Shield className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">{t('info.role')}</p>
                                    <Badge variant="secondary" className="capitalize">
                                        {userRole}
                                    </Badge>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={logout}
                                >
                                    {t('logout')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Addresses Section */}
                <div className="md:col-span-2">
                    <Card className="bg-background">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    {t('addresses.title')}
                                </CardTitle>
                                <CardDescription>{t('addresses.description')}</CardDescription>
                            </div>
                            <Button onClick={() => setShowAddressForm(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                {t('addresses.add')}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {isLoadingAddresses ? (
                                <div className="space-y-4">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="p-4 border rounded-lg">
                                            <Skeleton className="h-4 w-1/3 mb-2" />
                                            <Skeleton className="h-4 w-2/3 mb-2" />
                                            <Skeleton className="h-4 w-1/2" />
                                        </div>
                                    ))}
                                </div>
                            ) : addresses.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>{t('addresses.empty')}</p>
                                    <Button
                                        variant="outline"
                                        className="mt-4"
                                        onClick={() => setShowAddressForm(true)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        {t('addresses.addFirst')}
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {addresses.map((address) => (
                                        <AddressCard
                                            key={address.id}
                                            address={address}
                                            onEdit={() => {
                                                setEditingAddress(address)
                                                setShowAddressForm(true)
                                            }}
                                            onDelete={() => setDeletingAddress(address)}
                                            onSetDefault={() => handleSetDefault(address.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Address Form Dialog */}
            <AddressFormDialog
                open={showAddressForm}
                onOpenChange={(open) => {
                    setShowAddressForm(open)
                    if (!open) setEditingAddress(null)
                }}
                address={editingAddress}
                onSave={handleSaveAddress}
                isSaving={isSaving}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteAddressDialog
                open={!!deletingAddress}
                onOpenChange={(open) => !open && setDeletingAddress(null)}
                onConfirm={handleDeleteAddress}
                isDeleting={isDeleting}
            />
        </div>
    )
}
