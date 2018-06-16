import { Module } from '../module'

export const threadedComments = new Module('threadedComments')

threadedComments.activate = () => {

  // New message counter
  let newMsg = document.location.href.split('&newmsg=')[1]

  // Mark new messages if any
  if (typeof newMsg !== 'undefined' && newMsg !== '') {
    $('.header:lt(' + newMsg + ')').find('a:last').after($('<span class="thread_sep"> | </span> <span class="ext_new_comment" style="color: red;">ÚJ</span>'))
  }

  // Set prev and next button if any new messages
  if (newMsg > 0) {

    $('<span class="thread_prev">&laquo;</span>').insertBefore('.ext_new_comment')
    $('<span class="thread_next">&raquo;</span>').insertAfter('.ext_new_comment')

    // Bind events
    $('.thread_prev').on('click', function () {
      threadedComments.prev(this)
    })

    $('.thread_next').on('click', function () {
      threadedComments.next(this)
    })
  }

  // Sort comments to thread
  threadedComments.sort()
}

threadedComments.prev = (ele) => {

  // Get the index value of the current element
  let index = $(ele).index('.thread_prev')

  // Check if is it the first element
  if (index === 0) {
    return false
  }

  let target = $('.ext_new_comment').eq((index - 1)).closest('.post').children('header')

  // Target offsets
  let windowHalf = $(window).height() / 2
  let targetHalf = $(target).outerHeight() / 2
  let targetTop = $(target).offset().top
  let targetOffset = targetTop - (windowHalf - targetHalf)

  // Scroll to target element
  $('html, body').animate({ scrollTop: targetOffset }, 500)
}

threadedComments.next = (next) => {

  let ext_new_comment = $('.ext_new_comment')

  // Get the index value of the current element
  let index = $(next).index('.thread_next')

  // Check if is it the last element
  if (index + 1 >= ext_new_comment.length) {
    return false
  }

  let target = ext_new_comment.eq((index + 1)).closest('.post').children('header')

  // Target offsets
  let windowHalf = $(window).height() / 2
  let targetHalf = $(target).outerHeight() / 2
  let targetTop = $(target).offset().top
  let targetOffset = targetTop - (windowHalf - targetHalf)

  // Scroll to target element
  $('html, body').animate({ scrollTop: targetOffset }, 500)
}

threadedComments.sort = () => {

  // Sort to thread
  $($('.post:not(.checked)').get().reverse()).each(function () {

    // Check if theres an answered message
    if ($(this).find('.reply').length === 0) {

      // Add checked class
      $(this).addClass('checked')

      // Return 'true'
      return true
    }

    // Get answered comment numer
    let commentNum = $(this).find('.reply').text().split('#')[1].match(/\d+/g)

    // Seach for parent node via comment number
    $(this).appendTo($('.header a:contains("#' + commentNum[0] + '"):last').closest('.post'))

    // Set style settings
    if (document.location.href.match(/cikkek/)) {
      $(this).css({ 'margin-left': 0, 'padding-left': 15, 'border-left': '1px solid #ddd' })
      $(this).css('width', 604 - $(this).parents('.post').length * 16)
      $(this).find('.reply').hide()
    } else {
      $(this).css({ 'margin-left': 0, 'padding-left': 20, 'border-left': '1px solid #ddd' })
      $(this).css('width', 930 - ($(this).parents('.post').length) * 21)
      $(this).find('.reply').hide()
    }

    // Add checked class
    $(this).find('.topichead:first').addClass('checked')

  })
}