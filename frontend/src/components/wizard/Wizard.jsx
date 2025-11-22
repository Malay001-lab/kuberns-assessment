import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWizardStore } from '@/store/wizardStore'
import { Zap } from 'lucide-react'
import Page1 from './Page1'
import Page2 from './Page2'
import Page3 from './Page3'

export default function Wizard() {
  const currentPage = useWizardStore((s) => s.currentPage)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto py-12 px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-black text-white rounded-full p-2">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New App</h1>
              <p className="text-sm text-gray-600">Set up your application in a few steps</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-sm text-gray-500">Step {currentPage} of 3</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
          <AnimatePresence mode="wait">
            {currentPage === 1 && <Page1 key="page1" />}
            {currentPage === 2 && <Page2 key="page2" />}
            {currentPage === 3 && <Page3 key="page3" />}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Powered by Kuberns — local deploy simulation
        </p>
      </div>
    </div>
  )
}
