---
paths:
  - "src/**/*.ts"
  - "*.ts"
---

# TypeScript & Code Style Guidelines

## TypeScript Configuration

Project uses TypeScript with minimal configuration:
- **Target**: ES2020+ (modern browsers)
- **Module**: ESNext (ES modules)
- **Strict mode**: Gradual migration (not fully strict yet)

Check `tsconfig.json` for current settings.

## Code Style Rules

### Naming Conventions

- **Files**: camelCase (e.g., `myFeature.ts`)
- **Classes**: PascalCase (e.g., `Module`)
- **Variables/Functions**: camelCase (e.g., `getUserStatus`)
- **Constants**: camelCase or UPPER_CASE for true constants
- **Types/Interfaces**: PascalCase (e.g., `PageType`, `Context`)

### Imports

Prefer named imports and use path aliases:

```typescript
// ✅ Good - Use @ alias for src
import { context } from '@/modules/context'
import { apiCall } from '@/utils/api'

// ✅ Good - Relative imports within same directory
import { Module } from '../Module'

// ❌ Avoid - Don't use long relative paths
import { context } from '../../../modules/context'
```

Import order (enforced by ESLint):
1. External dependencies (e.g., `jquery`)
2. Internal absolute imports (e.g., `@/modules/context`)
3. Internal relative imports (e.g., `../Module`)
4. Styles (e.g., `@/assets/styles/content.css`)

### Type Annotations

Add types gradually when refactoring, but prioritize:

```typescript
// ✅ Function parameters and return types
function processData(data: string): boolean {
  return data.length > 0
}

// ✅ Complex objects
interface ModuleConfig {
  enabled: boolean
  options?: Record<string, any>
}

// ✅ Arrays
const modules: string[] = []
const settings: Record<string, any> = {}

// ✅ DOM events (when relevant)
button.addEventListener('click', (e: MouseEvent) => {
  // ...
})

// ⚠️ Optional - Simple variables with obvious types
let count = 0 // Type inference is fine
```

### Avoid Over-Typing Legacy Code

When migrating JavaScript to TypeScript:

```typescript
// ✅ Acceptable during migration - Use 'any' temporarily
const legacyData: any = context.dataStore

// ✅ Better - Add minimal types
const legacyData: Record<string, any> = context.dataStore

// ❌ Don't spend hours creating perfect types for legacy code
// Focus on new code having good types
```

## ESLint Configuration

Project uses ESLint 9 with **flat config** (`eslint.config.js`):

### Key Rules

- **No unused variables**: Remove or prefix with `_`
- **No console in production**: Use sparingly, remove debug logs
- **Semicolons**: Required (enforced by ESLint)
- **Quotes**: Single quotes preferred (but not strictly enforced)
- **Indentation**: 2 spaces (enforced)

### Running ESLint

```bash
bun run lint  # Check all files
```

### Fixing Violations

Many ESLint issues can be auto-fixed:
```bash
npx eslint --fix src/**/*.ts
```

Common fixes:
- Remove unused imports
- Add semicolons
- Fix indentation

## jQuery Usage

Project uses jQuery 4.0 (globally available as `$` and `jQuery`):

### Modern jQuery Patterns

```typescript
// ✅ Event delegation for dynamic content
$(document).on('click', '.dynamic-button', function(e) {
  // Handler
})

// ✅ Chaining
$('#element')
  .addClass('active')
  .css('color', 'red')
  .fadeIn()

// ✅ Data attributes
$('#element').data('userId', 123)

// ⚠️ Consider native APIs for simple operations
// jQuery:
$('#element').addClass('active')

// Native (more performant):
document.getElementById('element')?.classList.add('active')
```

### Deprecation Notes

jQuery is legacy. For new code, consider:
- Native `querySelector` / `querySelectorAll`
- Native `addEventListener`
- Native `classList`, `dataset`
- Modern frameworks (if complete rewrite happens)

## Browser API Usage

### Use `browser.*` namespace

```typescript
// ✅ Cross-browser compatible
browser.runtime.sendMessage({ /* ... */ })
browser.storage.sync.get()

// ❌ Chrome-specific
chrome.runtime.sendMessage({ /* ... */ })
```

WXT provides polyfills for Firefox compatibility.

### Async/Await with Browser APIs

```typescript
// ✅ Use async/await
async function loadSettings() {
  const data = await browser.storage.sync.get('settings')
  return data.settings
}

// ⚠️ Older callback style still works
browser.storage.sync.get('settings', (data) => {
  console.log(data.settings)
})
```

## Error Handling

### Console Logging

```typescript
// ✅ Prefix with module name for debugging
console.log('[myFeature] Initialized')
console.error('[myFeature] Failed to load:', error)

// ⚠️ Remove debug logs before production
// console.log('[DEBUG] Some state:', state)
```

### Try-Catch for Critical Operations

```typescript
// ✅ Wrap API calls, storage access
try {
  const response = await apiCall('endpoint')
  processResponse(response)
} catch (error) {
  console.error('[myFeature] API call failed:', error)
  // Fallback behavior
}
```

### Graceful Degradation

```typescript
// ✅ Check if elements exist before manipulation
const element = document.querySelector('#target')
if (element) {
  element.classList.add('active')
} else {
  console.warn('[myFeature] Target element not found')
}

// ✅ Optional chaining for jQuery
const count = $('#list').find('li').length ?? 0
```

