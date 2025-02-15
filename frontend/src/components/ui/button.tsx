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
    const baseStyles = "font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    const variantStyles = {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    }
    const sizeStyles = {
        default: "px-4 py-2",
        icon: "p-2",
    }

    const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

    return (
        <button className={buttonClasses} {...props}>
            {children}
        </button>
    )
}

