"use client"

import * as React from "react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { MapPin, Phone, FileText, Mail } from "lucide-react"

export function Footer() {
    const t = useTranslations('Footer')

    return (
        <footer className="w-full border-t bg-background/50 backdrop-blur-xl">
            <div className="container max-w-screen-2xl px-4 py-12 md:px-8">
                <div className="flex flex-wrap justify-around gap-8 md:gap-12">
                    {/* Brand Section */}
                    <div className="flex flex-col items-start gap-4 max-w-sm">
                        <div className="flex items-center gap-2">
                            <div className="relative h-28 w-28 overflow-hidden rounded-lg">
                                <Image
                                    src="/Logo.png"
                                    alt="Al-Nojoom Logo"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <span className="text-xl font-bold tracking-tight">
                                {t('companyName')}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {t('description')}
                        </p>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col gap-3">
                        <h3 className="font-semibold text-foreground">{t('contact')}</h3>
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                            <div className="flex flex-col gap-1">
                                <span>{t('address')}</span>
                                <span>{t('pobox')}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4 shrink-0" />
                            <span>{t('contacts')}</span>
                        </div>
                    </div>

                    {/* Legal Info */}
                    <div className="flex flex-col gap-3">
                        <h3 className="font-semibold text-foreground">{t('legal')}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4 shrink-0" />
                            <span>{t('cr')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4 shrink-0" />
                            <span>{t('cc')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4 shrink-0" />
                            <span>{t('vat')}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
                    <p>{t('rights')}</p>
                </div>
            </div>
        </footer>
    )
}
