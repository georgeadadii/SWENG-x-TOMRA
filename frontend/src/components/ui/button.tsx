import type React from "react"
import type { ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
  size?: "default" | "icon"
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "default",
  size = "default",
  ...props
}) => {
  const baseStyles =
    "font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105"
  const variantStyles = {
    default:
      "bg-purple-700 text-white border-2 border-white hover:bg-purple-600 hover:text-white shadow-lg hover:shadow-purple-500/50",
    outline: "border-2 border-white text-white hover:bg-white/20 hover:text-white shadow-lg hover:shadow-purple-500/50",
  }
  const sizeStyles = {
    default: "px-6 py-3 text-lg",
    icon: "p-3",
  }

  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  )
}

