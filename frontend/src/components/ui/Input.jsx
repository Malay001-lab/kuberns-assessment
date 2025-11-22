import React from 'react'

export const Input = React.forwardRef(
  ({ className = '', label = '', error = '', ...props }, ref) => {
    return (
      <div className={`w-full ${className}`}>
        {label && <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>}
        <input
          ref={ref}
          {...props}
          className={`w-full px-3 py-2 border rounded-md text-sm transition ${
            error
              ? 'border-red-500 ring-red-50 focus:ring-2'
              : 'border-gray-300 focus:ring-2 focus:ring-gray-100'
          }`}
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
