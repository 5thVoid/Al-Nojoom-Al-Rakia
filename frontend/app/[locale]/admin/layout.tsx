import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar />
            <main className="flex-1 lg:ps-0">
                <div className="container max-w-screen-2xl p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
