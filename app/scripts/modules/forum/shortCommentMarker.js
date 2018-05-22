import { Module } from '../module'

export const shortCommentMarker = new Module('shortCommentMarker')

shortCommentMarker.activate = () => {

  $('#favorites-list').find('a').each(function () {

    if ($(this).find('span[class*=new]').length > 0) {

      // Received new messages counter
      let newMsg = parseInt($(this).find('span[class=new]').html().match(/\d+/g)) // \d - non-digit character

      // Remove the old marker text
      $(this).find('span[class*=new]').hide()

      // Add the new marker after the topic title
      $(this).html($(this).html() + ' <span class="ext_short_comment_marker" style="color: red;">' + newMsg + '</span>')
    }
  })
},

shortCommentMarker.disable = () => {

  $('#favorites-list').find('a').each(function () {

    if ($(this).find('span[class*=new]').length > 0) {

      // Show old marker text
      $(this).find('span[class*=new]').show()

      // Remove ext_short_comment_marker
      $(this).find('.ext_short_comment_marker').remove()
    }
  })
}