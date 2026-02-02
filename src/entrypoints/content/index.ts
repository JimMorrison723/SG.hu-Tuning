import { context, type PageType } from '@/modules/context'
import { getModulesForPage } from '@/modules/registry'
import { getCookie } from '@/utils/cookies'
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
    ;(window as any).$ = jQuery
    ;(window as any).jQuery = jQuery

    // Filter out iframes
    if (window.top !== window) return

    context.port = browser.runtime.connect()

    context.port.onMessage.addListener((event: any) => {
      if (event.name === 'setSettings') {
        // Save dataStore
        context.dataStore = event.message
        getUserStatus()
        context.PAGE = whatPage()
        context.scripts = getModulesForPage(context.PAGE)
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
        context.scripts['sgTabs']?.refresh(event.message)
      }
    })

    function getUserStatus() {
      // If there is an identid cookie, the user is logged in, get username
      const ident_id = getCookie('identid')

      if (ident_id && !context.dataStore['user']['userName']) {
        const request = new XMLHttpRequest()
        request.open('GET', 'https://sg.hu/api/forum/user?apikey=se3kMt7HkaeSjdv4cNuK3jAjyab9Nz7Z&ident_id=' + ident_id, true)

        request.onload = function() {
          if (request.status >= 200 && request.status < 400) {
            const data = JSON.parse(request.responseText)
            context.dataStore['user'] = { isLoggedIn: true, userName: data.msg.nick }
            // Sync settings
            context.port!.postMessage({ name: 'setUserSetting', message: context.dataStore['user'] })
            return true
          }
        }

        request.send()

        // User is not logged in
      } else if (!ident_id) {
        context.dataStore['user'] = { isLoggedIn: false, userName: '' }
      } else if (context.dataStore['user']['userName'] && context.dataStore['user']['isLoggedIn'] === undefined) {
        jQuery.getJSON('https://sg.hu/api/forum/user/islogged?apikey=se3kMt7HkaeSjdv4cNuK3jAjyab9Nz7Z', function() {
          context.dataStore['user'] = { isLoggedIn: true, userName: context.dataStore['user']['userName'] }
        })
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
