"use client"

import { useTranslations } from 'next-intl'
import { useAdmin } from '@/hooks/useAdmin'
import { Users, ShoppingCart, Package, DollarSign } from 'lucide-react'
import StatsCardSkeleton from '@/components/admin/StatsCardSkeleton'

export default function AdminDashboard() {
    const t = useTranslations('Admin.Dashboard')
    const { users, isLoading, pagination, stats, isStatsLoading } = useAdmin()

    const statsCards = [
        {
            title: t('totalUsers'),
            value: pagination.totalItems.toString(),
            description: t('activeUsersDescription'),
            icon: Users,
            iconColor: 'text-blue-500',
        },
        {
            title: t('totalOrders'),
            value: stats?.totalOrders.toString() || '0',
            description: t('ordersThisMonth'),
            icon: ShoppingCart,
            iconColor: 'text-green-500',
        },
        {
            title: t('totalProducts'),
            value: stats?.totalProducts.toString() || '0',
            description: t('productsInInventory'),
            icon: Package,
            iconColor: 'text-purple-500',
        },
        {
            title: t('revenue'),
            value: stats?.totalRevenue ? `SAR ${stats.totalRevenue.toLocaleString()}` : 'SAR 0',
            description: t('revenueThisMonth'),
            icon: DollarSign,
            iconColor: 'text-yellow-500',
        },
    ]

    return (
        <div className="space-y-8 px-24 bg-background">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">
                    {t('description')}
                </p>
            </div>

            {isLoading || isStatsLoading ? (
                <StatsCardSkeleton count={4} columns="4" />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statsCards.map((stat) => {
                        const Icon = stat.icon
                        return (
                            <div
                                key={stat.title}
                                className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between space-y-0 pb-2">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </p>
                                    <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
