"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useProducts } from "@/hooks/useProducts"
import { useRouter } from "@/i18n/navigation"
import AdminProductCard from "@/components/admin/AdminProductCard"
import StatsCardSkeleton from "@/components/admin/StatsCardSkeleton"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export default function AdminProductsPage() {
    const t = useTranslations("Admin.Products")
    const router = useRouter()
    const { products, isLoading, deleteProduct, pagination, goToPage, hasNextPage, hasPreviousPage } = useProducts()

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState<number | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDeleteClick = (productId: number) => {
        setProductToDelete(productId)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!productToDelete) return

        setIsDeleting(true)
        try {
            const success = await deleteProduct(productToDelete)
            if (success) {
                toast.success(t("deleteSuccess"))
                setDeleteDialogOpen(false)
                setProductToDelete(null)
            } else {
                toast.error(t("deleteFailed"))
            }
        } catch (error) {
            toast.error(t("deleteFailed"))
        } finally {
            setIsDeleting(false)
        }
    }

    const handleCreateProduct = () => {
        router.push("/admin/products/create")
    }

    if (isLoading) {
        return (
            <div className="space-y-8 px-24 bg-background">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                        <p className="text-muted-foreground">{t("description")}</p>
                    </div>
                    <Button disabled>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("createProduct")}
                    </Button>
                </div>
                <StatsCardSkeleton count={3} columns="3" />
            </div>
        )
    }

    return (
        <div className="space-y-8 px-24 bg-background">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                    <p className="text-muted-foreground">{t("description")}</p>
                </div>
                <Button onClick={handleCreateProduct}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("createProduct")}
                </Button>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">{t("noProducts")}</p>
                    <Button onClick={handleCreateProduct}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("createFirstProduct")}
                    </Button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <AdminProductCard
                                key={product.id}
                                product={product}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {t("showingResults", {
                                    from: (pagination.currentPage - 1) * pagination.itemsPerPage + 1,
                                    to: Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems),
                                    total: pagination.totalItems,
                                })}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(pagination.currentPage - 1)}
                                    disabled={!hasPreviousPage}
                                >
                                    {t("previous")}
                                </Button>
                                <span className="text-sm">
                                    {t("pageOf", {
                                        current: pagination.currentPage,
                                        total: pagination.totalPages,
                                    })}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(pagination.currentPage + 1)}
                                    disabled={!hasNextPage}
                                >
                                    {t("next")}
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("deleteProduct")}</DialogTitle>
                        <DialogDescription>{t("deleteConfirmation")}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? t("deleting") : t("delete")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
