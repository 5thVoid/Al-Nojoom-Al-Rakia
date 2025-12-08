"use client"

import * as React from "react"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/Landing/SearchBar"
import { Cart } from "@/components/Landing/Cart"
import { useTranslations } from "next-intl"
import { useAuth } from "@/context/AuthContext"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"

export function Navbar() {
    const t = useTranslations('Navbar')
    const { isAuthenticated, logout, user } = useAuth()

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/5 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center md:justify-around justify-between px-4 md:px-0">
                {/* Left: Logo */}
                <div className="flex items-center md:px-24">
                    <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
                        <div className="relative h-28 w-28 overflow-hidden rounded-lg">
                            <Image
                                src="/Logo.png"
                                alt="Al-Nojoom Logo"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <span className="hidden font-bold tracking-tight md:inline-block">
                            Al-Nojoom
                        </span>
                    </Link>
                </div>

                {/* Middle: Nav Items */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link
                        href="/"
                    >
                        {t('home')}
                    </Link>
                    <Link
                        href="/products"
                    >
                        {t('products')}
                    </Link>
                    <Link
                        href="/categories"
                    >
                        {t('categories')}
                    </Link>
                    {isAuthenticated && user?.role === 'admin' && (
                        <Link
                            href="/admin-dashboard"
                        >
                            {t('adminDashboard')}
                        </Link>
                    )}
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    <SearchBar />

                    <Cart />

                    <LanguageSwitcher />

                    <div className="hidden items-center gap-2 md:flex ml-2">
                        {isAuthenticated ? (
                            <>
                                <Link href="/profile">
                                    <Button variant="ghost" size="sm">
                                        {t('profile')}
                                    </Button>
                                </Link>
                                <Button variant="ghost" size="sm" onClick={logout}>
                                    {t('logout')}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login">
                                    <Button variant="ghost" size="sm">
                                        {t('login')}
                                    </Button>
                                </Link>
                                <Link href="/auth/signup">
                                    <Button size="sm" className="font-medium">
                                        {t('signup')}
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Trigger */}
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </header>
    )
}
