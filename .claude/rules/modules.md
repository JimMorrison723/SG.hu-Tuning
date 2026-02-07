---
paths:
  - "src/modules/**/*.ts"
---

# Module Development Guidelines

## Module Creation Checklist

When creating a new module:

1. **Choose correct page type directory**:
   - `always/` - Features that work on all sg.hu pages
   - `forum/` - Forum main page specific (`/forum/`)
   - `topik/` - Topic/discussion pages (`/forum/tema/`)
   - `news/` - News/article pages (`/cikkek/`)
   - `temak/` - Themes page (`/forum/temak/`)

2. **Follow naming convention**:
   - Use camelCase for filename and export: `myFeature.ts`
   - Match module name with setting key in `defaultSettings.ts`

3. **Export from index.ts**:
   ```typescript
   // src/modules/[page-type]/index.ts
   export * from './myFeature'
   ```

4. **Add default setting**:
   ```typescript
   // src/utils/defaultSettings.ts
   export default {
     myFeature: true, // or false, or object
   }
   ```

## Module Structure Template

```typescript
import { Module } from '../Module'
import { context } from '../context'

// Create module instance
export const myFeature = new Module('myFeature')

// Required: Activation function
myFeature.activate = () => {
  // Check if settings require specific conditions
  if (!context.dataStore['myFeature']) {
    return
  }

  // Page-specific behavior
  if (context.PAGE === 2) { // Topic page
    // Initialize feature
    setupEventListeners()
    modifyDOM()
  }
}

// Optional: Deactivation function
myFeature.disable = () => {
  // Clean up event listeners
  // Remove DOM modifications
  // Restore original state
}

// Helper functions
function setupEventListeners() {
  // Use jQuery or native addEventListener
}

function modifyDOM() {
  // DOM manipulation
}
```

## Module Best Practices

### Initialization

- **Check settings first**: Always verify module is enabled in settings
- **Page-specific logic**: Use `context.PAGE` to determine behavior
- **Defensive coding**: Check if DOM elements exist before manipulation
- **User authentication**: Check `context.dataStore['user'].isLoggedIn` if needed

### DOM Manipulation

- **Stable selectors**: Use specific IDs or classes that won't change
- **Wait for content**: sg.hu loads content dynamically, consider:
  ```typescript
  // Option 1: MutationObserver for dynamic content
  const observer = new MutationObserver((mutations) => {
    // Check for new elements
  })

  // Option 2: jQuery delegation for events
  $(document).on('click', '.dynamic-element', handler)

  // Option 3: Polling with timeout (last resort)
  setTimeout(() => checkForElement(), 1000)
  ```

### Event Listeners

- **Cleanup**: Store references to remove in `.disable()`
- **Delegation**: Use event delegation for dynamically added elements
- **Prevent leaks**: Remove listeners when module is disabled

### Settings Access

```typescript
// Read setting
const setting = context.dataStore['myFeature']

// Read nested setting
const option = context.dataStore['myFeatureOptions']?.someOption

// Update setting (triggers background save)
context.port.postMessage({
  name: 'setSetting',
  key: 'myFeature',
  val: newValue
})
```

### Communication with Background

```typescript
// Send message to background
context.port.postMessage({
  name: 'customAction',
  data: { /* payload */ }
})

// Listen for messages (in content script, not module)
// Background sends via: tabs.sendMessage()
```

## Common Patterns

### Toggle Button Pattern

```typescript
myFeature.activate = () => {
  const button = $('<button id="my-feature-btn">Toggle</button>')
  button.appendTo('body')

  button.on('click', () => {
    const state = context.dataStore['myFeature']
    const newState = !state

    context.dataStore['myFeature'] = newState
    context.port.postMessage({
      name: 'setSetting',
      key: 'myFeature',
      val: newState
    })

    updateUI(newState)
  })
}
```

### User-Specific Content Pattern

