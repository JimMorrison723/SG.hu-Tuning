import { Module } from '../Module'
import { context } from '../context'
import { safeResponse } from '@/utils/safeResponse'
import { highlightCommentsForMe } from './highlightCommentsForMe'
import { quickUserInfo } from './quickUserInfo'
import { profiles } from './profiles'
import { addToList } from './addToList'

export const fetchNewComments = new Module('fetchNewComments')

fetchNewComments.activate = () => {

  fetchNewComments.counter = 0
  fetchNewComments.last_new_msg = 0
  fetchNewComments.last_new_msg_counter = 0
  fetchNewComments.locked = false

  // Set new messages number to zero
  // Monitor new comments notification
  setInterval(function () {

    const newMessage = $('span#newMessage')

    if (newMessage.length === 0) {
      return false
    }

    // Hide the notification when fetch new comments settings is enabled
    newMessage.css({
      display: 'none !important',
      visibility: 'hidden',
      height: 0,
      margin: 0,
      padding: 0,
      border: 0
    })

    // Get new comments counter
    const newmsg = parseInt((newMessage.text().match(/\d+/g) || ['0'])[0])

    if (newmsg > fetchNewComments.last_new_msg && !fetchNewComments.locked) {

      // Rewrite the notification url
      fetchNewComments.rewrite()

      // Fetch the comments if this option is enabled
      // Set locked status to prevent multiple requests
      if (context.dataStore['fetchNewComments']) {
        fetchNewComments.locked = true
        fetchNewComments.fetch()
      }
    }
  }, 1000)
}

fetchNewComments.rewrite = () => {

  const newMessage = $('span#newMessage')

  const topic_url = newMessage.attr('href')
  const comment_c = newMessage.text().match(/\d+/g)

  newMessage.attr('href', topic_url + '&newmsg=' + comment_c)
}

fetchNewComments.fetch = async () => {

  // Check the page number
  const page = parseInt($('nav.pagination a:first').text())

  // Do nothing if we not in the first page
  if (page !== 1) {
    return false
  }

  // Update the last new msg number
  fetchNewComments.last_new_msg = parseInt((($('span#newMessage').text().match(/\d+/g)) || ['0'])[0])

  // Get the topic ID and URL
  const id = $('#topicdata').data('tid')

  const postInfo = $('.post:first').data('post-info')
  const hsz = postInfo?.msg_unique ? postInfo.msg_unique + 1 : 1
  const url = 'https://sg.hu/forum/uzenet/' + id + '/' + hsz

  try {
    const response = await fetch(url)
    const html = await response.text()

    // Increase the counter
    fetchNewComments.counter++

    // Append horizontal line
    if (fetchNewComments.counter === 1) {
      $('<hr>').insertBefore($('.post:first')).attr('id', 'ext_unread_hr')
    }

    // Parse the content
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Fetch new comments
    const commentsEl = doc.querySelector('.post')

    if (commentsEl) {
      // Filter the response - for security reasons
      const comments = safeResponse.cleanDomHtml(commentsEl)

      // Append new comments
      $('#forum-posts-list').find('ul').prepend(comments)
    }

    // Remove locked status
    fetchNewComments.locked = false

    // Reinitialize settings

    // Set-up block buttons
    addToList.activate()

    // highlight_comments_for_me
    if (context.dataStore['highlightCommentsForMe']) {
      highlightCommentsForMe.activate()
    }

    // User profiles
    if (context.dataStore['profiles']) {
      profiles.activate()
    }

    // Quick user info button
    if (context.dataStore['quickUserInfo']) {
      quickUserInfo.activate()
    }
  } catch (error) {
    console.error('Failed to fetch new comments:', error)
    fetchNewComments.locked = false
  }
}
