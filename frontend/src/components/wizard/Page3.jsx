import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useWizardStore } from '@/store/wizardStore'
import { webAppAPI } from '@/api/webappAPI'
import { CheckCircle, Loader2, XCircle, Server, Terminal } from 'lucide-react'

export default function Page3() {
  const store = useWizardStore()
  const id = store.deploymentId

  const [status, setStatus] = useState('pending')
  const [logs, setLogs] = useState([])
  const [ip, setIp] = useState(null)

  useEffect(() => {
    if (!id) return

    const interval = setInterval(() => {
      loadStatus()
      loadLogs()
    }, 2000)

    loadStatus()
    loadLogs()

    return () => clearInterval(interval)
  }, [id])

  const loadStatus = async () => {
    try {
      const res = await webAppAPI.getWebAppStatus(id)
      setStatus(res.instance_status)
      setIp(res.public_ip)
    } catch (err) {
      console.error('STATUS ERROR:', err)
    }
  }

  const loadLogs = async () => {
    try {
      const res = await webAppAPI.getWebAppLogs(id)
      setLogs(res.logs)
    } catch (err) {
      console.error('LOGS ERROR:', err)
    }
  }

  const steps = [
    { id: 'pending', label: 'Waiting', icon: Loader2 },
    { id: 'deploying', label: 'Deploying', icon: Server },
    { id: 'active', label: 'Active', icon: CheckCircle },
    { id: 'failed', label: 'Failed', icon: XCircle },
  ]

  const currentIndex = steps.findIndex((s) => s.id === status)

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900 text-center">Deployment Status</h2>
      <p className="text-center text-gray-500 mb-6">Tracking deployment of {store.appName}</p>

      {/* Progress bar */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const Icon = step.icon
          const active = index <= currentIndex

          return (
            <motion.div
              key={step.id}
              className="flex flex-col items-center"
              animate={active ? { opacity: 1 } : { opacity: 0.4 }}
            >
              <Icon className={`w-8 h-8 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
              <p className="text-sm mt-2">{step.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* IP */}
      {ip && <div className="mt-6 text-center text-green-600 font-semibold">🌐 Live at: {ip}</div>}

      {/* Logs */}
      <div className="bg-black text-green-400 rounded-lg p-4 h-64 overflow-y-auto">
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="text-green-500" />
          <span>Deployment Logs</span>
        </div>

        {logs.map((log) => (
          <pre key={log.id} className="text-sm">
            {log.timestamp} - {log.message}
          </pre>
        ))}
      </div>
    </div>
  )
}
