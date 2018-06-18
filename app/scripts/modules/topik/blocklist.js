import { Module } from '../module'
import { port, dataStore } from '../../contentscript'

export const blocklist = new Module('blocklist', true)

blocklist.activate = () => {

  // Return false if theres no blocklist entry
  if (typeof dataStore['blocklisted'] === 'undefined' || dataStore['blocklisted'] === '') {
    return false
  }

  let deletelist = dataStore['blocklisted'].split(',')

  $('.forum-post').find('header').each(function () {
    let nick
    if (document.location.href.match(/cikkek/)) {

      nick = $(this).find('a:first').html()

    } else {

      if ($(this).find('a img').length === 1) {
        nick = $(this).find('a img').attr('alt')
      } else {
        nick = $(this).find('a#name').text()
      }

      nick = nick.replace(/ - VIP/, '')
    }

    for (let i = 0; i < deletelist.length; i++) {
      if (nick.toLowerCase() === deletelist[i].toLowerCase()) {
        $(this).closest('li.forum-post').hide()
      }
    }
  })
}

export function unblock(user) {

  $('.forum-post').find('header').each(function () {

    let nick
    if (document.location.href.match(/cikkek/)) {

      nick = $(this).find('a:first').html()
    } else {

      if ($(this).find('a img').length === 1) {
        nick = $(this).find('a img').attr('alt')
      } else {
        nick = $(this).find('a#name').text()
      }

      nick = nick.replace(/ - VIP/, '')
    }

    if (nick.toLowerCase() === user.toLowerCase()) {

      // Show temporary the comment height
      $(this).closest('li.forum-post').css({ display: 'block', height: 'auto' })

      // Get height
      let height = $(this).closest('li.forum-post').height()

      // Set back to invisible, then animate
      $(this).closest('li.forum-post').css({ height: 0 }).animate({ opacity: 1, height: height }, 500)
    }
  })
}

export function block(el) {
  let nick = ''

  let anchor = $(el).closest('#forum-posts-list ul li header').find('a[href*="/felhasznalo"]')
  let tmpUrl = anchor.attr('href')

  if (anchor.children('img').length > 0) {
    nick = anchor.children('img').attr('title').replace(' - VIP', '')

  } else {
    nick = anchor.html().replace(' - VIP', '')
  }

  if (confirm('Biztos tiltólistára teszed "' + nick + '" nevű felhasználót?')) {

    $('.forum-post').find('header a[href="' + tmpUrl + '"]').each(function () {

      // Remove the comment
      $(this).closest('li.forum-post').animate({ height: 0, opacity: 0 }, 500, function () {
        $(this).hide()
      })
    })

    // Store new settings in localStorage
    port.postMessage({ name: 'addToBlocklist', message: nick })

    // Add name to blocklist
    $('<li><span>' + nick + '</span> <a href="#">töröl</a></li>').appendTo('#ext_block-list')

    // Remove empty blocklist message
    $('#ext_empty_block-list').remove()
  }
}