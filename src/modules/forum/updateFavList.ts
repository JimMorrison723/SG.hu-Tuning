import { Module } from '../Module'
import { context } from '../context'
import { safeResponse } from '@/utils/safeResponse'
import { favShowOnlyUnread } from './favShowOnlyUnread'
import { shortCommentMarker } from './shortCommentMarker'
import { highlightForumCategories } from './highlightForumCategories'
import { jumpUnreadMessages } from '../topik/jumpUnreadMessages'
import { nightMode } from '../always/nightMode'

export const updateFavList = new Module('updateFavList')

updateFavList.activate = () => {
  if (!context.dataStore['user']['isLoggedIn']) {
    return
  }

  // Create refresh button
  $('section#sidebar-user-favorites h4').append('<span style="cursor: pointer;">[<span id="ext_refresh_faves"></span>]</span>')

  const refresh_faves = $('#ext_refresh_faves')

  // Move the button away if unread faves is on
  if (context.dataStore['favShowOnlyUnread'] && context.dataStore['user']['isLoggedIn']) {
    refresh_faves.css('right', 18)
  }

  // Set refresh image
  $('<img src="' + browser.runtime.getURL('images/content/refresh.png') + '" alt="Kedvencek frissítése" title="Kedvencek frissítése">').appendTo(refresh_faves)

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
  const refresh_img = $('#ext_refresh_faves').find('img')

  // Set 'in progress' icon
  refresh_img.attr('src', browser.runtime.getURL('/images/content/refresh_waiting.png'))

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
      refresh_img.attr('src', browser.runtime.getURL('/images/content/refresh_done.png'))

      // Set back the normal icon in 1 sec
      setTimeout(function () {
        refresh_img.attr('src', browser.runtime.getURL('/images/content/refresh.png'))
      }, 1000)

      // Faves: show only with unread messages
      if (context.dataStore['favShowOnlyUnread'] === true && context.dataStore['user']['isLoggedIn']) {
        favShowOnlyUnread.activate()
      }

      // Faves: short comment marker
      if (context.dataStore['shortCommentMarker'] === true && context.dataStore['user']['isLoggedIn']) {
        shortCommentMarker.activate()
      }

      // Custom list styles
      if (context.dataStore['highlightForumCategories'] === true) {
        highlightForumCategories.activate()
      }

      // Jump the last unread message
      if (context.dataStore['jumpUnreadMessages'] === true && context.dataStore['user']['isLoggedIn']) {
        jumpUnreadMessages.activate()
      }

      //Night mode
      if (context.dataStore['nightMode'] === true) {
        nightMode.forumSwitchOn()
      }
    }
  })
}
