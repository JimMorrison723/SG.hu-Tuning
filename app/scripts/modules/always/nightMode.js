import { Module } from '../module'
import { dataStore, PAGE, port } from '../../contentscript'

export const nightMode = new Module('nightMode')

nightMode.activate = () => {
  // Forum main page
  if (PAGE === 1) {
    nightMode.topicSwitchOn()
  }
  // Topic page
  else if (PAGE === 2) {
    nightMode.forumSwitchOn()
  }
}

nightMode.init = () => {
  let state = dataStore['nightMode']
  let imgName

  if (state === true) {
    imgName = 'On'
    nightMode.topicSwitchOn()
  }
  else {
    imgName = 'Off'
    nightMode.topicSwitchOff()
  }

  // Create the Bulp button
  $('<div id="ext_nightmode" title="Éjszakai mód"></div>').prependTo('body')

  let ext_nightmode = $('#ext_nightmode')

  //Set the proper Bulp button
  ext_nightmode.css('background-image', 'url(' + chrome.extension.getURL('/images/content/lamp' + imgName + '.png') + ')')

  // Add click event to Bulp button
  ext_nightmode.click(function () {

    let state = dataStore['nightMode']

    if (state) {

      //Night mode ON
      ext_nightmode.css('background-image', 'url(' + chrome.extension.getURL('/images/content/lampOff.png') + ')')

      //Save in dataStore
      dataStore['nightMode'] = false

      nightMode.topicSwitchOff()
    } else {

      //Night mode Off
      ext_nightmode.css('background-image', 'url(' + chrome.extension.getURL('/images/content/lampOn.png') + ')')

      //Save in dataStore
      dataStore['nightMode'] = true

      nightMode.topicSwitchOn()
    }

    let data = dataStore['nightMode']

    // Save in localStorage
    port.postMessage({ name: 'setSetting', key: 'nightMode', val: data })
  })
},

nightMode.topicSwitchOn = () => {

  $('body').css('background-image', 'url(' + chrome.extension.getURL('/images/content/background.png') + ')')
  $('nav#menu-family').css({ 'color': '#807D7D' })
  $('#content').addClass('night_mainTable')
  $('.oldal-path-2').addClass('night_mainTable')
  $('header').addClass('night_topichead')
  $('section.body').addClass('night_p')
  $('li.forum-post a').css({ 'color': '#F0DC82 !important' })
  $('footer.footer').addClass('night_bottom')
  $('a.show-message').css({ 'color': '#CC7722 !important' })
  $('#footer-top').css({ 'opacity': '0.1' })
},

nightMode.topicSwitchOff = () => {

  $('body').css('background-image', '')
  $('nav#menu-family').css({ 'color': 'black' })
  $('#content').removeClass('night_mainTable')
  $('.oldal-path-2').removeClass('night_mainTable')
  $('header').removeClass('night_topichead')
  $('section.body').removeClass('night_p')
  $('li.forum-post a').removeClass('night_p a')
  $('footer.footer').removeClass('night_bottom')
  $('a.show-message').removeClass('night_replyto')
},

nightMode.forumSwitchOn = () => {

  $('body').css('background-image', 'url(' + chrome.extension.getURL('/images/content/background.png') + ')')
  $('#content').addClass('night_mainTable')
  $('span, a, h4').css({ 'color': 'rgb(119, 119, 119)' })

  //Chat
  /*setTimeout(function() {*/
  $('span .new').css({ 'color': 'rgb(190, 11, 11)' })
  $('#forum-chat-input').css({ 'background': 'black', 'color': 'rgb(155, 155, 155)' })
  setTimeout(function () {
    $('ul#forum-chat-list li:odd').css({ 'background-color': 'black' })
    $('ul#forum-chat-list li:even').css({ 'background-color': '#252525' })
  }, 2000)
}