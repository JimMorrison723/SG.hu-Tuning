let defaultSettings = require('./util/defaultSettings')

browser.runtime.onInstalled.addListener((details) => {

  if (details.reason === 'install') {
    // Set up default values in storage
    createDefaults(details.previousVersion)
  }
  else if (details.reason === 'update') {
    // Migrate database when updating
    migrate(details.previousVersion)
  }
  // console.log('previousVersion', details.previousVersion)
})

browser.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (event) {

    let list, index

    // Send back the settings object
    if (event.name === 'getSettings') {

      let gettingItem = browser.storage.sync.get(null)
      gettingItem.then(function (item) {
        port.postMessage({name: 'setSettings', message: item})
      })
      // Sets the blocks config
    } else if (event.name === 'setBlocksConfig') {

      saveSetting('blocksConfig', event.message)

      // Add user to blocklist
    } else if (event.name === 'addToBlocklist') {

      let blocklisted = browser.storage.sync.get('blocklisted')
      blocklisted.then((setting) => {
        if (!setting['blocklisted']) {

          saveSetting('blocklisted', event.message)

          // If the blocklist is not empty
        } else {

          let blockList = browser.storage.sync.get('blocklisted')
          blockList.then((setting) => {

            if (setting['blocklisted'].split(',').indexOf(event.message) === -1) {

              setting['blocklisted'].push(event.message)
              saveSetting('blocklisted', setting['blocklisted'].join(','))
            }
          })
        }
      })
      // If the blocklist is empty

      // Reset blocks config
    } else if (event.name === 'removeUserFromBlocklist') {

      // Get username
      let user = event.message

      // Get the blocklist array
      list = browser.storage.sync.get('blocklisted')
      list.then((setting) => {

        // Get the removed user index
        index = setting['blocklisted'].split(',').indexOf(user)

        // Remove user from array
        setting['blocklisted'].splice(index, 1)

        // Update storage
        saveSetting('blocklisted', setting['blocklisted'].join(','))
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

      let whitelist = browser.storage.sync.get('topicWhitelist')
      whitelist.then((setting) => {

        // If the whitelist is empty
        if (!setting['topicWhitelist']) {

          saveSetting('topicWhitelist', event.message)

          // If the blocklist is not empty
        } else {

          if (setting['topicWhitelist'].split(',').indexOf(event.message) === -1) {
            let temp = setting['topicWhitelist'].split(',')
            temp.push(event.message)
            saveSetting('topicWhitelist', temp.join(','))
          }
        }
      })

      // Remove topic from whitelist
    } else if (event.name === 'removeTopicFromWhitelist') {

      // Get username
      let id = event.message

      // Get the blocklist array
      list = browser.storage.sync.get('topicWhitelist')
      list.then((setting) => {

        // Get the removed user index
        index = setting['topicWhitelist'].split(',').indexOf(id)

        // Remove user from array
        setting['topicWhitelist'].splice(index, 1)

        // Save changes in storage
        saveSetting('topicWhitelist', setting['topicWhitelist'].join(','))
      })
    }
  })
})

let ports = []

function connected(p) {
  ports[p.sender.tab.id] = p

  // when connected, send the settings to the content script
  let allSettings = browser.storage.sync.get(null)
  allSettings.then(function (item) {
    // only send the settings to the new page
    p.postMessage({name: 'setSettings', message: item})
  })
}

// send message about a setting has been changed
function storageChange(changes) {
  let changedItems = Object.keys(changes)

  //TODO: enable when messageCenter goes live
  // if (changedItems[0] !== 'mcMessages')
    for (let item of changedItems) {
      let tmp = {}
      tmp[item] = changes[item].newValue
      sendMessage({name: 'updateSettings', message: tmp})
    }
}

function saveSetting(key, value) {
  let temp = {}
  temp[key] = value
  browser.storage.sync.set(temp)
}

function sendMessage(param) {
  ports.map(port => {
    port.postMessage(param)
  })
}

function createDefaults() {
  // Set up storage with default values
  browser.storage.sync.set(defaultSettings.default)
  // Save version number to the database
  let manifest = browser.runtime.getManifest()
  browser.storage.sync.set({installed: manifest.version})
}

function migrate() {

  let manifest = browser.runtime.getManifest()
  let all_settings = browser.storage.sync.get(null)

  all_settings.then(function (settings) {
    // In case we added new features to the extension
    let unique_keys = Object.assign(settings, defaultSettings.default)
    unique_keys['installed'] = manifest.version
    //TODO: remove keys that are no longer present
    browser.storage.sync.set(unique_keys)
  })
}

browser.runtime.onConnect.addListener(connected)
browser.storage.onChanged.addListener(storageChange)
