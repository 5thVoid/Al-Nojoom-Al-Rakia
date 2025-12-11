"use client"

import { useState, FormEvent, ChangeEvent, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface Category {
    id: number
    name: string
}

interface Manufacturer {
    id: number
    name: string
}

interface ProductType {
    id: number
    name: string
}

interface ProductFormData {
    name: string
    sku: string
    price: string
    manufacturerId: string
    categoryId: string
    productTypeId: string
    initialStock?: string
    quantity?: string
    specs: string
    image: File | null
}

interface ProductFormProps {
    initialData?: Partial<ProductFormData>
    onSubmit: (formData: FormData) => Promise<void>
    onCancel: () => void
    isLoading?: boolean
    submitLabel?: string
    mode?: 'create' | 'edit'
}

export default function ProductForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    submitLabel,
    mode = 'create',
}: ProductFormProps) {
    const t = useTranslations("Admin.Products")

    const [formData, setFormData] = useState<ProductFormData>({
        name: initialData?.name || "",
        sku: initialData?.sku || "",
        price: initialData?.price || "",
        manufacturerId: initialData?.manufacturerId || "",
        categoryId: initialData?.categoryId || "",
        productTypeId: initialData?.productTypeId || "",
        initialStock: mode === 'create' ? (initialData?.initialStock || "") : undefined,
        quantity: mode === 'edit' ? (initialData?.quantity || "") : undefined,
        specs: initialData?.specs || "{}",
        image: null,
    })

    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [categories, setCategories] = useState<Category[]>([])
    const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
    const [productTypes, setProductTypes] = useState<ProductType[]>([])
    const [loadingData, setLoadingData] = useState(true)

    // Fetch categories, manufacturers, and product types
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, manufacturersRes, productTypesRes] = await Promise.all([
                    fetch("/api/categories?limit=100"),
                    fetch("/api/manufacturers?limit=100"),
                    fetch("/api/productTypes"),
                ])

                const [categoriesData, manufacturersData, productTypesData] = await Promise.all([
                    categoriesRes.json(),
                    manufacturersRes.json(),
                    productTypesRes.json(),
                ])

                setCategories(categoriesData.data || categoriesData || [])
                setManufacturers(manufacturersData.data || manufacturersData || [])
                setProductTypes(productTypesData.data || productTypesData || [])
            } catch (error) {
                console.error("Failed to fetch form data:", error)
            } finally {
                setLoadingData(false)
            }
        }

        fetchData()
    }, [])

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFormData(prev => ({ ...prev, image: file }))
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setFormData(prev => ({ ...prev, image: null }))
        setImagePreview(null)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        // Validate JSON specs
        try {
            JSON.parse(formData.specs)
        } catch {
            alert(t("invalidSpecsFormat"))
            return
        }

        // Create FormData
        const submitData = new FormData()
        submitData.append("name", formData.name)
        submitData.append("sku", formData.sku)
        submitData.append("price", formData.price)
        submitData.append("manufacturerId", formData.manufacturerId)
        submitData.append("categoryId", formData.categoryId)
        submitData.append("productTypeId", formData.productTypeId)

        // Use initialStock for create, quantity for edit
        if (mode === 'create' && formData.initialStock) {
            submitData.append("initialStock", formData.initialStock)
        } else if (mode === 'edit' && formData.quantity) {
            submitData.append("quantity", formData.quantity)
        }

        submitData.append("specs", formData.specs)

        if (formData.image) {
            submitData.append("image", formData.image)
        }

        await onSubmit(submitData)
    }

    if (loadingData) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">{t("loadingForm")}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>{submitLabel || t("productDetails")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t("productName")} *</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                placeholder={t("productNamePlaceholder")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sku">{t("sku")} *</Label>
                            <Input
                                id="sku"
                                name="sku"
                                value={formData.sku}
                                onChange={handleInputChange}
                                required
                                placeholder={t("skuPlaceholder")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">{t("price")} *</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={handleInputChange}
                                required
                                placeholder={t("pricePlaceholder")}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={mode === 'create' ? 'initialStock' : 'quantity'}>
                                {mode === 'create' ? t("initialStock") : t("quantity")} *
                            </Label>
                            <Input
                                id={mode === 'create' ? 'initialStock' : 'quantity'}
                                name={mode === 'create' ? 'initialStock' : 'quantity'}
                                type="number"
                                min="0"
                                value={mode === 'create' ? formData.initialStock : formData.quantity}
                                onChange={handleInputChange}
                                required
                                placeholder={mode === 'create' ? t("initialStockPlaceholder") : t("quantityPlaceholder")}
                            />
                        </div>
                    </div>

                    {/* Category, Manufacturer, Product Type */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="categoryId">{t("category")} *</Label>
                            <Select
                                value={formData.categoryId}
                                onValueChange={(value) => handleSelectChange("categoryId", value)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("selectCategory")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="manufacturerId">{t("manufacturer")} *</Label>
                            <Select
                                value={formData.manufacturerId}
                                onValueChange={(value) => handleSelectChange("manufacturerId", value)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("selectManufacturer")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {manufacturers.map((manufacturer) => (
                                        <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                                            {manufacturer.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="productTypeId">{t("productType")} *</Label>
                            <Select
                                value={formData.productTypeId}
                                onValueChange={(value) => handleSelectChange("productTypeId", value)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("selectProductType")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {productTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Specs */}
                    <div className="space-y-2">
                        <Label htmlFor="specs">{t("specs")}</Label>
                        <Textarea
                            id="specs"
                            name="specs"
                            value={formData.specs}
                            onChange={handleInputChange}
                            placeholder={t("specsPlaceholder")}
                            rows={4}
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">{t("specsHelp")}</p>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label>{t("productImage")}</Label>
                        {imagePreview ? (
                            <div className="relative w-full h-64 border rounded-lg overflow-hidden">
                                <Image
                                    src={imagePreview}
                                    alt="Preview"
                                    fill
                                    className="object-contain"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={removeImage}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed rounded-lg p-8 text-center">
                                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <Label
                                    htmlFor="image"
                                    className="cursor-pointer text-primary hover:underline"
                                >
                                    {t("uploadImage")}
                                </Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 justify-end pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            {t("cancel")}
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? t("submitting") : (submitLabel || t("submit"))}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    )
}
