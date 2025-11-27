import { useState } from "react"
import { X } from "lucide-react"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const suggestions = [
  "Pizza Margherita",
  "Spaghetti Carbonara",
  "Caesar Salad",
  "Grilled Salmon",
  "Cheeseburger",
  "Sushi Combo",
]

export default function SearchSidebar() {
  const [query, setQuery] = useState("")
  const [filtered, setFiltered] = useState<string[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (value.length > 0) {
      setFiltered(suggestions.filter((item) => item.toLowerCase().includes(value.toLowerCase())))
    } else {
      setFiltered([])
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button>🔍</button>
      </SheetTrigger>
      <SheetContent side="top" className="h-64">
        <SheetHeader className="flex items-center justify-between">
          <SheetTitle>Search</SheetTitle>
          <X className="cursor-pointer" />
        </SheetHeader>

        <div className="relative mt-4">
          <Input
            value={query}
            onChange={handleChange}
            placeholder="Search here..."
            className="w-full"
          />
          {filtered.length > 0 && (
            <ul className="absolute left-0 top-full z-10 mt-1 max-h-40 w-full overflow-auto rounded-md bg-white shadow-md">
              {filtered.map((item, idx) => (
                <li
                  key={idx}
                  className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                  onClick={() => setQuery(item)}
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button className="mt-4 w-full">Search</Button>
      </SheetContent>
    </Sheet>
  )
}
