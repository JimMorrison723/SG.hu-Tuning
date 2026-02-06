import { context, type PageType, type DataStore } from '@/modules/context'
import { getModulesForPage, getAlwaysModules } from '@/modules/registry'
import { getCookie } from '@/utils/cookies'
import { getUserByIdentId, isUserLoggedIn } from '@/utils/api'
import { cp, settings } from './settings'
import '@/assets/styles/content.css'
import '@/assets/styles/settings.css'
import '@/assets/styles/cleditor.css'

export default defineContentScript({
  matches: ['https://sg.hu/*'],
  runAt: 'document_idle',

  async main() {
    // Import jQuery dynamically to avoid build-time errors
    const jQuery = (await import('jquery')).default
    // Make jQuery globally available for modules
    ;(window as unknown as Window & { $: typeof jQuery; jQuery: typeof jQuery }).$ = jQuery
    ;(window as unknown as Window & { $: typeof jQuery; jQuery: typeof jQuery }).jQuery = jQuery

    // Filter out iframes
    if (window.top !== window) return

    context.port = browser.runtime.connect()

    context.port!.onMessage.addListener((_event) => {
      const event = _event as { name: string; message: Record<string, unknown> }
      if (event.name === 'setSettings') {
        // Save dataStore
        context.dataStore = event.message as DataStore
        getUserStatus()
        context.PAGE = whatPage()
        context.scripts = { ...getAlwaysModules(), ...getModulesForPage(context.PAGE) }
        startup()
        cp.init(context.PAGE)

        // Handle setting change message
      } else if (event.name === 'updateSettings') {
        settings.update(event.message)
        for (const [key, value] of Object.entries(event.message)) {
          context.dataStore[key] = value
          if (value === true && context.scripts[key]) {
            context.scripts[key].activate()
          } else if (value === false && context.scripts[key]) {
            context.scripts[key].disable?.()
          }
        }
      } else if (event.name === 'SGTabs') {
        context.scripts['sgTabs']?.refresh?.(event.message)
      }
    })

    async function getUserStatus() {
      // If there is an identid cookie, the user is logged in, get username
      const ident_id = getCookie('identid')

      if (ident_id && !context.dataStore['user']['userName']) {
        try {
          const data = await getUserByIdentId(ident_id)
          context.dataStore['user'] = { isLoggedIn: true, userName: data.nick }
          // Sync settings
          context.port!.postMessage({ name: 'setUserSetting', message: context.dataStore['user'] })
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('Failed to get user info:', error)
        }

        // User is not logged in
      } else if (!ident_id) {
        context.dataStore['user'] = { isLoggedIn: false, userName: '' }
      } else if (context.dataStore['user']['userName'] && context.dataStore['user']['isLoggedIn'] === undefined) {
        try {
          const loggedIn = await isUserLoggedIn()
          if (loggedIn) {
            context.dataStore['user'] = { isLoggedIn: true, userName: context.dataStore['user']['userName'] }
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('Failed to check login status:', error)
        }
      }

      // Sync settings
      context.port!.postMessage({ name: 'setUserSetting', message: context.dataStore['user'] })
    }

    function whatPage(): PageType {
      const url = document.location.href

      // Forum main page
      if (url.match(/forum\/$/)) return 1

      // Topic page
      if (url.match(/forum\/tema\//)) return 2

      // Article page
      if (url.match(/cikkek/)) return 3

      // Themes page
      if (url.match(/forum\/temak/)) return 4

      return 0
    }

    function startup() {
      for (const item in context.scripts) {
        if (context.dataStore[item]) {
          context.scripts[item].activate()
        }
      }
    }
  }
})