## Common Anti-Patterns to Avoid

### ❌ Modifying global scope unnecessarily

```typescript
// ❌ Bad
(window as any).myGlobalVar = 'value'

// ✅ Good - Keep scoped
const myVar = 'value'
```

### ❌ Synchronous blocking operations

```typescript
// ❌ Bad - Blocks UI
let data
$.ajax({ url: '/api', async: false, success: (d) => data = d })

// ✅ Good - Non-blocking
const data = await $.ajax({ url: '/api' })
```

### ❌ Mixing old and new patterns

```typescript
// ❌ Inconsistent
somePromise.then(data => {
  callback(null, data)
})

// ✅ Consistent - Use async/await
const data = await somePromise
processData(data)
```

### ❌ Over-engineering simple features

```typescript
// ❌ Unnecessary abstraction for simple feature
class ClickHandlerFactory {
  createHandler(type: string): EventListener {
    return (e: Event) => this.handle(type, e)
  }
  handle(type: string, e: Event) { /* complex logic */ }
}

// ✅ Simple and direct
button.addEventListener('click', (e) => {
  // Handle click
})
```

## Documentation

### Code Comments

Add comments for:
- **Complex logic**: Why, not what
- **Workarounds**: Explain sg.hu quirks
- **TODOs**: Mark areas needing improvement

```typescript
// ✅ Good comment - explains why
// sg.hu loads chat dynamically after 2s, wait before styling
setTimeout(() => applyStyles(), 2000)

// ❌ Unnecessary comment - code is self-explanatory
// Add class to element
element.classList.add('active')
```

### JSDoc (Optional)

For public APIs or complex functions:

```typescript
/**
 * Fetches user data from sg.hu API
 * @param userId - The user's numeric ID
 * @returns Promise with user data or null if not found
 */
async function fetchUserData(userId: number): Promise<UserData | null> {
  // Implementation
}
```

## File Organization

### Module Files

Keep modules focused and single-purpose:
```
✅ Good:
  - chatHide.ts (one feature)
  - nightMode.ts (one feature)

❌ Bad:
  - features.ts (multiple unrelated features)
```

### Utility Files

Group related utilities:
```
✅ Good:
  - api.ts (API helpers)
  - cookies.ts (Cookie utilities)

❌ Bad:
  - helpers.ts (everything mixed)
```

## Performance Tips

### Selector Caching

```typescript
// ❌ Repeated DOM queries
$('#element').addClass('active')
$('#element').text('Hello')
$('#element').css('color', 'red')

// ✅ Cache selector
const $element = $('#element')
$element.addClass('active')
$element.text('Hello')
$element.css('color', 'red')
```

### Event Delegation

```typescript
// ❌ Multiple event listeners
$('.button').each((i, btn) => {
  $(btn).on('click', handler)
})

// ✅ Single delegated listener
$(document).on('click', '.button', handler)
```

### Debouncing/Throttling

```typescript
// For frequent events (scroll, resize, input)
let timeout: number
window.addEventListener('resize', () => {
  clearTimeout(timeout)
  timeout = window.setTimeout(() => {
    // Handle resize
  }, 250)
})
```

## Migration Guidelines

### When Migrating JS → TS

1. **Rename file**: `.js` → `.ts`
2. **Fix imports**: `require()` → `import`
3. **Update exports**: `module.exports` → `export`
4. **Add minimal types**: Parameters and return types
5. **Fix ESLint issues**: Run `bun run lint`
6. **Test thoroughly**: Ensure no runtime errors

### Gradual Type Improvement

Don't try to type everything at once:

**Phase 1**: Basic migration
```typescript
export const feature = new Module('feature')
```

**Phase 2**: Add function signatures
```typescript
feature.activate = (): void => {
  // ...
}
```

**Phase 3**: Add interfaces for complex data
```typescript
interface FeatureConfig {
  enabled: boolean
  options: Record<string, any>
}
```

## Cross-Browser Compatibility

### Browser-Specific Code

Avoid browser detection when possible. If necessary:

```typescript
// ✅ Feature detection
if ('storage' in browser) {
  await browser.storage.sync.get('key')
}

// ❌ Browser detection
if (navigator.userAgent.includes('Firefox')) {
  // Firefox-specific code
}
```

### CSS Vendor Prefixes

WXT handles vendor prefixes. Use standard CSS properties.

## Security Best Practices

### XSS Prevention

```typescript
// ❌ Dangerous - Direct HTML insertion
$('#content').html(userInput)

// ✅ Safe - Text insertion
$('#content').text(userInput)

// ✅ Safe - Sanitize if HTML needed
import DOMPurify from 'dompurify' // If added
$('#content').html(DOMPurify.sanitize(userInput))
```

### Content Security Policy

Extension uses strict CSP. Avoid:
- Inline scripts
- `eval()` or `Function()` constructor
- Inline event handlers (`onclick="..."`)

## Resources

- TypeScript Handbook: https://www.typescriptlang.org/docs/
- ESLint Flat Config: https://eslint.org/docs/latest/use/configure/configuration-files
- WXT Documentation: https://wxt.dev/
- Browser Extension APIs: https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions
