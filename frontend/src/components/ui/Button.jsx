import React from 'react'

export const Button = React.forwardRef(
  ({ className = '', variant = 'primary', children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition'

    const styles = {
      primary: 'bg-black text-white hover:bg-gray-900',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      outline: 'bg-transparent border border-gray-200 text-gray-900 hover:bg-gray-50',
      ghost: 'bg-transparent text-gray-900 hover:bg-gray-50',
    }

    return (
      <button
        ref={ref}
        className={`${base} ${styles[variant] || styles.primary} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