```typescript
myFeature.activate = () => {
  const user = context.dataStore['user']

  if (!user.isLoggedIn) {
    console.log('Feature requires login')
    return
  }

  const username = user.userName
  // Highlight mentions of current user, etc.
}
```

### API Call Pattern

```typescript
import { apiCall } from '@/utils/api'

myFeature.activate = () => {
  const identId = getCookie('identid')

  apiCall('forum/user', { ident_id: identId })
    .then(data => {
      // Process response
    })
    .catch(error => {
      console.error('API call failed:', error)
    })
}
```

### Storage Pattern (Complex Settings)

```typescript
// For arrays, objects, or complex data
myFeature.activate = () => {
  // Parse stored JSON
  const config = context.dataStore['myFeatureConfig']
  const parsedConfig = config ? JSON.parse(config) : { default: 'value' }

  // Use config
  applyConfig(parsedConfig)

  // Save updated config
  const updated = { ...parsedConfig, newKey: 'value' }
  context.port.postMessage({
    name: 'setSetting',
    key: 'myFeatureConfig',
    val: JSON.stringify(updated)
  })
}
```

## Testing Modules

### Manual Testing

1. Build extension: `bun run dev`
2. Load in browser (see main CLAUDE.md)
3. Navigate to appropriate sg.hu page
4. Open DevTools Console
5. Test feature manually
6. Check for console errors

### Debugging Tips

```typescript
// Debug module loading
console.log('[myFeature] Activated', {
  page: context.PAGE,
  settings: context.dataStore['myFeature']
})

// Debug DOM selection
const element = $('#selector')
console.log('[myFeature] Found elements:', element.length)

// Debug event handling
$('#element').on('click', (e) => {
  console.log('[myFeature] Click event:', e)
})
```

### Common Issues

**Module not activating:**
- Check if exported in `index.ts`
- Verify setting is enabled in `defaultSettings.ts`
- Confirm module name matches setting key exactly

**DOM elements not found:**
- sg.hu content may load after `document_idle`
- Use MutationObserver or delayed initialization
- Check selector is correct for current page structure

**Events not firing:**
- Element might be dynamically added after event binding
- Use event delegation: `$(document).on('event', 'selector', handler)`

**Settings not persisting:**
- Ensure `context.port` is initialized
- Check postMessage uses correct format
- Verify background script handles 'setSetting' message

## Module Migration (JavaScript → TypeScript)

When migrating a module from `app/scripts/modules/` to `src/modules/`:

1. **Copy to appropriate directory** under `src/modules/`
2. **Rename `.js` to `.ts`**
3. **Update imports**:
   ```typescript
   // Old
   const api = require('../util/api')

   // New
   import { apiCall } from '@/utils/api'
   import { context } from '../context'
   ```
4. **Replace IIFE pattern**:
   ```typescript
   // Old
   (function() {
     'use strict'
     function init() { /* ... */ }
     return { name: 'feature', init }
   })()

   // New
   import { Module } from '../Module'
   export const feature = new Module('feature')
   feature.activate = () => { /* ... */ }
   ```
5. **Update context access**:
   ```typescript
   // Old (assuming contentscript import)
   const settings = window.__sgTuningSettings

   // New
   import { context } from '../context'
   const settings = context.dataStore
   ```
6. **Add type annotations** (gradually):
   ```typescript
   function handler(event: Event): void { /* ... */ }
   ```

## Performance Considerations

- **Lazy initialization**: Only run code when absolutely needed
- **Debounce/throttle**: For frequent events (scroll, resize)
- **Selector caching**: Store jQuery selections if reused
- **Cleanup**: Remove event listeners and observers in `.disable()`
- **Avoid global scope pollution**: Keep variables scoped to module

## Security Considerations

- **XSS prevention**: Sanitize user input before inserting into DOM
- **API keys**: Current API key is public (sg.hu limitation)
- **User data**: Handle usernames and settings with care
- **External resources**: Only load from trusted sources
