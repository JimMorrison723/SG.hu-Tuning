import { defineConfig } from 'wxt'

export default defineConfig({
  srcDir: 'src',
  outDir: 'dist',
  manifestVersion: 3,
  manifest: {
    name: '__MSG_appName__',
    author: {
      email: 'bali723@gmail.com'
    },
    short_name: '__MSG_appShortName__',
    description: '__MSG_appDescription__',
    default_locale: 'hu',
    permissions: ['cookies', 'notifications', 'storage', 'tabs'],
    web_accessible_resources: [
      {
        resources: ['images/*/*.png'],
        matches: ['<all_urls>'],
      },
    ],
    browser_specific_settings: {
      gecko: {
        id: 'jid0-lXuvrBz88C18gU77Igt8aau7ZyY@jetpack',
        strict_min_version: '48.0',
      },
    },
  },
  webExt: {
    startUrls: ['https://sg.hu/forum/'],
  },
})
