// Shared context for modules to access contentscript state
// This replaces the circular dependency pattern of importing from contentscript

import type { Module } from './Module'
import type { ExtensionSettings, UserInfo } from '@/types/messages'

export type PageType = 0 | 1 | 2 | 3 | 4

// DataStore is extension settings with some runtime additions
export type DataStore = Partial<ExtensionSettings> & {
  user: UserInfo
  [key: string]: unknown
}

interface Context {
  port: browser.Runtime.Port | null
  dataStore: DataStore
  PAGE: PageType
  scripts: Record<string, Module>
}

export const context: Context = {
  port: null,
  dataStore: {
    user: { isLoggedIn: false, userName: '' }
  },
  PAGE: 0,
  scripts: {},
}

// Getter functions for cleaner access
export function getPort(): browser.Runtime.Port {
  if (!context.port) {
    throw new Error('Port not initialized')
  }
  return context.port
}

export function getDataStore(): DataStore {
  return context.dataStore
}

export function getPAGE(): PageType {
  return context.PAGE
}

export function getScripts(): Record<string, Module> {
  return context.scripts
}
