"use client"

import { useSearchParams } from "next/navigation"
import { AllProducts } from "@/components/Landing/AllProducts"

export default function ProductsPage() {
    const searchParams = useSearchParams()
    const initialSearch = searchParams.get('q') || ''

    return (
        <AllProducts
            initialSearch={initialSearch}
            showSearch={true}
        />
    )
}
