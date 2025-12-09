import { useTranslations } from 'next-intl'

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome to the admin panel. Use the sidebar to navigate between different sections.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Dashboard cards placeholder */}
                {[
                    { title: 'Total Users', value: '0', description: 'Active users in the system' },
                    { title: 'Total Orders', value: '0', description: 'Orders placed this month' },
                    { title: 'Total Products', value: '0', description: 'Products in inventory' },
                    { title: 'Revenue', value: 'SAR 0', description: 'Total revenue this month' },
                ].map((stat) => (
                    <div
                        key={stat.title}
                        className="rounded-lg border bg-card p-6 shadow-sm"
                    >
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
