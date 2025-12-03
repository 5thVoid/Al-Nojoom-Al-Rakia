"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { useTranslations } from "next-intl"

export function SearchBar() {
    const [open, setOpen] = React.useState(false)
    const t = useTranslations('Navbar')

    // Toggle command menu with Cmd+K
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setOpen(true)}
            >
                <Search className="h-5 w-5" />
                <span className="sr-only">{t('search')}</span>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder={t('searchPlaceholder')} />
                <CommandList>
                    <CommandEmpty>{t('noResults')}</CommandEmpty>
                    <CommandGroup heading={t('suggestions')}>
                        <CommandItem>
                            <Search className="mr-2 h-4 w-4" />
                            <span>{t('newArrivals')}</span>
                        </CommandItem>
                        <CommandItem>
                            <Search className="mr-2 h-4 w-4" />
                            <span>{t('bestSellers')}</span>
                        </CommandItem>
                        <CommandItem>
                            <Search className="mr-2 h-4 w-4" />
                            <span>{t('electronics')}</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
