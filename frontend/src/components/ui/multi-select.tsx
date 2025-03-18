"use client"

import * as React from "react"
import { X } from 'lucide-react'
import { Box } from "./box"
import { Dropdown, DropdownItem } from "./dropdown"
import { cn } from "@/lib/utils"

export type Option = {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  selected: Option[]
  onChange: (options: Option[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
}: MultiSelectProps) {
  const [searchTerm, setSearchTerm] = React.useState("")

  const handleUnselect = (option: Option, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter((s) => s.value !== option.value))
  }

  const handleSelect = (option: Option) => {
    if (selected.some((s) => s.value === option.value)) {
      onChange(selected.filter((s) => s.value !== option.value))
    } else {
      onChange([...selected, option])
    }
  }

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selected.some((s) => s.value === option.value)
  )

  return (
    <Dropdown
      trigger={
        <Box
          variant="outline"
          role="combobox"
          aria-expanded="true"
          className={`w-full justify-between ${selected.length > 0 ? 'h-full min-h-[2.5rem]' : 'h-10'} ${className}`}
        >
          <div className="flex flex-wrap gap-1">
            {selected.length > 0 ? (
              selected.map((option) => (
                <span key={option.value} className="bg-secondary text-secondary-foreground rounded-full px-2 py-1 text-sm flex items-center">
                  {option.label}
                  <span
                    role="button"
                    tabIndex={0}
                    className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                    onClick={(e) => handleUnselect(option, e)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleUnselect(option, e as unknown as React.MouseEvent)
                      }
                    }}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </span>
                </span>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <span className="shrink-0 opacity-50">▼</span>
        </Box>
      }
      className="w-full p-0"
    >
      <div className="p-2">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="max-h-60 overflow-auto">
        {filteredOptions.length === 0 ? (
          <div className="p-2 text-sm text-gray-500">No results found</div>
        ) : (
          filteredOptions.map((option) => (
            <DropdownItem key={option.value} onClick={() => handleSelect(option)}>
              {option.label}
            </DropdownItem>
          ))
        )}
      </div>
    </Dropdown>
  )
}