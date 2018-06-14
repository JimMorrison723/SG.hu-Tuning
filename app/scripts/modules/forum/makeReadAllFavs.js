import { Module } from '../module'
import { dataStore } from '../../contentscript'
import { favShowOnlyUnread } from './favShowOnlyUnread'
import { jumpUnreadMessages } from '../topik'

export const makeReadAllFavs = new Module('makeReadAllFavs')

makeReadAllFavs.activate = () => {

  if (!dataStore['user']['isLoggedIn'])
    return

  // Create the 'read them all' button
  $('section#sidebar-user-favorites h4').append('<span style="cursor: pointer;">[<span id="ext_read_faves" style="display: inline-block;">&#9675;</span>]</span>')

  let read_faves = $('#ext_read_faves')

  // Move the button away if unreaded faves is on
  if (dataStore['favShowOnlyUnread'] && dataStore['user']['isLoggedIn']) {
    read_faves.css('right', 36)
  }

  // Add click event
  read_faves.click(function () {
    makeReadAllFavs.makeread()
  })
}

makeReadAllFavs.makeread = () => {

  let ext_read_faves = $('#ext_read_faves')

  if (confirm('Biztos olvasottnak jelölöd az összes kedvenced?')) {

    // Set 'in progress' icon
	ext_read_faves.html('&#9684;')

	// Get unread topics links
	let links = $('#favorites-list').find('a:not(.category):not(.fav-not-new-msg)')

	// Get unread topics count
	let count = links.length
    let counter = 0

    // Iterate over all faves
    links.each(function () {

      let ele = $(this)

      // Make an ajax query to refresh last readed time
      $.get($(this).attr('href'), function () {

        $(ele).find('span.new').remove()
        $(ele).find('.ext_short_comment_marker').remove()

        if (dataStore['favShowOnlyUnread'] && dataStore['favShowOnlyUnreadRememberOpened']) {
          $(ele).parent().addClass('ext_hidden_fave')
        }

        counter++
      }, 'html')
    })

    let interval = setInterval(function () {

      if (count === counter) {

        // Set 'completed' icon / black circle
		ext_read_faves.html('&#9679;')

        // Set normal icon
        setTimeout(function () {
		  ext_read_faves.html('&#9675;')
        }, 2000)

        // Faves: show only with unreaded messages
        if (dataStore['favShowOnlyUnread'] && dataStore['user']['isLoggedIn']) {
          favShowOnlyUnread.activated()
        }

        // Reset faves newmsg vars
        if (dataStore['jumpUnreadMessages'] && dataStore['user']['isLoggedIn']) {
          jumpUnreadMessages.activated()
        }

        clearInterval(interval)
      }

    }, 100)

  }

}