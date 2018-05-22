import { Module } from '../module'
import { dataStore } from '../../contentscript'

export const profiles = new Module('profiles', true)

profiles.activate = () => {

  // Get the profiles object

  // Check empty
  if (!dataStore['profilesList']) {
    return false
  }

  let profiles = JSON.parse(dataStore['profilesList'])

  // Iterate over the comments
  $('#forum-posts-list').find('ul li header:not(.checked)').each(function () {
    let nick

    // Create the wrapper if not any
    if (!$(this).next().is('.wrapper')) {

      // Create the wrapper
      let wrapper = $('<div class="wrapper"></div>').insertAfter(this).css('position', 'relative')

      // Place in other elements
      //noinspection JSCheckFunctionSignatures
      $(this).parent().find('section.body, footer').appendTo(wrapper)
    }

    // Get nickname
    if (document.location.href.match(/cikkek/)) {

      nick = $(this).find('a:first').html()

    } else {

      nick = ($(this).find('a img').length === 1) ? $(this).find('a img').attr('alt') : $(this).find('a#name').text()
      nick = nick.replace(/ - VIP/, '')
    }

    // Remove old outlines and titles
    $(this).next().find('.outline').remove()
    $(this).find('.titles').remove()

    // Set the background to default and remove paddings
    //$(this).next().find('section.body, footer').css('background-color', '#F0F0F0'); // custom topik fix
    $(this).next().find('section.body, footer').css('padding', 3)

    // Iterate over the profile settings
    // Search for nickname match
    for (let c = 0; c < profiles.length; c++) {
      for (let u = 0; u < profiles[c]['users'].length; u++) {
        if (jQuery.trim(profiles[c]['users'][u]) === nick) {

          // WE GOT A MATCH

          // Title
          //noinspection JSCheckFunctionSignatures
          let placeholder = $('<span class="titles">' + profiles[c]['title'] + '</span>').appendTo($(this).find('span.icons'))
          placeholder.css('padding-left', 10)

          // Calc outline width 
          let width = (1 + $(this).parent().find('.wrapper:first .outline').length) * 8 - 8

          // Border
          //noinspection JSCheckFunctionSignatures
          let outline = $('<div class="outline"></div>').insertBefore($(this).parent().find('section.body, footer'))
          outline.css({
            width: 6,
            height: '100%',
            position: 'absolute',
            left: width,
            top: 0,
            backgroundColor: '#' + profiles[c]['color'][0]
          })

          // Background
          if (profiles[c]['background']) {
            $(this).parent().find('section.body, footer').css('background-color', '#' + profiles[c]['color'][1])
          }

          // Fix msg-text
          $(this).parent().find('section.body, footer').css('padding-left', (width + 3 + 8))
        }
      }
    }

    // Add checked marker
    $(this).addClass('checked')
  })
}