"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useProducts } from "@/hooks/useProducts"
import { useRouter } from "@/i18n/navigation"
import { useParams } from "next/navigation"
import ProductForm from "@/components/admin/ProductForm"
import { Product } from "@/components/products/ProductCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function EditProductPage() {
    const t = useTranslations("Admin.Products")
    const router = useRouter()
    const params = useParams()
    const productId = parseInt(params.id as string)

    const { fetchProductById, updateProduct } = useProducts()
    const [product, setProduct] = useState<Product | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const loadProduct = async () => {
            setIsLoading(true)
            const data = await fetchProductById(productId)
            setProduct(data)
            setIsLoading(false)
        }

        if (productId) {
            loadProduct()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]) // Only re-run when productId changes

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true)
        try {
            const result = await updateProduct(productId, formData)
            if (result) {
                toast.success(t("updateSuccess"))
                router.push("/admin/products")
            } else {
                toast.error(t("updateFailed"))
            }
        } catch (error) {
            console.error("Failed to update product:", error)
            toast.error(t("updateFailed"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        router.push("/admin/products")
    }

    if (isLoading) {
        return (
            <div className="space-y-8 px-24 bg-background max-w-5xl mx-auto">
                <Button variant="ghost" onClick={handleCancel}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t("backToProducts")}
                </Button>
                <div className="space-y-4">
                    <Skeleton className="h-12 w-64" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="space-y-8 px-24 bg-background max-w-5xl mx-auto">
                <Button variant="ghost" onClick={handleCancel}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t("backToProducts")}
                </Button>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-2">{t("productNotFound")}</h2>
                    <p className="text-muted-foreground">{t("productNotFoundDescription")}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 px-24 bg-background max-w-5xl mx-auto">
            <div className="space-y-4">
                <Button variant="ghost" onClick={handleCancel}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t("backToProducts")}
                </Button>

                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("editProduct")}</h1>
                    <p className="text-muted-foreground">{t("editProductDescription")}</p>
                </div>
            </div>

            <ProductForm
                mode="edit"
                initialData={{
                    name: product.name,
                    sku: product.sku || "",
                    price: product.price,
                    manufacturerId: product.manufacturerId?.toString() || "",
                    categoryId: product.categoryId?.toString() || "",
                    productTypeId: product.productTypeId?.toString() || "",
                    quantity: (product.stock ?? product.quantity ?? 0).toString(),
                    specs: typeof product.specs === "string" ? product.specs : JSON.stringify(product.specs || {}),
                }}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={isSubmitting}
                submitLabel={t("updateProduct")}
            />
        </div>
    )
}
