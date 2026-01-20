# SG.hu Tuning

Ha szeretnél segíteni, csak küldj egy pull-requestet a módosításaiddal. Legyen szó bugfix-ról, apróbb módosításról, esetleg teljesen új funkció bevezetéséről. 

## Dokumentumok

A kiegészítő a webextension-toolbox-ot használja. 
* [webextension-toolbox](https://github.com/HaNdTriX/webextension-toolbox)

## Követelmények

- [Bun](https://bun.sh) (latest version)

## Install

```bash
bun install
```

## Development

```bash
bun run dev chrome
bun run dev firefox
```

## Build

```bash
bun run build chrome
bun run build firefox
```

## Lint

```bash
bun run lint
```

## Environment

The build tool also defines a variable named `process.env.NODE_ENV` in your scripts. 

