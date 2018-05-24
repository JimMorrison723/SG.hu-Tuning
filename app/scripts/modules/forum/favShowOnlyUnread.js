import { Module } from '../module'
import { port, dataStore } from '../../contentscript'

export const favShowOnlyUnread = new Module('favShowOnlyUnread')

favShowOnlyUnread.opened = false

favShowOnlyUnread.init = () => {

  if (dataStore['favShowOnlyUnreadRemember'] === true) {
    favShowOnlyUnread.opened = false
  }
  if (dataStore['favShowOnlyUnreadOpened'] === true) {
    $('#favorites-open-close-button').find('#icon').html('-')
  }
}

favShowOnlyUnread.activate = () => {

  favShowOnlyUnread.init()

  let ext_faves = $('.ext_faves')

  // Remove original toggle button
  $('div[class*="csakujuzi"]').remove()

  // Remove style tags from faves containers
  ext_faves.next().children('nav').removeAttr('style')

  // Disable page auto-hide function
  // setCookie('favs', 'true', 365)

  // Move the button away to place toggle button
  $('#ext_refresh_faves').css('right', 18)
  $('#ext_read_faves').css('right', 36)

  let fav_list = $('#favorites-list')
  let ext_wrapper = $('#ext_nav_faves_wrapper')
  let ext_filtered_faves = $('#ext_show_filtered_faves')
  let ext_filtered_faves_arrow = $('#ext_show_filtered_faves_arrow')
  let ext_filtered_error = $('#ext_filtered_faves_error')
  let AllLength = fav_list.find('a[class*="category-"]').length
  let unread_length = fav_list.find('a[class^="category-"][class*="fav-not-new-msg"]').length

  //Fix
  if (typeof unread_length === undefined) {
    unread_length = 0
  }

  // Remove old toggle button if any
  ext_filtered_faves.remove()

  // Set the toggle button
  if (ext_wrapper.length) {
    ext_wrapper.prepend('<div id="ext_show_filtered_faves"></div>')
  } else {
    ext_faves.next().append('<div id="ext_show_filtered_faves"></div>')
  }
  ext_filtered_faves.append('<span id="ext_show_filtered_faves_arrow"></span>')

  // Apply some styles
  ext_filtered_faves_arrow.attr('class', 'show')

  // Set event handling
  $('#favorites-open-close-button').on('click', function (e) {
    e.preventDefault()
    if (favShowOnlyUnread.opened === false) {
      // nyitva
      // Show topics with no new msg
      ext_filtered_error.hide()
      ext_filtered_faves_arrow.attr('class', 'hide')
      fav_list.find('.fav-not-new-msg').hide()

      favShowOnlyUnread.opened = true

      // Update last state in LocalStorage
      port.postMessage({ name: 'setSetting', key: 'updateFavesFilterLastState', val: true })
      port.postMessage({ name: 'setSetting', key: 'favShowOnlyUnreadOpened', val: true })

      // Reposition the popup if any
      if ($(this).closest('#ext_nav_faves_wrapper').length) {
        show_navigation_buttons.findPosition(ext_wrapper, $('#ext_nav_faves'))
      }

    } else {

      // Don't show topics with new msg
      ext_filtered_error.show()
      ext_filtered_faves_arrow.attr('class', 'show')
      fav_list.find('.fav-not-new-msg').show() //.ext_hidden_fave

      favShowOnlyUnread.opened = false

      // Update last state in LocalStorage
      port.postMessage({ name: 'setSetting', key: 'updateFavesFilterLastState', val: false })
      port.postMessage({ name: 'setSetting', key: 'favShowOnlyUnreadOpened', val: false })

      // Reposition the popup if any
      if ($(this).closest('#ext_nav_faves_wrapper').length) {
        show_navigation_buttons.findPosition(ext_wrapper, $('#ext_nav_faves'))
      }
    }
  })

  // Create an error message if there is no topic with unread messages
  if (AllLength === unread_length && ext_filtered_error.length === 0) {
    ext_faves.after('<p id="ext_filtered_faves_error">Nincs olvasatlan téma</p>')
  }

  // Check opened status
  if (favShowOnlyUnread.opened === true) {
    ext_filtered_error.hide()
    ext_filtered_faves_arrow.attr('class', 'hide')
    $('.fav-not-new-msg').show()
  }
  else {
    ext_filtered_error.show()
    ext_filtered_faves_arrow.attr('class', 'show')
    fav_list.find('.fav-not-new-msg').hide()
  }
}

favShowOnlyUnread.disable = () => {

  // Remove toggle button
  $('#ext_show_filtered_faves').remove()

  // Put back the buttons to the right side
  $('#ext_read_faves').css('right', 18)
}