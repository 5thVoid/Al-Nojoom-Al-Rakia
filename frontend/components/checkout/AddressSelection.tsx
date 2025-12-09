"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Address } from "@/hooks/useUser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Phone, Building, Star, Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddressSelectionProps {
    addresses: Address[]
    selectedAddressId: number | null
    onSelectAddress: (address: Address) => void
    onAddNewAddress: () => void
    isLoading?: boolean
}

export function AddressSelection({
    addresses,
    selectedAddressId,
    onSelectAddress,
    onAddNewAddress,
    isLoading = false,
}: AddressSelectionProps) {
    const t = useTranslations('Checkout')

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('addressSelection.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[1, 2].map((i) => (
                            <div key={i} className="p-4 border rounded-lg">
                                <Skeleton className="h-4 w-1/3 mb-2" />
                                <Skeleton className="h-4 w-2/3 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {t('addressSelection.title')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {addresses.length === 0 ? (
                    <div className="text-center py-8">
                        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">
                            {t('addressSelection.noAddresses')}
                        </p>
                        <Button onClick={onAddNewAddress}>
                            <Plus className="h-4 w-4 mr-2" />
                            {t('addressSelection.addAddress')}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {addresses.map((address) => (
                                <SelectableAddressCard
                                    key={address.id}
                                    address={address}
                                    isSelected={selectedAddressId === address.id}
                                    onSelect={() => onSelectAddress(address)}
                                />
                            ))}
                        </div>
                        <div className="pt-4 border-t">
                            <Button variant="outline" onClick={onAddNewAddress} className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                {t('addressSelection.addNewAddress')}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

interface SelectableAddressCardProps {
    address: Address
    isSelected: boolean
    onSelect: () => void
}

function SelectableAddressCard({ address, isSelected, onSelect }: SelectableAddressCardProps) {
    const t = useTranslations('Checkout')

    return (
        <Card
            className={cn(
                "relative cursor-pointer bg-card transition-all hover:border-primary/50",
                isSelected && "ring-2 ring-primary border-primary bg-primary/5"
            )}
            onClick={onSelect}
        >
            <CardContent className="p-4">
                {/* Selection indicator */}
                <div className={cn(
                    "absolute top-3 right-3 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                    isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground/30"
                )}>
                    {isSelected && <Check className="h-4 w-4" />}
                </div>

                {/* Header with label */}
                <div className="flex items-center gap-2 mb-3 pr-8">
                    {address.label && (
                        <Badge variant={isSelected ? "default" : "secondary"}>
                            {address.label}
                        </Badge>
                    )}
                    {address.isDefault && (
                        <Badge variant="outline" className="text-primary border-primary">
                            <Star className="h-3 w-3 mr-1 fill-primary" />
                            {t('addressSelection.default')}
                        </Badge>
                    )}
                </div>

                {/* Recipient Name */}
                <h4 className="font-semibold mb-2">{address.recipientName}</h4>

                {/* Address Details */}
                <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                            <p>{address.streetAddress}</p>
                            {address.district && <p>{address.district}</p>}
                            <p>
                                {address.city}
                                {address.postalCode && `, ${address.postalCode}`}
                            </p>
                        </div>
                    </div>

                    {(address.buildingNumber || address.secondaryNumber) && (
                        <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 flex-shrink-0" />
                            <p>
                                {address.buildingNumber && `Bldg: ${address.buildingNumber}`}
                                {address.buildingNumber && address.secondaryNumber && ' • '}
                                {address.secondaryNumber && `Unit: ${address.secondaryNumber}`}
                            </p>
                        </div>
                    )}

                    {address.phoneNumber && (
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <p>{address.phoneNumber}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
