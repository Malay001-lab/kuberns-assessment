import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { motion } from 'framer-motion'
import { useWizardStore } from '@/store/wizardStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card'
import { Toggle } from '@/components/ui/Toggle'
import { Github, Check } from 'lucide-react'
import apiClient from '@/api/webappAPI'

// Mock GitHub only
const ORGANIZATIONS = [
  { value: 'acme-corp', label: 'ACME Corporation' },
  { value: 'tech-startup', label: 'Tech Startup Inc' },
  { value: 'open-source', label: 'Open Source Org' },
]

const REPOSITORIES = [
  { value: 'my-app', label: 'my-app' },
  { value: 'web-portal', label: 'web-portal' },
  { value: 'api-server', label: 'api-server' },
]

const BRANCHES = [
  { value: 'main', label: 'main' },
  { value: 'develop', label: 'develop' },
  { value: 'staging', label: 'staging' },
]

export default function Page1() {
  const store = useWizardStore()

  const [regions, setRegions] = useState([])
  const [frameworks, setFrameworks] = useState([])
  const [planDetails, setPlanDetails] = useState({})
  const [dbTypes, setDbTypes] = useState([])

  useEffect(() => {
    // reset for placeholder
    store.setRegion('')
    store.setFramework('')

    apiClient
      .get('/metadata/')
      .then((res) => {
        setRegions(res.data.regions || [])
        setFrameworks(res.data.frameworks || [])
        setPlanDetails(res.data.plan_details || {})
        setDbTypes(res.data.database_types || [])
      })
      .catch((err) => {
        console.error('Metadata load error:', err)
      })
  }, [])

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      organization: store.organization,
      repository: store.repository,
      branch: store.branch,
      appName: store.appName,
      region: '',
      framework: '',
    },
  })

  const handleGitHubConnect = () => {
    alert('Mock GitHub connection — OAuth not implemented')
  }

  const onSubmit = (data) => {
    store.setOrganization(data.organization)
    store.setRepository(data.repository)
    store.setBranch(data.branch)
    store.setAppName(data.appName)
    store.setRegion(data.region)
    store.setFramework(data.framework)
    store.setCurrentPage(2)
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Deploy your app</h1>
          <p className="text-sm text-gray-600 mt-1">
            Configure repository, pick a plan and add environment.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" onClick={handleGitHubConnect}>
            <Github className="w-4 h-4" /> Connect GitHub
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-12 gap-8">
        {/* Main column */}
        <div className="col-span-8 space-y-6">
          {/* Repo card */}
          <Card>
            <CardHeader title="Repository" subtitle="Select organization, repo and branch" />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Controller
                  name="organization"
                  control={control}
                  rules={{ required: 'Organization is required' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Organization"
                      options={ORGANIZATIONS}
                      error={errors.organization?.message}
                    />
                  )}
                />

                <Controller
                  name="repository"
                  control={control}
                  rules={{ required: 'Repository is required' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Repository"
                      options={REPOSITORIES}
                      error={errors.repository?.message}
                    />
                  )}
                />

                <Controller
                  name="branch"
                  control={control}
                  rules={{ required: 'Branch is required' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Branch"
                      options={BRANCHES}
                      error={errors.branch?.message}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* App settings */}
          <Card>
            <CardHeader title="Application" subtitle="Name, region and framework" />
            <CardContent>
              <div className="space-y-4">
                <Controller
                  name="appName"
                  control={control}
                  rules={{ required: 'App name is required' }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      label="App name"
                      placeholder="my-awesome-app"
                      error={errors.appName?.message}
                    />
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="region"
                    control={control}
                    rules={{ required: 'Region is required' }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Region"
                        options={[
                          { value: '', label: 'Select an option' },
                          ...regions.map(([v, l]) => ({ value: v, label: l })),
                        ]}
                        error={errors.region?.message}
                      />
                    )}
                  />

                  <Controller
                    name="framework"
                    control={control}
                    rules={{ required: 'Framework is required' }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Framework"
                        options={[
                          { value: '', label: 'Select an option' },
                          ...frameworks.map(([v, l]) => ({ value: v, label: l })),
                        ]}
                        error={errors.framework?.message}
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plans */}
          <div>
            <h3 className="text-base font-medium mb-3">Choose a plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(planDetails).map(([key, plan]) => (
                <motion.div
                  key={key}
                  whileHover={{ scale: 1.01 }}
                  className={`border rounded-lg p-4 cursor-pointer transition-shadow ${
                    store.planType === key
                      ? 'border-black bg-gray-50 shadow-md'
                      : 'border-gray-200 bg-white'
                  }`}
                  onClick={() => store.setPlanType(key)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 capitalize">{key}</p>
                      <div className="text-sm text-gray-600 mt-2">
                        <div>CPU: {plan.cpu}</div>
                        <div>RAM: {plan.ram}</div>
                        <div>Bandwidth: {plan.bandwidth}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{plan.price}</p>
                      {store.planType === key && <Check className="w-5 h-5 text-green-600 mt-2" />}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Database */}
          <Card>
            <CardHeader title="Database (optional)" subtitle="Add a managed database" />
            <CardContent>
              <div className="flex items-center justify-between">
                <Toggle
                  checked={store.databaseEnabled}
                  onChange={store.setDatabaseEnabled}
                  label="Enable Database"
                />
              </div>

              {store.databaseEnabled && (
                <div className="mt-4">
                  <Select
                    value={store.databaseType}
                    onChange={(e) => store.setDatabaseType(e.target.value)}
                    label="Database type"
                    options={dbTypes.map(([v, l]) => ({ value: v, label: l }))}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" onClick={handleSubmit(onSubmit)}>
              Continue →
            </Button>
          </div>
        </div>

        {/* Right summary column */}
        <aside className="col-span-4 ">
          <div className="sticky top-6 space-y-6">
            <Card>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Summary</p>
                    <p className="mt-2 text-lg font-semibold text-gray-900">
                      {store.appName || 'Untitled App'}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>{store.planType ? store.planType.toUpperCase() : 'No plan'}</div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-700 space-y-2">
                  <div>
                    <span className="font-medium">Region:</span> {store.region || '-'}
                  </div>
                  <div>
                    <span className="font-medium">Framework:</span> {store.framework || '-'}
                  </div>
                  <div>
                    <span className="font-medium">Repo:</span> {store.repository || '-'}
                  </div>
                  <div>
                    <span className="font-medium">DB:</span>{' '}
                    {store.databaseEnabled ? store.databaseType : 'None'}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <p className="text-sm text-gray-700">Tips</p>
                <ul className="mt-3 text-sm text-gray-600 space-y-2">
                  <li>• Choose a nearby region for better latency</li>
                  <li>• Starter plan is good for testing</li>
                  <li>• Enable DB for production apps</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </aside>
      </form>
    </div>
  )
}
