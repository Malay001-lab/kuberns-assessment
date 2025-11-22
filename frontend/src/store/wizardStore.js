import { create } from 'zustand'

export const useWizardStore = create((set) => ({
  // Form state
  currentPage: 1,

  // Page 1 data
  organization: '',
  repository: '',
  branch: '',
  appName: '',
  region: 'us-east-1',
  framework: 'react',
  planType: 'starter',
  databaseType: 'none',
  databaseEnabled: false,

  // Page 2 data
  port: 3001,
  environmentVariables: [],

  // UI state
  isLoading: false,
  error: null,
  success: false,
  deploymentId: null,

  // Actions
  setCurrentPage: (page) => set({ currentPage: page }),

  setOrganization: (org) => set({ organization: org }),
  setRepository: (repo) => set({ repository: repo }),
  setBranch: (branch) => set({ branch }),
  setAppName: (name) => set({ appName: name }),
  setRegion: (region) => set({ region }),
  setFramework: (framework) => set({ framework }),
  setPlanType: (plan) => set({ planType: plan }),
  setDatabaseType: (type) => set({ databaseType: type }),
  setDatabaseEnabled: (enabled) => set({ databaseEnabled: enabled }),

  setPort: (port) => set({ port: parseInt(port) }),
  setEnvironmentVariables: (variables) => set({ environmentVariables: variables }),

  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSuccess: (success) => set({ success }),
  setDeploymentId: (id) => set({ deploymentId: id }),

  // Reset form
  resetForm: () =>
    set({
      currentPage: 1,
      organization: '',
      repository: '',
      branch: '',
      appName: '',
      region: 'us-east-1',
      framework: 'react',
      planType: 'starter',
      databaseType: 'none',
      databaseEnabled: false,
      port: 3001,
      environmentVariables: [],
      isLoading: false,
      error: null,
      success: false,
      deploymentId: null,
    }),
}))
