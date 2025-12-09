import { useTranslations } from "next-intl"
import { ArrowLeft, Lock, Eye, Database, UserCheck, Shield } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"

export default function PrivacyPolicyPage() {
    const t = useTranslations('PrivacyPolicy')

    return (
        <div className="min-h-screen bg-background">
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

                {/* Privacy Sections */}
                <div className="space-y-12">
                    {/* Information Collection */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Database className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-2xl font-semibold text-foreground">
                                {t('collection.title')}
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p className="text-base">{t('collection.intro')}</p>
                            <div className="rounded-lg border bg-card p-6 space-y-3">
                                <h3 className="font-semibold text-foreground">
                                    {t('collection.typesTitle')}
                                </h3>
                                <ul className="space-y-2 list-disc list-inside ml-7">
                                    <li>{t('collection.type1')}</li>
                                    <li>{t('collection.type2')}</li>
                                    <li>{t('collection.type3')}</li>
                                    <li>{t('collection.type4')}</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* How We Use Information */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Eye className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-2xl font-semibold text-foreground">
                                {t('usage.title')}
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p className="text-base">{t('usage.intro')}</p>
                            <div className="rounded-lg border bg-card p-6 space-y-3">
                                <ul className="space-y-2 list-disc list-inside ml-7">
                                    <li>{t('usage.purpose1')}</li>
                                    <li>{t('usage.purpose2')}</li>
                                    <li>{t('usage.purpose3')}</li>
                                    <li>{t('usage.purpose4')}</li>
                                    <li>{t('usage.purpose5')}</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Data Protection */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Lock className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-2xl font-semibold text-foreground">
                                {t('protection.title')}
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p className="text-base">{t('protection.content1')}</p>
                            <p className="text-base">{t('protection.content2')}</p>
                        </div>
                    </section>

                    {/* Your Rights */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <UserCheck className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-2xl font-semibold text-foreground">
                                {t('rights.title')}
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p className="text-base">{t('rights.intro')}</p>
                            <div className="rounded-lg border bg-card p-6 space-y-3">
                                <ul className="space-y-2 list-disc list-inside ml-7">
                                    <li>{t('rights.right1')}</li>
                                    <li>{t('rights.right2')}</li>
                                    <li>{t('rights.right3')}</li>
                                    <li>{t('rights.right4')}</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Cookies */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-2xl font-semibold text-foreground">
                                {t('cookies.title')}
                            </h2>
                        </div>
                        <div className="space-y-4 text-muted-foreground leading-relaxed">
                            <p className="text-base">{t('cookies.content')}</p>
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
