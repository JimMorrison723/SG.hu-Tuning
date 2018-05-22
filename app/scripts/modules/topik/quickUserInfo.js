import { Module } from '../module'

export const quickUserInfo = new Module('quickUserInfo')

quickUserInfo.activate = () => {

  $('#forum-posts-list').find('.post').each(function () {

    //Do not add the mouseenter function again if the element already has it
    if (!$(this).data('events')) {

      $($(this)).mouseenter(function () {
        if ($(this).not('.quick_user_info')) {
          //Place info image
          $(this).addClass('quick_user_info').find('span.icons').after('<span class=""><img src="' + chrome.extension.getURL('/images/content/info.png') + '" class="ext_quick_user_info_btn"></span>')
        }
        $(this).append('<div class="infobox"></div>')

        //Add EventListener
        $('img.ext_quick_user_info_btn').click(function () {
          var infobox = $('.infobox')

          //Get user profile URL
          var url = $(this).closest('header').find('a[href^="/felhasznalo"]').attr('href')

          //Fix for vip, non vip topichead height
          var th_height = $(this).closest('header').css('height').replace('px', '')

          //Get topichead pos from the top of the page
          var fromTop = $(this).closest('header').offset().top - 122

          //If "highlight_comments_for_me" is on we need to change the fromTop to the comment position
          if ($(this).closest('li').has('img.ext_comments_for_me_indicator').length ? true : false) {
            //Correct according a default padding on the messages
            fromTop = $(this).closest('header').css('padding-top').replace('px', '')
          }
          var fullHeight = parseInt(fromTop, 10) + parseInt(th_height, 10)

          //Show infobox -121
          infobox.css({ 'font-size': '10px', 'display': 'block', 'top': fullHeight })

          //Show user information in infobox
          infobox.load(url + ' table.data-table')
        });

      }).mouseleave(function () {

        //Remove info image and infobox on mouseleave
        $(this).find('.ext_quick_user_info_btn').parent().remove()
        $(this).find('.infobox').remove()
      })
    }
  })
}