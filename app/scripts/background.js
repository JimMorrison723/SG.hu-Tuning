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

      let temp = {}
      temp['blocksConfig'] = event.message
      browser.storage.sync.set(temp)

      // Add user to blocklist
    } else if (event.name === 'addToBlocklist') {

      // If the blocklist is empty
      if (localStorage['blocklisted'] === '' || localStorage['blocklisted'] === undefined) {
        localStorage['blocklisted'] = event.message
        let temp = {}
        temp['blocklisted'] = event.message
        browser.storage.sync.set(temp)

        // If the blocklist is not empty
      } else {
        let blockList = localStorage['blocklisted'].split(',')
        if (blockList.indexOf(event.message) === -1) {
          blockList.push(event.message)
          localStorage['blocklisted'] = blockList.join(',')
          let temp = {}
          temp['blocklisted'] = localStorage['blocklisted']
          browser.storage.sync.set(temp)
        }
      }
      // Reset blocks config
    } else if (event.name === 'removeUserFromBlocklist') {

      // Get username
      let user = event.message

      // Get the blocklist array
      list = localStorage['blocklisted'].split(',')

      // Get the removed user index
      index = list.indexOf(user)

      // Remove user from array
      list.splice(index, 1)

      // Save changes in localStorage
      localStorage['blocklisted'] = list.join(',')

      // Update dataStore
      let temp = {}
      temp['blocklisted'] = localStorage['blocklisted']
      browser.storage.sync.set(temp)

      // Save posted settings
    } else if (event.name === 'setSetting') {

      let temp = {}
      temp[event.key] = event.val
      browser.storage.sync.set(temp)

      // Reset blocks config
    } else if (event.name === 'resetBlocksConfig') {

      browser.storage.sync.set({'blocksConfig': ''})

    } else if (event.name === 'setUserSetting') {

      let temp = {user: {}}
      temp['user'] = event.msg
      browser.storage.sync.set(temp)
    }
  })
})

let ports = []

function connected(p) {
  ports[p.sender.tab.id] = p

  // when connected, send the settings to the contentscript
  let allSettings = browser.storage.sync.get(null)
  allSettings.then(function (item) {
    // only send the settings to the new page
    p.postMessage({name: 'setSettings', message: item})
  })
}

// send message about a setting has been changed
function storageChange(changes, area) { // eslint-disable-line no-unused-vars
  let changedItems = Object.keys(changes)

  for (let item of changedItems) {
    let tmp = {}
    tmp[item] = changes[item].newValue
    sendMessage({name: 'updateSettings', message: tmp})
  }
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
