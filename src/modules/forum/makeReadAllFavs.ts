import { Module } from '../Module'
import { context } from '../context'
import { favShowOnlyUnread } from './favShowOnlyUnread'
import { jumpUnreadMessages } from '../topik/jumpUnreadMessages'

export const makeReadAllFavs = new Module('makeReadAllFavs')

makeReadAllFavs.activate = () => {
  if (!context.dataStore['user']['isLoggedIn']) return

  // Create the 'read them all' button
  $('section#sidebar-user-favorites h4').append('<span style="cursor: pointer;">[<span id="ext_read_faves" style="display: inline-block;">&#9675;</span>]</span>')

  const read_faves = $('#ext_read_faves')

  // Move the button away if unreaded faves is on
  if (context.dataStore['favShowOnlyUnread'] && context.dataStore['user']['isLoggedIn']) {
    read_faves.css('right', 36)
  }

  // Add click event
  read_faves.click(function () {
    makeReadAllFavs.makeread()
  })
}

makeReadAllFavs.makeread = () => {
  const ext_read_faves = $('#ext_read_faves')

  if (confirm('Biztos olvasottnak jelölöd az összes kedvenced?')) {
    // Set 'in progress' icon
    ext_read_faves.html('&#9684;')

    // Get unread topics links
    const links = $('#favorites-list').find('a:not(.category):not(.fav-not-new-msg)')

    // Get unread topics count
    const count = links.length
    let counter = 0

    // Iterate over all faves
    links.each(function () {
      const ele = $(this)

      // Make an ajax query to refresh last readed time
      $.get($(this).attr('href') || '', function () {
        $(ele).find('span.new').remove()
        $(ele).find('.ext_short_comment_marker').remove()

        if (context.dataStore['favShowOnlyUnread'] && context.dataStore['favShowOnlyUnreadRememberOpened']) {
          $(ele).parent().addClass('ext_hidden_fave')
        }

        counter++
      }, 'html')
    })

    const interval = setInterval(function () {
      if (count === counter) {
        // Set 'completed' icon / black circle
        ext_read_faves.html('&#9679;')

        // Set normal icon
        setTimeout(function () {
          ext_read_faves.html('&#9675;')
        }, 2000)

        // Faves: show only with unreaded messages
        if (context.dataStore['favShowOnlyUnread'] && context.dataStore['user']['isLoggedIn']) {
          favShowOnlyUnread.activate()
        }

        // Reset faves newmsg vars
        if (context.dataStore['jumpUnreadMessages'] && context.dataStore['user']['isLoggedIn']) {
          jumpUnreadMessages.activate()
        }

        clearInterval(interval)
      }
    }, 100)
  }
}
