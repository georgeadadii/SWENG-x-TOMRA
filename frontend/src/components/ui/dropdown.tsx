"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Dropdown({ trigger, children, className }: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          setPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX })
          setIsOpen(!isOpen)
        }}
      >
        {trigger}
      </div>
      {isOpen && (
        <div
          className={cn("fixed z-50 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5", className)}
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export function DropdownItem({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <a
      href="#"
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      role="menuitem"
      onClick={(e) => {
        e.preventDefault()
        onClick && onClick()
      }}
    >
      {children}
    </a>
  )
}