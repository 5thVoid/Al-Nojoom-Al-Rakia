"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShippingData } from "@/app/[locale]/checkout/page"
import { AddressSelection } from "./AddressSelection"
import { AddressFormDialog } from "@/components/profile/AddressFormDialog"
import { Address } from "@/hooks/useUser"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

interface ShippingFormProps {
    initialData: ShippingData
    addresses: Address[]
    isLoadingAddresses?: boolean
    userEmail?: string | null
    onSubmit: (data: ShippingData, selectedAddressId?: number) => void
    onCreateAddress?: (addressData: Partial<Address>) => Promise<Address | null>
    onRefreshAddresses?: () => void
}

export function ShippingForm({
    initialData,
    addresses,
    isLoadingAddresses = false,
    userEmail,
    onSubmit,
    onCreateAddress,
    onRefreshAddresses,
}: ShippingFormProps) {
    const t = useTranslations('Checkout')

    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [isSavingAddress, setIsSavingAddress] = useState(false)
    const [formData, setFormData] = useState<ShippingData>(initialData)

    // Pre-select the default address if available
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddress) {
            const defaultAddr = addresses.find(addr => addr.isDefault)
            if (defaultAddr) {
                setSelectedAddress(defaultAddr)
                populateFormFromAddress(defaultAddr)
            }
        }
    }, [addresses])

    // Prefill email from user account
    useEffect(() => {
        if (userEmail && !formData.email) {
            setFormData(prev => ({ ...prev, email: userEmail }))
        }
    }, [userEmail])

    const populateFormFromAddress = (address: Address) => {
        // Parse recipient name into first and last name
        const nameParts = address.recipientName?.split(' ') || []
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        setFormData(prev => ({
            firstName,
            lastName,
            email: prev.email || userEmail || '',
            phone: address.phoneNumber || '',
            address: address.streetAddress || '',
            city: address.city || '',
            state: address.district || '',
            zipCode: address.postalCode || '',
            country: 'Saudi Arabia',
        }))
    }

    const handleAddressSelect = (address: Address) => {
        setSelectedAddress(address)
        populateFormFromAddress(address)
    }

    const handleAddNewAddress = () => {
        setShowAddressForm(true)
    }

    const handleSaveNewAddress = async (addressData: Partial<Address>) => {
        if (!onCreateAddress) return

        setIsSavingAddress(true)
        try {
            const newAddress = await onCreateAddress(addressData)
            if (newAddress) {
                toast.success(t('addressSelection.addressCreated'))
                setShowAddressForm(false)
                // Refresh addresses and select the new one
                if (onRefreshAddresses) {
                    onRefreshAddresses()
                }
                setSelectedAddress(newAddress)
                populateFormFromAddress(newAddress)
            } else {
                toast.error(t('addressSelection.addressCreateFailed'))
            }
        } catch (error) {
            console.error('Failed to create address:', error)
            toast.error(t('addressSelection.addressCreateFailed'))
        } finally {
            setIsSavingAddress(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!selectedAddress) {
            toast.error(t('addressSelection.pleaseSelectAddress'))
            return
        }

        onSubmit(formData, selectedAddress.id)
    }

    return (
        <>
            <div className="space-y-6">
                {/* Address Selection */}
                <AddressSelection
                    addresses={addresses}
                    selectedAddressId={selectedAddress?.id ?? null}
                    onSelectAddress={handleAddressSelect}
                    onAddNewAddress={handleAddNewAddress}
                    isLoading={isLoadingAddresses}
                />

                {/* Email & Phone form - only if address is selected */}
                {selectedAddress && (
                    <Card className="bg-card">
                        <CardHeader>
                            <CardTitle>{t('shipping.contactInfo')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">{t('shipping.email')}</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">{t('shipping.phone')}</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            disabled
                                            className="bg-muted"
                                        />
                                    </div>
                                </div>

                                {/* Summary of selected address */}
                                <div className="p-4 rounded-lg bg-muted/50 border">
                                    <p className="text-sm font-medium mb-1">
                                        {t('shipping.deliveryTo')}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedAddress.recipientName} • {selectedAddress.streetAddress}, {selectedAddress.city}
                                    </p>
                                </div>

                                <Button type="submit" className="w-full" size="lg">
                                    {t('shipping.continue')}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Add New Address Dialog */}
            <AddressFormDialog
                open={showAddressForm}
                onOpenChange={setShowAddressForm}
                address={null}
                onSave={handleSaveNewAddress}
                isSaving={isSavingAddress}
            />
        </>
    )
}
