import { useTranslations } from "next-intl"
import { ArrowLeft, FileText, Shield, AlertCircle, Scale } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"

export default function TermsAndConditionsPage() {
    const t = useTranslations('TermsConditions')

    return (
        <div className="min-h-screen bg-background px-24">
            <div className="max-w-4xl px-4 py-12 md:py-16 mx-24">
                {/* Back Button */}
                <Link href="/">
                    <Button variant="ghost" className="mb-8 gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        {t('back')}
                    </Button>
                </Link>

                {/* Header */}
                <div className="mb-12 space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                        {t('title')}
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        {t('subtitle')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {t('lastUpdated')}
                    </p>
                </div>

                {/* Terms Sections */}
                <div className="space-y-12">
                    {/* Acceptance of Terms */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-2xl font-semibold text-foreground">
                                {t('acceptance.title')}
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p className="text-base">{t('acceptance.content1')}</p>
                            <p className="text-base">{t('acceptance.content2')}</p>
                        </div>
                    </section>

                    {/* Use of Services */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-2xl font-semibold text-foreground">
                                {t('useOfServices.title')}
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p className="text-base">{t('useOfServices.intro')}</p>
                            <div className="rounded-lg border bg-card p-6 space-y-3">
                                <h3 className="font-semibold text-foreground">
                                    {t('useOfServices.rulesTitle')}
                                </h3>
                                <ul className="space-y-2 list-disc list-inside ml-7">
                                    <li>{t('useOfServices.rule1')}</li>
                                    <li>{t('useOfServices.rule2')}</li>
                                    <li>{t('useOfServices.rule3')}</li>
                                    <li>{t('useOfServices.rule4')}</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Products and Orders */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <AlertCircle className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-2xl font-semibold text-foreground">
                                {t('products.title')}
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p className="text-base">{t('products.content1')}</p>
                            <p className="text-base">{t('products.content2')}</p>
                            <p className="text-base">{t('products.content3')}</p>
                        </div>
                    </section>

                    {/* Intellectual Property */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Scale className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-2xl font-semibold text-foreground">
                                {t('intellectual.title')}
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p className="text-base">{t('intellectual.content1')}</p>
                            <p className="text-base">{t('intellectual.content2')}</p>
                        </div>
                    </section>

                    {/* Limitation of Liability */}
                    <section className="space-y-6">
                        <div className="rounded-lg border bg-card p-6 space-y-4">
                            <h2 className="text-xl font-semibold text-foreground">
                                {t('liability.title')}
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {t('liability.content')}
                            </p>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section className="rounded-lg border bg-primary/5 p-8 text-center space-y-4">
                        <h2 className="text-2xl font-semibold text-foreground">
                            {t('contact.title')}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            {t('contact.description')}
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
