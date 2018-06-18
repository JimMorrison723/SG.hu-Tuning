import { Module } from '../module'
import { dataStore } from '../../contentscript'
import { safeResponse } from '../../util/safeResponse'
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
  // newMessage.html('0 új hozzászólás érkezett!');
  // Monitor new comments notification
  setInterval(function () {

    let newMessage = $('span#newMessage')

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
    let newmsg = parseInt(newMessage.text().match(/\d+/g))

    if (newmsg > fetchNewComments.last_new_msg && !fetchNewComments.locked) {

      // Rewrite the notification url
      fetchNewComments.rewrite()

      // Fetch the comments if this option is enabled
      // Set locked status to prevent multiple requests
      if (dataStore['fetchNewComments']) {
        fetchNewComments.locked = true
        fetchNewComments.fetch()
      }
    }
  }, 1000)
}

fetchNewComments.rewrite = () => {

  let newMessage = $('span#newMessage')

  /*let topic_url = $('a#forum-new-messages').attr('href').substring(0, 12);*/
  let topic_url = newMessage.attr('href')
  let comment_c = newMessage.text().match(/\d+/g)

  newMessage.attr('href', topic_url + '&newmsg=' + comment_c)
}

fetchNewComments.fetch = () => {

  //TODO: use API

  // Check the page number
  let page = parseInt($('nav.pagination a:first').text())

  // Do nothing if we not in the first page
  if (page !== 1) {
    return false
  }

  // Get new comments counter
  //let newmsg = parseInt($('span#newMessage').text().match(/\d+/g));

  // Update the newmsg
  //let new_comments = newmsg - fetch_new_comments_in_topic.last_new_msg;

  // Update the last new msg number = newmsg
  fetchNewComments.last_new_msg = parseInt($('span#newMessage').text().match(/\d+/g))

  // Get the topik ID and URL
  let id = $('#topicdata').data('tid')

  let hsz = $('.post:first').data('post-info').msg_unique + 1
  // let url = 'https://sg.hu/api/forum/message?topicId=' + id + '&unique=' + hsz;
  let url = 'https://sg.hu/forum/uzenet/' + id + '/' + hsz

  // Get topic contents
  $.ajax({
    url: url,
    contentType: 'text/html; charset=utf-8',
    dataType: 'html',

    success: function (data) {

      // Increase the counter
      fetchNewComments.counter++

      // Append horizontal line
      if (fetchNewComments.counter === 1) {
        $('<hr>').insertBefore($('.post:first')).attr('id', 'ext_unread_hr')
      }

      // Parse the content
      let tmp = $(data)

      // Fetch new comments
      let comments = $(tmp).find('.post')

      // Filter the response - for security reasons
      comments = safeResponse.cleanDomHtml(comments[0])

      // Append new comments
      $('#forum-posts-list').find('ul').prepend(comments)

      // Remove locked status
      fetchNewComments.locked = false

      // Reinitialize settings

      // Set-up block buttons
      addToList.activate()

      // highlight_comments_for_me
      if (dataStore['highlightCommentsForMe']) {
        highlightCommentsForMe.activate()
      }

      // User profiles
      if (dataStore['profiles']) {
        profiles.activated()
      }

      //Quick user info button
      if (dataStore['quickUserInfo']) {
        quickUserInfo.activated()
      }

      // Night mode
      // if (dataStore['show_navigation_buttons_night']) {
      //   lights.topic_switchOn()
      // }
    }
  })
}