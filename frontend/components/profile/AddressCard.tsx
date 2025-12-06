"use client"

import { useTranslations } from "next-intl"
import { Address } from "@/hooks/useUser"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, Star, MapPin, Phone, Building } from "lucide-react"

interface AddressCardProps {
    address: Address
    onEdit: () => void
    onDelete: () => void
    onSetDefault: () => void
}

export function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
    const t = useTranslations('Profile')

    return (
        <Card className={`relative ${address.isDefault ? 'ring-2 ring-primary' : ''}`}>
            <CardContent className="p-4">
                {/* Header with label and menu */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {address.label && (
                            <Badge variant={address.isDefault ? "default" : "secondary"}>
                                {address.label}
                            </Badge>
                        )}
                        {address.isDefault && (
                            <Badge variant="outline" className="text-primary border-primary">
                                <Star className="h-3 w-3 mr-1 fill-primary" />
                                {t('address.default')}
                            </Badge>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}>
                                <Edit className="h-4 w-4 mr-2" />
                                {t('address.edit')}
                            </DropdownMenuItem>
                            {!address.isDefault && (
                                <DropdownMenuItem onClick={onSetDefault}>
                                    <Star className="h-4 w-4 mr-2" />
                                    {t('address.setDefault')}
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={onDelete}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('address.delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
