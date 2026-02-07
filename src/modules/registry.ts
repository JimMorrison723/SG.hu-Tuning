import type { PageType } from './context'

import * as alwaysModules from './always'
import * as forumModules from './forum'
import * as topikModules from './topik'
import * as newsModules from './news'
import * as temakModules from './temak'

// Registry maps page types to their available modules
const registry: Record<PageType, Record<string, any>> = {
  0: {},           // No page matched - only always modules
  1: forumModules, // Forum main page
  2: topikModules, // Topic page
  3: newsModules,  // News/article page
  4: temakModules, // Themes page
}

export function getModulesForPage(page: PageType): Record<string, any> {
  return registry[page] || {}
}

export function getAlwaysModules(): Record<string, any> {
  return alwaysModules
}
