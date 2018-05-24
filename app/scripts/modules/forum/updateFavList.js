import { Module } from '../module'
import { dataStore } from '../../contentscript'
import { safeResponse } from '../../util/safeResponse'
import { favShowOnlyUnread } from './favShowOnlyUnread'
import { shortCommentMarker } from './shortCommentMarker'
import { highlightForumCategories } from './highlightForumCategories'
import { jumpUnreadMessages } from '../topik'

export const updateFavList = new Module('updateFavList')

updateFavList.activate = () => {

  if (!dataStore['user']['isLoggedIn'])
    return

  // Disable site's built-in auto-update by remove "fkedvenc" ID
  $('#fkedvenc').removeAttr('id')

  // Create refhref button
  // ha lesz blokkok átrendezése, akkor #ext_left_sidebar után már nem kell inline style
  $('section#sidebar-user-favorites h4').append('<span style="cursor: pointer;">[<div id="ext_refresh_faves" style="display: inline-block;"></div>]</span>')

  let refresh_faves = $('#ext_refresh_faves')

  // Move the button away if unreaded faves is on
  if (dataStore['fav_show_only_unreaded'] === 'true' && isLoggedIn()) {
    refresh_faves.css('right', 18)
  }

  // Set refresh image
  // TODO: Erre valamit ki kell találni
  $('<img src="' + browser.extension.getURL('/images/content/refresh.png') + '">').appendTo('#ext_refresh_faves')

  // Add click event
  refresh_faves.on('click', 'img', function () {
    updateFavList.refresh()
  })

  // Set up auto-update
  setInterval(function () {
    updateFavList.refresh()
  }, 30000)
}

updateFavList.refresh = () => {

  let refresh_img = $('#ext_refresh_faves').find('img')

  // Set 'in progress' icon
  refresh_img.attr('src', browser.extension.getURL('/images/content/refresh_waiting.png'))

  $.ajax({
    url: 'https://sg.hu/forum/',
    mimeType: 'text/html;charset=utf-8',
    dataType: 'html',

    success: function (temp) {

      let data = $('nav#favorites-list', temp)

      // Filter the response - for security reasons
      data = safeResponse.cleanDomHtml(data[0])

      // Update fav list
      $('nav#favorites-list').html(data)

      // Set 'completed' icon
      refresh_img.attr('src', browser.extension.getURL('/images/content/refresh_done.png'))

      // Set back the normal icon in 1 sec
      setTimeout(function () {
        refresh_img.attr('src', browser.extension.getURL('/images/content/refresh.png'))
      }, 1000)

      // Faves: show only with unreaded messages
      if (dataStore['favShowOnlyUnread'] === true && dataStore['user']['isLoggedIn']) {
        favShowOnlyUnread.activate()
      }

      // Faves: short comment marker
      if (dataStore['shortCommentMarker'] === true && dataStore['user']['isLoggedIn']) {
        shortCommentMarker.activate()
      }

      // Custom list styles
      if (dataStore['highlightForumCategories'] === true) {
        highlightForumCategories.activate()
      }

      // Jump the last unreaded message
      if (dataStore['jumpUnreadMessages'] === true && dataStore['user']['isLoggedIn']) {
        jumpUnreadMessages.activate()
      }
    }
  })
}