// Shared context for modules to access contentscript state
// This replaces the circular dependency pattern of importing from contentscript

export type PageType = 0 | 1 | 2 | 3 | 4

interface Context {
  port: browser.Runtime.Port | null
  dataStore: Record<string, any>
  PAGE: PageType
  scripts: Record<string, any>
}

export const context: Context = {
  port: null,
  dataStore: {},
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

export function getDataStore(): Record<string, any> {
  return context.dataStore
}

export function getPAGE(): PageType {
  return context.PAGE
}

export function getScripts(): Record<string, any> {
  return context.scripts
}
