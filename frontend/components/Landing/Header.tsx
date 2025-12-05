"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"

export function Header() {
    const t = useTranslations('Footer')

    return (
        <section className="flex min-h-[60vh] items-center justify-center">
            <Card className="max-w-2xl border-none bg-transparent shadow-none">
                <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
                    <div className="relative h-48 w-48 overflow-hidden rounded-2xl shadow-lg transition-transform hover:scale-105">
                        <Image
                            src="/Logo.png"
                            alt={t('companyName')}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                            {t('companyName')}
                        </h1>

                        <p className="text-lg text-muted-foreground md:text-xl">
                            {t('description')}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </section>
    )
}
