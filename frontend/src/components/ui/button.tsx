import type React from "react"
import type { ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
  size?: "default" | "icon"
  hoverEffect?: "none" | "red" | "green"
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "default",
  size = "default",
  hoverEffect = "none",
  ...props
}) => {
  const baseStyles =
    "font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300 transform hover:scale-105"
  const variantStyles = {
    default: "bg-gray-800 text-white hover:bg-gray-700 shadow-md",
    outline: "border-2 border-gray-300 text-gray-800 hover:bg-gray-100 shadow-md",
  }
  const sizeStyles = {
    default: "px-6 py-3 text-lg",
    icon: "p-3",
  }
  const hoverStyles = {
    none: "",
    red: "hover:bg-red-50 hover:border-red-500 hover:text-red-600 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]",
    green: "hover:bg-green-50 hover:border-green-500 hover:text-green-600 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]",
  }

  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${hoverStyles[hoverEffect]} ${className}`

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  )
}

