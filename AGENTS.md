# Using Claude Code Agents with SG.hu Tuning

This guide explains how to effectively use Claude Code agents to work on the SG.hu Tuning browser extension codebase.

## Project Overview

**SG.hu Tuning** is a multi-browser extension (Chrome, Firefox, Opera) that enhances the user experience on sg.hu (a popular Hungarian forum/community site). The extension provides features like:

- Dark mode / Night mode
- Ad removal
- Chat hiding
- Auto-loading next page content
- Quick message insertion
- Settings synchronization
- User profile groups
- And many more convenience features

**Tech Stack:**
- JavaScript (ES6+)
- WebExtension API (with polyfill for cross-browser compatibility)
- jQuery for DOM manipulation
- webextension-toolbox for building/dev
- ESLint for code quality

## Project Structure

```
app/
├── scripts/
│   ├── background.js              # Background/service worker script
│   ├── contentscript.js           # Content script (runs on sg.hu pages)
│   ├── settings.js                # Settings/options page logic
│   ├── util/                      # Utility modules
│   │   ├── api.js                 # API helper functions
│   │   ├── browser.js             # Browser API wrappers
│   │   ├── cookies.js             # Cookie management
│   │   ├── defaultSettings.js     # Default configuration
│   │   └── safeResponse.js        # Safe response handling
│   └── modules/                   # Feature modules (organized by page type)
│       ├── always/                # Features for all pages
│       ├── news/                  # Features for news pages
│       ├── topik/                 # Features for topic/discussion pages
│       ├── profile/               # Features for user profile pages
│       └── usermenu/              # Features for user menu
├── styles/                        # CSS files
├── pages/                         # HTML pages (settings, popup, etc.)
└── icons/                         # Extension icons
```

## How to Use Agents for Common Tasks

### Using the Explore Agent
When you need to understand the codebase structure or find where certain functionality is implemented, use the **Explore agent**:

```
/task explore

// Examples:
- "Find where the night mode feature is implemented"
- "Show me how settings are synchronized"
- "Where are API calls made to sg.hu?"
- "How does the content script interact with modules?"
```

The Explore agent is particularly useful for:
- Finding specific features across multiple files
- Understanding how modules are loaded and executed
- Tracing the flow of data between background and content scripts
- Locating where user settings are applied

### Adding a New Feature

When implementing a new feature, follow this workflow:

1. **Plan the implementation** - Use `/ask` or discuss with Claude to determine:
   - Which page(s) does this feature affect? (always, news, topik, profile, usermenu)
   - Does it need settings/configuration?
   - Does it need to communicate with background script?
   - Does it require API calls?

2. **Create the module file**:
   ```javascript
   // app/scripts/modules/[page-type]/[featureName].js
   (function() {
     'use strict';

     function init() {
       // Feature initialization
     }

     return {
       name: 'featureName',
       init: init
     };
   })();
   ```

3. **Register the module** - Add it to the appropriate index.js file:
   ```javascript
   // app/scripts/modules/[page-type]/index.js
   modules.push(require('./featureName'));
   ```

4. **Add settings** if needed:
   ```javascript
   // app/scripts/util/defaultSettings.js
   settings.featureName = {
     enabled: true,
     // other options...
   };
   ```

### Modifying an Existing Module

To modify existing functionality:

1. Use Explore agent to find the feature: `"Where is [feature name] implemented?"`
2. Read the relevant module file
3. Understand the module's structure (init function, event listeners, DOM selectors)
4. Make your changes
5. Test in the browser (see Testing section below)

### Fixing a Bug

When fixing bugs:

1. **Identify the affected module** using Explore agent
2. **Understand the context** - Read related utility files and the module itself
3. **Locate the bug** - Check for:
   - Incorrect DOM selectors (sg.hu HTML structure may change)
   - Race conditions (content script timing)
   - Settings not being applied correctly
   - API call failures
4. **Implement fix** - Keep it minimal and focused
5. **Verify no side effects** - Check if the module affects other features

## Code Patterns and Conventions

### Module Structure
All feature modules follow a consistent pattern:

```javascript
(function() {
  'use strict';

  const settings = window.__sgTuningSettings || {};

  function init() {
    if (!settings.featureName || !settings.featureName.enabled) {
      return;
    }

    // Initialize the feature
    setupEventListeners();
    applyStyles();
  }

  function setupEventListeners() {
    // Add event listeners
  }

  function applyStyles() {
    // Apply CSS or modify DOM
  }

  return {
    name: 'featureName',
    init: init
  };
})();
```

