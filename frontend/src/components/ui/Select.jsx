import React from 'react'

export const Select = React.forwardRef(
  ({ className = '', label = '', error = '', options = [], value, onChange, ...props }, ref) => {
    const normalized =
      options && options.length && options[0].value === ''
        ? options
        : [{ value: '', label: 'Select an option' }, ...(options || [])]

    return (
      <div className={className}>
        {label && <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>}
        <select
          ref={ref}
          value={value}
          onChange={onChange}
          {...props}
          className={`w-full px-3 py-2 border rounded-md text-sm transition ${
            error ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-gray-100'
          }`}
        >
          {normalized.map((o) => (
            <option key={`${o.value}-${o.label}`} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
