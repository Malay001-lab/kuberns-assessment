import React from 'react'

export const Card = ({ className = '', children, ...props }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  )
}

export const CardHeader = ({ title = '', subtitle = '', className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
    <div className="flex items-center justify-between">
      <div>
        {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
    </div>
  </div>
)

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
)
export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t ${className}`}>{children}</div>
)
