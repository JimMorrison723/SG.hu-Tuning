import { getCookie } from './util/cookies'
import { cp, settings } from './settings'

export let port
export let dataStore
export let scripts = {}
export let PAGE // 1 = forum, 2 = topics, 3 = news, 4 = temak

let router_json = require('./modules/router.json')

function router() {
  // TODO: find a better way for conditional import
  // Hack. maybe PAGE.toString() will be needed later down the line
  scripts = require(`${router_json[PAGE]['scripts']}`)
}

function getUserStatus() {

  // if there is an identid cookie, the user is logged in, get username
  let ident_id = getCookie('identid')

  if (ident_id && !dataStore['user']['userName']) {
    let request = new XMLHttpRequest()
    request.open('GET', 'https://sg.hu/api/forum/user?apikey=se3kMt7HkaeSjdv4cNuK3jAjyab9Nz7Z&ident_id=' + ident_id, true)

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {

        let data = JSON.parse(request.responseText)
        dataStore['user'] = { isLoggedIn: true, userName: data.msg.nick }
        // sync settings
        port.postMessage({ name: 'setUserSetting', message: dataStore['user'] })
        return true
      }
    }

    request.send()

    // User is not logged in
  } else if (!ident_id) {
    dataStore['user'] = { isLoggedIn: false, userName: '' }
  }
  else if (dataStore['user']['userName'] && dataStore['user']['isLoggedIn'] === undefined) {
    $.getJSON('https://sg.hu/api/forum/user/islogged?apikey=se3kMt7HkaeSjdv4cNuK3jAjyab9Nz7Z', function () {

      dataStore['user'] = { isLoggedIn: true, userName: dataStore['user']['userName'] }
    })
  }

  // sync settings
  port.postMessage({ name: 'setUserSetting', message: dataStore['user'] })
}

function whatPage() {

  // Forum main page
  if (document.location.href.match(/forum\/$/)) return PAGE = 1

  // Topic page
  else if (document.location.href.match(/forum\/tema\//)) return PAGE = 2

  // Article page
  else if (document.location.href.match(/cikkek/)) return PAGE = 3

  // Themes page
  else if (document.location.href.match(/forum\/temak/)) return PAGE = 4

  else return PAGE = 0
}

function startup() {

  for (let item in scripts) {
    if (dataStore[item]) {
      scripts[item].activate()
    }
  }

}

// Filter out iframes
if (window.top === window) {
  port = browser.runtime.connect()
}

port.onMessage.addListener(function (event) {

  if (event.name === 'setSettings') {

    // save dataStore
    dataStore = event.message
    getUserStatus()
    whatPage()
    router()
    startup()
    cp.init(PAGE)

    // handle setting change message
  } else if (event.name === 'updateSettings') {

    // update settings with the new data
    settings.update(event.message)
    for (const [key, value] of Object.entries(event.message)) {
      dataStore[key] = value
      if (value === true) {
        scripts[key].activate()
      } else if (value === false) {
        scripts[key].disable()
      }
      // else
      //   scripts[key].init()
    }
  } else if (event.name === 'SGTabs') {
    scripts['sgTabs'].refresh(event.message)
  }
})
