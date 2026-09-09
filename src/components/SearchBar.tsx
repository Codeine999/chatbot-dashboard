import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
} from "lucide-react"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { useTranslation } from "react-i18next"

const SearchBar = () => {
    const { t } = useTranslation();

    return (

        <div className="relative md:w-[400px]">
            <Command className="h-10 rounded-lg border bg-background  shadow-xs">
                <CommandInput
                    placeholder={t("search.placeholder")}
                />
            </Command>

            {/* Shortcut text */}

            <div className="absolute right-4 top-1/2 -translate-y-1/2  text-normal">
                <span className="text-xs">⌘K</span>
            </div>

        </div>

    )
}

export default SearchBar