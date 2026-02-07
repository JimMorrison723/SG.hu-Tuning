# SG.hu Tuning

Ha szeretnél segíteni, csak küldj egy pull-requestet a módosításaiddal. Legyen szó bugfix-ról, apróbb módosításról, esetleg teljesen új funkció bevezetéséről.

## Dokumentumok

A kiegészítő a WXT (Web Extension Tools) keretrendszert használja.
* [WXT Framework](https://wxt.dev)

## Követelmények

- [Bun](https://bun.sh) (latest version)

## Install

```bash
bun install
```

## Development

```bash
bun run dev           # Chrome (default)
bun run dev:firefox   # Firefox
```

## Build

```bash
bun run build           # Chrome (default)
bun run build:firefox   # Firefox
```

## Lint

```bash
bun run lint
```

## Environment

WXT provides environment variables and build configuration through `wxt.config.ts`.
