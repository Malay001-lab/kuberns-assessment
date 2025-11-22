import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useWizardStore } from '@/store/wizardStore'
import { webAppAPI } from '@/api/webappAPI'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card'
import { Plus, Trash2 } from 'lucide-react'

function generateRandomPort() {
  return Math.floor(Math.random() * (8999 - 3000 + 1)) + 3000
}

export default function Page2() {
  const store = useWizardStore()
  const [localPort, setLocalPort] = useState(store.port || 3001)
  const [envVars, setEnvVars] = useState(
    store.environmentVariables && store.environmentVariables.length > 0
      ? store.environmentVariables
      : [{ key: '', value: '' }]
  )

  const handleAddEnvVar = () => setEnvVars((p) => [...p, { key: '', value: '' }])
  const handleRemoveEnvVar = (i) => setEnvVars((p) => p.filter((_, idx) => idx !== i))
  const handleEnvVarChange = (index, field, value) => {
    const copy = [...envVars]
    copy[index][field] = value
    setEnvVars(copy)
  }

  const handleSuggestPort = () => setLocalPort(generateRandomPort())

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!localPort) {
      alert('Please specify a port')
      return
    }

    const validEnvVars = envVars.filter((v) => v.key || v.value)
    for (const envVar of validEnvVars) {
      if (!envVar.key || !envVar.value) {
        alert('Please fill in both key and value for all environment variables')
        return
      }
    }

    store.setPort(localPort)
    store.setEnvironmentVariables(validEnvVars)

    const formData = {
      name: store.appName,
      region: store.region,
      template: store.framework,
      plan: store.planType,
      organization: store.organization,
      repo: store.repository,
      branch: store.branch,
      database_enabled: store.databaseEnabled,
      database_type: store.databaseType,
      environment: {
        port: Number(localPort),
        environment_variables: Object.fromEntries(validEnvVars.map((v) => [v.key, v.value])),
      },
    }
    if (store.databaseEnabled) formData.database_config = {}

    store.setIsLoading(true)
    store.setError(null)

    try {
      const response = await webAppAPI.createWebApp(formData)
      store.setSuccess(true)
      store.setDeploymentId(response.id)

      store.setCurrentPage(3)
    } catch (error) {
      alert('❌ Backend Error: ' + JSON.stringify(error, null, 2))
    } finally {
      store.setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Environment & Deploy</h1>
        <p className="text-sm text-gray-600 mt-1">
          Set runtime configuration and finish deployment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-8">
        <div className="col-span-8 space-y-6">
          <Card>
            <CardHeader
              title="Port configuration"
              subtitle="Which port should your app listen on?"
            />
            <CardContent>
              <div className="flex gap-3 items-end">
                <Input
                  type="number"
                  label="Port"
                  value={localPort}
                  onChange={(e) => setLocalPort(e.target.value)}
                  min="1024"
                  max="65535"
                />
                <Button variant="outline" type="button" onClick={handleSuggestPort}>
                  💡 Suggest
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Valid port range: 1024 - 65535. Default: 3001
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Environment variables"
              subtitle="Add environment variables for your app"
            />
            <CardContent>
              <div className="space-y-3">
                {envVars.map((envVar, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 items-end"
                  >
                    <Input
                      placeholder="KEY"
                      value={envVar.key}
                      onChange={(e) => handleEnvVarChange(idx, 'key', e.target.value)}
                    />
                    <Input
                      placeholder="value"
                      value={envVar.value}
                      onChange={(e) => handleEnvVarChange(idx, 'value', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveEnvVar(idx)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleAddEnvVar}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add environment variable
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <Button variant="secondary" type="button" onClick={() => store.setCurrentPage(1)}>
              ← Back
            </Button>

            <Button type="submit" variant="primary" disabled={store.isLoading}>
              {store.isLoading ? 'Creating…' : 'Finish My Setup & Deploy →'}
            </Button>
          </div>
        </div>

        <aside className="col-span-4 space-y-6">
          <Card className="sticky top-6">
            <CardContent>
              <p className="text-sm text-gray-500">Deployment summary</p>
              <h3 className="mt-2 text-lg font-semibold text-gray-900">
                {store.appName || 'Your App'}
              </h3>
              <div className="mt-3 text-sm text-gray-700 space-y-1">
                <div>
                  <span className="font-medium">Framework:</span> {store.framework || '-'}
                </div>
                <div>
                  <span className="font-medium">Region:</span> {store.region || '-'}
                </div>
                <div>
                  <span className="font-medium">Plan:</span> {store.planType || '-'}
                </div>
                <div>
                  <span className="font-medium">Database:</span>{' '}
                  {store.databaseEnabled ? store.databaseType : 'No'}
                </div>
                <div>
                  <span className="font-medium">Port:</span> {localPort}
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </form>

      {store.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {store.error}
        </div>
      )}
    </div>
  )
}
