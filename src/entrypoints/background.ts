import defaultSettings from '@/utils/defaultSettings'

export default defineBackground(() => {
  const ports: Record<number, browser.Runtime.Port> = {}

  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      createDefaults()
    } else if (details.reason === 'update') {
      migrate()
    }
  })

  browser.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((event: any) => {
      let list, index

      // Send back the settings object
      if (event.name === 'getSettings') {
        browser.storage.sync.get(null).then((item) => {
          port.postMessage({ name: 'setSettings', message: item })
        })

        // Sets the blocks config
      } else if (event.name === 'setBlocksConfig') {
        saveSetting('blocksConfig', event.message)

        // Add user to blocklist
      } else if (event.name === 'addToBlocklist') {
        browser.storage.sync.get('blocklisted').then((setting) => {
          if (!setting['blocklisted']) {
            saveSetting('blocklisted', event.message)
          } else {
            browser.storage.sync.get('blocklisted').then((setting) => {
              const blocklistedUsers = setting['blocklisted'].split(',')

              if (blocklistedUsers.indexOf(event.message) === -1) {
                blocklistedUsers.push(event.message)
                saveSetting('blocklisted', blocklistedUsers.join(','))
              }
            })
          }
        })

        // Remove user from blocklist
      } else if (event.name === 'removeUserFromBlocklist') {
        const user = event.message

        browser.storage.sync.get('blocklisted').then((setting) => {
          const blocklist = setting['blocklisted'].split(',')
          index = blocklist.indexOf(user)
          blocklist.splice(index, 1)
          saveSetting('blocklisted', blocklist.join(','))
        })

        // Save posted settings
      } else if (event.name === 'setSetting') {
        saveSetting(event.key, event.val)

        // Reset blocks config
      } else if (event.name === 'resetBlocksConfig') {
        saveSetting('blocksConfig', '')

      } else if (event.name === 'setUserSetting') {
        saveSetting('user', event.message)

        // Store selected tab in message center
      } else if (event.name === 'setMCSelectedTab') {
        saveSetting('mcSelectedTab', event.message)

        // Store own messages for message center
      } else if (event.name === 'setMCMessages') {
        saveSetting('mcMessages', event.message)

        // Add topic to whitelist
      } else if (event.name === 'addTopicToWhitelist') {
        browser.storage.sync.get('topicWhitelist').then((setting) => {
          if (!setting['topicWhitelist']) {
            saveSetting('topicWhitelist', event.message)
          } else {
            if (setting['topicWhitelist'].split(',').indexOf(event.message) === -1) {
              const temp = setting['topicWhitelist'].split(',')
              temp.push(event.message)
              saveSetting('topicWhitelist', temp.join(','))
            }
          }
        })

        // Remove topic from whitelist
      } else if (event.name === 'removeTopicFromWhitelist') {
        const id = event.message

        browser.storage.sync.get('topicWhitelist').then((setting) => {
          const whitelist = setting['topicWhitelist'].split(',')
          index = whitelist.indexOf(id)
          whitelist.splice(index, 1)
          saveSetting('topicWhitelist', whitelist.join(','))
        })
      }
    })
  })

  function updateSGTabs() {
    const sgTabs: Array<{ id: number; url: string }> = []

    browser.tabs.query({ url: 'https://sg.hu/forum/*/*' }).then((tabs) => {
      for (const tab of tabs) {
        if (tab.id && tab.url) {
          sgTabs.push({ id: tab.id, url: tab.url })
        }
      }

      // Clean tab urls
      for (const page of sgTabs) {
        page.url = page.url.replace('https://sg.hu', '')
      }

      // Send info to sg pages
      Object.values(ports).forEach((p) =>
        p.postMessage({ name: 'SGTabs', message: sgTabs })
      )
    })
  }

  function connected(p: browser.Runtime.Port) {
    if (p.sender?.tab?.id) {
      ports[p.sender.tab.id] = p

      // When connected, send the settings to the content script
      browser.storage.sync.get(null).then((item) => {
        p.postMessage({ name: 'setSettings', message: item })
        updateSGTabs()
      })
    }
  }

  // Send message about a setting has been changed
  function storageChange(changes: Record<string, browser.Storage.StorageChange>) {
    const changedItems = Object.keys(changes)

    for (const item of changedItems) {
      const tmp: Record<string, any> = {}
      tmp[item] = changes[item].newValue
      sendMessage({ name: 'updateSettings', message: tmp })
    }
  }

  function saveSetting(key: string, value: any) {
    const temp: Record<string, any> = {}
    temp[key] = value
    browser.storage.sync.set(temp)
  }

  function sendMessage(param: any) {
    Object.values(ports).forEach((port) => {
      port.postMessage(param)
    })
  }

  function createDefaults() {
    browser.storage.sync.set(defaultSettings)
    const manifest = browser.runtime.getManifest()
    browser.storage.sync.set({ installed: manifest.version })
  }

  function migrate() {
    const manifest = browser.runtime.getManifest()

    browser.storage.sync.get(null).then((settings) => {
      const unique_keys = Object.assign({}, defaultSettings, settings)
      unique_keys['installed'] = manifest.version
      browser.storage.sync.set(unique_keys)
    })
  }

  browser.runtime.onConnect.addListener(connected)
  browser.storage.onChanged.addListener(storageChange)
  browser.tabs.onRemoved.addListener((tabId) => {
    delete ports[tabId]
    updateSGTabs()
  })
})
