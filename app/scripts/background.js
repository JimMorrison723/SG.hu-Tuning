let defaultSettings = require('./util/defaultSettings')

browser.runtime.onInstalled.addListener((details) => {
  console.log('previousVersion', details.previousVersion)
})

browser.extension.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (event) {

    let list, index

    // Send back the settings object
    if (event.name === 'getSettings') {

      let gettingItem = browser.storage.sync.get(null)
      gettingItem.then(function (item) {
        port.postMessage({ name: 'setSettings', message: item })
      })

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
    } else if (event.name === 'setUserSetting') {

      let temp = { user: {} }
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
    p.postMessage({ name: 'setSettings', message: item })
  })
}

// send message about a setting has been changed
function storageChange(changes, area) {
  let changedItems = Object.keys(changes)

  for (let item of changedItems) {
    let tmp = {}
    tmp[item] = changes[item].newValue
    sendMessage({ name: 'updateSettings', message: tmp })
  }
}

function sendMessage(param) {
  ports.map(port => {
    port.postMessage(param)
  })
}

let installed = browser.storage.sync.get('installed')
installed.then(function (item) {
  if (Object.keys(item).length === 0 && item.constructor === Object) {
    browser.storage.sync.set(defaultSettings.default)
    browser.storage.sync.set({installed: true})
  }
})
browser.storage.onChanged.addListener(storageChange)
browser.runtime.onConnect.addListener(connected)
