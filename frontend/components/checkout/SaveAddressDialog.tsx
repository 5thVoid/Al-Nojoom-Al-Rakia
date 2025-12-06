"use client"

import { useTranslations } from "next-intl"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface SaveAddressDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    onCancel: () => void
    isLoading?: boolean
}

export function SaveAddressDialog({
    open,
    onOpenChange,
    onConfirm,
    onCancel,
    isLoading = false,
}: SaveAddressDialogProps) {
    const t = useTranslations('Checkout')

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('saveAddress.title')}</DialogTitle>
                    <DialogDescription>
                        {t('saveAddress.description')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {t('saveAddress.no')}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('saveAddress.saving')}
                            </>
                        ) : (
                            t('saveAddress.yes')
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
