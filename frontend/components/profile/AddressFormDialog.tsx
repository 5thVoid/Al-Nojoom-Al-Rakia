"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Address } from "@/hooks/useUser"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

interface AddressFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    address: Address | null
    onSave: (data: Partial<Address>) => Promise<void>
    isSaving: boolean
}

export function AddressFormDialog({
    open,
    onOpenChange,
    address,
    onSave,
    isSaving,
}: AddressFormDialogProps) {
    const t = useTranslations('Profile')
    const isEditing = !!address

    const [formData, setFormData] = useState({
        recipientName: '',
        streetAddress: '',
        district: '',
        postalCode: '',
        city: '',
        buildingNumber: '',
        secondaryNumber: '',
        phoneNumber: '',
        label: '',
        isDefault: false,
    })

    // Reset form when dialog opens/closes or address changes
    useEffect(() => {
        if (open && address) {
            setFormData({
                recipientName: address.recipientName || '',
                streetAddress: address.streetAddress || '',
                district: address.district || '',
                postalCode: address.postalCode || '',
                city: address.city || '',
                buildingNumber: address.buildingNumber || '',
                secondaryNumber: address.secondaryNumber || '',
                phoneNumber: address.phoneNumber || '',
                label: address.label || '',
                isDefault: address.isDefault || false,
            })
        } else if (open && !address) {
            setFormData({
                recipientName: '',
                streetAddress: '',
                district: '',
                postalCode: '',
                city: '',
                buildingNumber: '',
                secondaryNumber: '',
                phoneNumber: '',
                label: '',
                isDefault: false,
            })
        }
    }, [open, address])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSave(formData)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? t('addressForm.editTitle') : t('addressForm.addTitle')}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing ? t('addressForm.editDescription') : t('addressForm.addDescription')}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Recipient Name */}
                    <div className="space-y-2">
                        <Label htmlFor="recipientName">{t('addressForm.recipientName')} *</Label>
                        <Input
                            id="recipientName"
                            name="recipientName"
                            value={formData.recipientName}
                            onChange={handleChange}
                            placeholder={t('addressForm.recipientNamePlaceholder')}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">{t('addressForm.phoneNumber')} *</Label>
                        <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder={t('addressForm.phoneNumberPlaceholder')}
                            required
                        />
                    </div>

                    {/* Street Address */}
                    <div className="space-y-2">
                        <Label htmlFor="streetAddress">{t('addressForm.streetAddress')} *</Label>
                        <Input
                            id="streetAddress"
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleChange}
                            placeholder={t('addressForm.streetAddressPlaceholder')}
                            required
                        />
                    </div>

                    {/* District */}
                    <div className="space-y-2">
                        <Label htmlFor="district">{t('addressForm.district')} *</Label>
                        <Input
                            id="district"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            placeholder={t('addressForm.districtPlaceholder')}
                            required
                        />
                    </div>

                    {/* City and Postal Code */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">{t('addressForm.city')} *</Label>
                            <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder={t('addressForm.cityPlaceholder')}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="postalCode">{t('addressForm.postalCode')} *</Label>
                            <Input
                                id="postalCode"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                placeholder={t('addressForm.postalCodePlaceholder')}
                                required
                            />
                        </div>
                    </div>

                    {/* Building and Secondary Number */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="buildingNumber">{t('addressForm.buildingNumber')}</Label>
                            <Input
                                id="buildingNumber"
                                name="buildingNumber"
                                value={formData.buildingNumber}
                                onChange={handleChange}
                                placeholder={t('addressForm.buildingNumberPlaceholder')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="secondaryNumber">{t('addressForm.secondaryNumber')}</Label>
                            <Input
                                id="secondaryNumber"
                                name="secondaryNumber"
                                value={formData.secondaryNumber}
                                onChange={handleChange}
                                placeholder={t('addressForm.secondaryNumberPlaceholder')}
                            />
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">{t('addressForm.phoneNumber')}</Label>
                        <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder={t('addressForm.phoneNumberPlaceholder')}
                        />
                    </div>

                    {/* Label */}
                    <div className="space-y-2">
                        <Label htmlFor="label">{t('addressForm.label')}</Label>
                        <Input
                            id="label"
                            name="label"
                            value={formData.label}
                            onChange={handleChange}
                            placeholder={t('addressForm.labelPlaceholder')}
                        />
                    </div>

                    {/* Set as Default */}
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="isDefault">{t('addressForm.setAsDefault')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t('addressForm.setAsDefaultDescription')}
                            </p>
                        </div>
                        <Switch
                            id="isDefault"
                            checked={formData.isDefault}
                            onCheckedChange={(checked) =>
                                setFormData(prev => ({ ...prev, isDefault: checked }))
                            }
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSaving}
                        >
                            {t('addressForm.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('addressForm.saving')}
                                </>
                            ) : (
                                isEditing ? t('addressForm.update') : t('addressForm.save')
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