### Communication Between Scripts
- **Content Script → Background**: Use `chrome.runtime.sendMessage()`
- **Background → Content Script**: Use `chrome.tabs.sendMessage()`
- **Settings**: Store in `chrome.storage.sync` for cross-device sync

### DOM Selectors
sg.hu's HTML structure can change. When selecting elements:
- Use specific, stable selectors
- Avoid overly broad selectors
- Test selectors regularly
- Consider using class names over element hierarchies

### Settings Pattern
Feature settings should follow this pattern:

```javascript
// In defaultSettings.js
settings.featureName = {
  enabled: true,
  option1: 'default_value',
  option2: 42
};
```

## Common Workflows

### Building for Testing

```bash
npm run dev      # Start development build with file watching
npm run build    # Create production build
npm run lint     # Check code quality
```

### Loading Extension in Browser

**Chrome/Edge:**
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `app` folder

**Firefox:**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` from the `app` folder

**Opera:**
1. Go to `opera://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `app` folder

### Testing Workflow

1. Make code changes
2. Run `npm run lint` to check for errors
3. Run `npm run build` to build the extension
4. Reload the extension in the browser (use refresh button in extensions page)
5. Visit sg.hu and test the feature

### Debugging

**Content Script Debugging:**
- Right-click on sg.hu page → Inspect
- Go to Sources/Debugger tab
- Set breakpoints in content script code
- Use console for logging

**Background Script Debugging:**
- In browser extensions page, click "Background Page" or "Inspect" on the extension
- Set breakpoints and use console

## What Agents Can Help With

### Explore Agent ⭐
**Best for:** Understanding code structure and finding implementations

- "Where is [feature] implemented?"
- "Show me how [module] works"
- "Find all references to [DOM element/API]"
- "What files are involved in [feature]?"

### General Purpose Agent
**Best for:** Writing code, refactoring, and complex changes

- "Add a new feature that..."
- "Refactor this module to..."
- "Fix the bug where..."
- "Update this functionality to..."

### Bash Agent
**Best for:** Building, testing, and git operations

- Running npm scripts (`npm run build`, `npm run lint`)
- Git operations (commits, status, diffs)
- File operations and exploration

## Tips for Effective Agent Usage

1. **Be specific about scope** - Instead of "improve the extension", say "add a toggle for dark mode in the settings page"

2. **Reference file paths** - Use patterns like `app/scripts/modules/topik/feature.js:42` to point agents to specific locations

3. **Clarify browser target** - Specify which browser(s) the feature should work on (Chrome, Firefox, Opera)

4. **Test after changes** - Always build and test in the target browser after modifications

5. **Check for conflicts** - Before adding features, verify they don't conflict with existing functionality using Explore agent

6. **Review changes** - Have agents show you the before/after of significant changes

## Common Issues and Solutions

### Feature not working after reload
- Ensure the module is properly registered in the appropriate `index.js`
- Check that settings are initialized correctly
- Verify the DOM selectors still match sg.hu's current structure

### Settings not persisting
- Check that `chrome.storage.sync` is being used
- Verify settings key names match between defaultSettings.js and the module
- Check browser storage permissions in manifest.json

### Content script timing issues
- Content scripts run early; avoid depending on DOM elements that load later
- Use `MutationObserver` or event listeners for dynamically added content
- Consider using `setTimeout` for fallback initialization

### Cross-browser compatibility
- Test in all target browsers (Chrome, Firefox, Opera)
- Use `chrome.` API (with webextension-polyfill, works across browsers)
- Avoid browser-specific CSS features
- Test with both Manifest V2 and V3 if applicable

## Resources

- [WebExtension API Documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [webextension-toolbox Documentation](https://github.com/webextension/webextension-toolbox)
- [Project README](README.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## Quick Start for New Contributors

1. Clone the repository and run `npm install`
2. Explore the `app/scripts/modules` directory to understand existing patterns
3. Use Explore agent to find similar features as reference
4. Create your feature in a new module file
5. Add it to the appropriate `index.js`
6. Test with `npm run build` and load in browser
7. Submit changes following CONTRIBUTING.md guidelines

---

For more help with Claude Code agents, use `/help` or visit the [Claude Code documentation](https://claude.com/docs/claude-code).
