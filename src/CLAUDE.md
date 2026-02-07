# Source Code Context

## Module System

Page types determine which modules load:
- `0`: No page (always modules only)
- `1`: Forum main (`/forum/`)
- `2`: Topic (`/forum/tema/`)
- `3`: News (`/cikkek/`)
- `4`: Themes (`/forum/temak/`)

## Module Pattern

```typescript
import { Module } from '../Module'
import { context } from '../context'

export const featureName = new Module('featureName')

featureName.activate = () => {
  // Initialize, add listeners, modify DOM
  // Access settings: context.dataStore['featureName']
}

featureName.disable = () => {
  // Cleanup (optional)
}
```

## Adding a Module

1. Create `src/modules/[page-type]/featureName.ts`
2. Export from `src/modules/[page-type]/index.ts`
3. Add default in `src/utils/defaultSettings.ts`

## Communication

```
Background (background.ts)
    ↕ browser.runtime port
Content (content/index.ts)
    ↕ context object
Modules
```

Update setting:
```typescript
context.port.postMessage({ name: 'setSetting', key: 'featureName', val: value })
```

## Notes

- jQuery available globally as `$`
- Use `browser.*` API (not `chrome.*`)
- sg.hu loads content dynamically - use MutationObserver for timing
- Settings sync via `chrome.storage.sync`
