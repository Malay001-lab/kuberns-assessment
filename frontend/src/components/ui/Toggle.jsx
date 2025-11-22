import React from 'react'
import { motion } from 'framer-motion'

export const Toggle = ({ checked = false, onChange = () => {}, label = '', disabled = false }) => {
  const handle = (e) => {
    e.stopPropagation()
    if (!disabled) onChange(!checked)
  }

  return (
    <div className="flex items-center gap-3">
      <motion.button
        onClick={handle}
        type="button"
        className={`relative w-14 h-8 rounded-full ${checked ? 'bg-black' : 'bg-gray-300'} ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        }`}
        whileTap={{ scale: 0.96 }}
      >
        <motion.span
          className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow"
          animate={{ x: checked ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        />
      </motion.button>

      {label && (
        <button type="button" onClick={handle} className="text-sm font-medium text-gray-700">
          {label}
        </button>
      )}
    </div>
  )
}
