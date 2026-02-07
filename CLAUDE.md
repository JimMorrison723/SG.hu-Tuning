# SG.hu Tuning - Browser Extension

Enhances sg.hu (Hungarian forum) with 30+ features. Built with WXT + TypeScript + Bun.

## Commands

```bash
bun install              # Install dependencies
bun run dev              # Dev mode (Chrome)
bun run dev:firefox      # Dev mode (Firefox)
bun run build            # Production build
bun run lint             # ESLint
bun run zip              # Package for stores
```

## Structure

```
src/
├── entrypoints/         # background.ts, content/
├── modules/             # Feature modules by page type
│   ├── Module.ts        # Base class
│   ├── registry.ts      # Module registration
│   ├── always/          # All pages
│   ├── forum/           # /forum/
│   ├── topik/           # /forum/tema/
│   ├── news/            # /cikkek/
│   └── temak/           # /forum/temak/
└── utils/               # Helpers, defaultSettings.ts
```

See `src/CLAUDE.md` for module patterns and architecture details.

## Key Files

- `wxt.config.ts` - Build configuration
- `src/utils/defaultSettings.ts` - All feature defaults
- `src/modules/context.ts` - Shared state
