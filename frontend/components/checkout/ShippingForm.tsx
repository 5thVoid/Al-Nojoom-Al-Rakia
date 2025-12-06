"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShippingData } from "@/app/[locale]/checkout/page"
import { SaveAddressDialog } from "./SaveAddressDialog"
import { Address } from "@/hooks/useUser"
import { toast } from "sonner"

interface ShippingFormProps {
    initialData: ShippingData
    defaultAddress?: Address | null
    userEmail?: string | null
    onSubmit: (data: ShippingData) => void
    onSaveAddress?: (addressData: Partial<Address>) => Promise<Address | null>
    existingAddressId?: number | null
}

export function ShippingForm({
    initialData,
    defaultAddress,
    userEmail,
    onSubmit,
    onSaveAddress,
    existingAddressId,
}: ShippingFormProps) {
    const t = useTranslations('Checkout')
    const [formData, setFormData] = useState<ShippingData>(initialData)
    const [showSaveDialog, setShowSaveDialog] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [pendingSubmit, setPendingSubmit] = useState(false)
    const [hasPrefilledAddress, setHasPrefilledAddress] = useState(false)

    // Prefill email from user account
    useEffect(() => {
        if (userEmail && !formData.email) {
            setFormData(prev => ({ ...prev, email: userEmail }))
        }
    }, [userEmail])

    // Prefill form with default address when available
    useEffect(() => {
        if (defaultAddress && !hasPrefilledAddress) {
            // Parse recipient name into first and last name
            const nameParts = defaultAddress.recipientName?.split(' ') || []
            const firstName = nameParts[0] || ''
            const lastName = nameParts.slice(1).join(' ') || ''

            setFormData(prev => ({
                firstName,
                lastName,
                email: prev.email || userEmail || '', // Keep email from previous or user account
                phone: defaultAddress.phoneNumber || '',
                address: defaultAddress.streetAddress || '',
                city: defaultAddress.city || '',
                state: defaultAddress.district || '',
                zipCode: defaultAddress.postalCode || '',
                country: 'Saudi Arabia', // Default country
            }))
            setHasPrefilledAddress(true)
        }
    }, [defaultAddress, hasPrefilledAddress, userEmail])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Check if the address has changed from the default
        const hasAddressChanged = !defaultAddress ||
            formData.address !== defaultAddress.streetAddress ||
            formData.city !== defaultAddress.city ||
            formData.state !== defaultAddress.district ||
            formData.zipCode !== defaultAddress.postalCode ||
            formData.phone !== defaultAddress.phoneNumber

        // If address changed and we can save, show dialog
        if (hasAddressChanged && onSaveAddress) {
            setPendingSubmit(true)
            setShowSaveDialog(true)
        } else {
            // No changes or can't save, just submit
            onSubmit(formData)
        }
    }

    const handleSaveConfirm = async () => {
        if (!onSaveAddress) {
            proceedWithSubmit()
            return
        }

        setIsSaving(true)
        try {
            const addressData: Partial<Address> = {
                recipientName: `${formData.firstName} ${formData.lastName}`.trim(),
                streetAddress: formData.address,
                city: formData.city,
                district: formData.state,
                postalCode: formData.zipCode,
                phoneNumber: formData.phone,
                isDefault: true,
            }

            const savedAddress = await onSaveAddress(addressData)

            if (savedAddress) {
                toast.success(t('saveAddress.success'))
            } else {
                toast.error(t('saveAddress.error'))
            }
        } catch (error) {
            console.error('Failed to save address:', error)
            toast.error(t('saveAddress.error'))
        } finally {
            setIsSaving(false)
            setShowSaveDialog(false)
            proceedWithSubmit()
        }
    }

    const handleSaveCancel = () => {
        setShowSaveDialog(false)
        proceedWithSubmit()
    }

    const proceedWithSubmit = () => {
        if (pendingSubmit) {
            setPendingSubmit(false)
            onSubmit(formData)
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>{t('shipping.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">{t('shipping.firstName')}</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">{t('shipping.lastName')}</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

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
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">{t('shipping.address')}</Label>
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">{t('shipping.city')}</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">{t('shipping.state')}</Label>
                                <Input
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="zipCode">{t('shipping.zipCode')}</Label>
                                <Input
                                    id="zipCode"
                                    name="zipCode"
                                    value={formData.zipCode}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">{t('shipping.country')}</Label>
                                <Input
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" size="lg">
                            {t('shipping.continue')}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <SaveAddressDialog
                open={showSaveDialog}
                onOpenChange={setShowSaveDialog}
                onConfirm={handleSaveConfirm}
                onCancel={handleSaveCancel}
                isLoading={isSaving}
            />
        </>
    )
}
