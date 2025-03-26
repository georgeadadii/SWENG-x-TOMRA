import React, { forwardRef, ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "purple" | "red" | "green"
  size?: "default" | "icon"
  hoverEffect?: "none" | "red" | "green" | "purple"
  asChild?: boolean
  className?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className = "",
  variant = "default",
  size = "default",
  hoverEffect = "none",
  asChild = false,
  ...props }, ref) => {
  
  const baseStyles = 
    "font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300 transform hover:scale-105"
  
  const variantStyles = {
    default: "bg-gray-800 text-white hover:bg-gray-700 shadow-md",
    outline: "border-2 border-gray-300 text-gray-800 hover:bg-gray-100 shadow-md",
    ghost: "bg-transparent border-none shadow-none hover:bg-gray-100/10",
    purple: "bg-transparent border border-purple-300/40 text-purple-200 rounded-full shadow-sm",
    red: "bg-transparent border border-red-400/30 text-red-200 rounded-full shadow-sm",
    green: "bg-transparent border border-green-400/30 text-green-200 rounded-full shadow-sm"
  }
  
  const sizeStyles = {
    default: "px-6 py-3 text-lg",
    icon: "p-3",
  }
  
  const hoverStyles = {
    none: "",
    red: "hover:bg-red-400/20 hover:border-red-400 hover:shadow-[0_0_15px_rgba(248,113,113,0.4)]",
    green: "hover:bg-green-400/20 hover:border-green-400 hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]",
    purple: "hover:bg-purple-400/10 hover:border-purple-300",
  }
  
  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${hoverStyles[hoverEffect]} ${className}`
  
  return (
    <button ref={ref} className={buttonClasses} {...props}>
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export default Button