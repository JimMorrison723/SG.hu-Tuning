import { Module } from '../Module'
import { context } from '../context'

export const highlightCommentsForMe = new Module('highlightCommentsForMe')

highlightCommentsForMe.activate = () => {

  const userName = context.dataStore['user']['userName']

  // Return false when no username set
  if (!userName) {
    return false
  }

  // Get the proper domnodes
  const comment = $('li[id*="post"] footer a:contains("' + userName + '")')

  //We need exact match with the userName
  const start_pos = comment.text().indexOf('\'') + 1
  const end_pos = comment.text().indexOf('\'', start_pos)
  const TesTcomment = comment.text().substring(start_pos, end_pos)
  let comments

  if (TesTcomment === userName) {
    comments = comment.closest('li')
  }

  if (comments !== undefined) {

    // Iterate over them
    comments.each(function () {

      if ($(this).find('.ext_comments_for_me_indicator').length === 0) {

        $(this).css('position', 'relative').append('<img src="' + browser.runtime.getURL('/images/content/comments_for_me_indicator.png') + '" class="ext_comments_for_me_indicator">')

        if (document.location.href.match(/cikkek/)) {
          $(this).find('.ext_comments_for_me_indicator').addClass('article')
        } else {
          $(this).find('.ext_comments_for_me_indicator').addClass('topic')
        }
      }
    })
  }
}

highlightCommentsForMe.disable = () => {

  $('.ext_comments_for_me_indicator').remove()
}
