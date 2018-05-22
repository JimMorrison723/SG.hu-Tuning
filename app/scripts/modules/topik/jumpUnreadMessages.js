import { Module } from '../module'
import { dataStore, PAGE } from './../../contentscript'

export const jumpUnreadMessages = new Module('jumpUnreadMessages')

jumpUnreadMessages.activate = () => {

  if (PAGE == 2)
    jumpUnreadMessages.topic()

  let msgPerPage = dataStore['msgPerPage']

  $('#favorites-list').find('span').find('a').each(function () { //.ext_faves'

    // If theres a new message
    if ($(this).find('span[class="new"]').length > 0) {

      // Get the new messages count
      let newMsg = parseInt($(this).find('span[class="new"]').html().match(/\d+/g))

      // Get last msn's page number
      let page = Math.ceil(newMsg / msgPerPage)

      // Rewrite the url
      $(this).attr('href', $(this).attr('href') + '?order=desc&page=' + page + '&newmsg=' + newMsg)
      //$(this).attr('href', $(this).attr('href') + '#last-read')

      // Remove newmsg var from link
    } else if ($(this).attr('href').indexOf('&order') !== -1) {

      let start = $(this).attr('href').indexOf('&order')

      $(this).attr('href', $(this).attr('href').substring(0, start))
    }
  })
}

jumpUnreadMessages.disable = () => {

  $('#favorites-list').find('a').each(function () {

    if ($(this).attr('href').indexOf('&order') !== -1) {

      let start = $(this).attr('href').indexOf('&order')

      $(this).attr('href', $(this).attr('href').substring(0, start))
    }
  })
}

jumpUnreadMessages.topic = () => {

  let msgPerPage = dataStore['msgPerPage']

  // Get new messages counter
  let newMsg = document.location.href.split('&newmsg=')[1]

  // Return if there is not comment counter set
  if (typeof newMsg === 'undefined' || newMsg === '' || newMsg === 0) {
    return false
  }

  // Get the last msg
  let lastMsg = newMsg % msgPerPage
  let target
  let last_read = $('a#last-read')

  // Target comment element
  if ($('.ext_new_comment').length > 0) {
    target = $('.ext_new_comment:first').closest('li.forum-post')

  } else if (last_read.length > 0) {
    target = last_read.prev()

    // Insert the horizontal rule
    $('<hr>').insertAfter(target).attr('id', 'ext_unreaded_hr')

  } else {
    target = $('.topichead').closest('center').eq(lastMsg - 1)

    // Insert the horizontal rule
    $('<hr>').insertAfter(target).attr('id', 'ext_unreaded_hr')
  }

  // Append hr tag content if any
  //var content = $('a#last-read').find('li.forum-post').insertBefore('a#last-read')

  // Remove original hr tag
  last_read.remove()

  // Url to rewrite
  let url = document.location.href.replace(/&newmsg=\d+/gi, '')

  // Update the url to avoid re-jump
  history.replaceState({ page: url }, '', url)

  // Call the jump window onload
  window.onload = function () {
    jumpUnreadMessages.jump()
  }

  // Add click event the manual 'jump to last msg' button
  $('a[href*="#last-read"]').click(function (e) {
    e.preventDefault()
    jumpUnreadMessages.jump()
  })
}

jumpUnreadMessages.jump = () => {

  let hr = $('#ext_unreaded_hr')
  if (!hr) {
    return false
  }

  // Target offsets
  let windowHalf = $(window).height() / 2
  let targetHalf = $(hr).outerHeight() / 2
  let targetTop = $(hr).offset().top
  let targetOffset = targetTop - (windowHalf - targetHalf)

  // Scroll to target element
  $('html, body').animate({ scrollTop: targetOffset }, 400)
}