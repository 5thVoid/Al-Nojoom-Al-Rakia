"use client"

import * as React from "react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { MapPin, Phone, FileText, Mail } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export function Footer() {
    const t = useTranslations('Footer')
    const { isAuthenticated } = useAuth()

    return (
        <footer className="w-full border-t bg-background/50 backdrop-blur-xl px-38">
            <div className="container max-w-screen-2xl px-4 py-12 md:px-8">
                {/* New Sections: Compliance Links and Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 pb-12 border-b">
                    {/* Brand Section */}
                    <div className="flex flex-col items-start gap-4">
                        <div className="flex items-center gap-2">
                            <div className="relative h-20 w-20 overflow-hidden rounded-lg">
                                <Image
                                    src="/Logo.png"
                                    alt="Al-Nojoom Logo"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <span className="text-lg font-bold tracking-tight">
                                {t('companyName')}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {t('description')}
                        </p>
                    </div>

                    {/* Compliance Links */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-foreground text-lg">
                            {t('complianceLinks')}
                        </h3>
                        <nav className="flex flex-col gap-2.5">
                            <Link
                                href="/returns-exchanges"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                {t('returnsExchanges')}
                            </Link>
                            <Link
                                href="/terms-and-conditions"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                {t('termsConditions')}
                            </Link>
                            <Link
                                href="/privacy-policy"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                {t('privacyPolicy')}
                            </Link>
                            <Link
                                href="/about-us"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                {t('aboutUs')}
                            </Link>
                            <Link
                                href="/warranty-maintenance"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                {t('warrantyMaintenance')}
                            </Link>
                        </nav>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-foreground text-lg">
                            {t('quickLinks')}
                        </h3>
                        <nav className="flex flex-col gap-2.5">
                            <Link
                                href="/"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                {t('home')}
                            </Link>
                            <Link
                                href="/products"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                {t('products')}
                            </Link>
                            <Link
                                href="/categories"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                {t('categories')}
                            </Link>
                            {isAuthenticated && (
                                <Link
                                    href="/profile"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {t('profile')}
                                </Link>
                            )}
                            <Link
                                href="/about-us"
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                {t('aboutUs')}
                            </Link>
                        </nav>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-foreground text-lg">{t('contact')}</h3>
                        <div className="flex flex-col gap-3">
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
                    </div>
                </div>

                {/* Legal Info Section */}
                <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
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

                {/* Copyright */}
                <div className="border-t pt-8 text-center text-sm text-muted-foreground">
                    <p>{t('rights')}</p>
                </div>
            </div>
        </footer>
    )
}
