import { Module } from '../module'
import { dataStore } from '../../contentscript'
import { jumpUnreadMessages } from './jumpUnreadMessages'
import { favShowOnlyUnread } from '../forum'
import { shortCommentMarker } from '../forum'
import { safeResponse } from '../../util/safeResponse'

export const showNavigationButtons = new Module('showNavigationButtons')

showNavigationButtons.activate = () => {

  // Create the scrolltop button
  $('<div id="ext_scrolltop" title="Ugrás az oldal tetejére">&#9650;</div>').prependTo('body')
  // Created the back button
  $('<div id="ext_back" title="Főoldal">&#9664;</div>').prependTo('body')

  let ext_scrolltop = $('#ext_scrolltop')
  let ext_back = $('#ext_back')
  let ext_nav_faves = ''
  let ext_nightmode = ''
  let ext_search = ''
  let ext_whitelist = ''

  // Add click event to scrolltop button
  ext_scrolltop.on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 400)
  })

  // Add event to back button
  ext_back.on('click', function () {
    if (document.location.href.match(/cikkek/)) {
      document.location.href = 'https://sg.hu/'
    } else {
      document.location.href = 'https://sg.hu/forum/'
    }
  })

  if (!document.location.href.match(/cikkek/) && !document.location.href.match(/uzenetek/)) {

    // Create search button
    $('<div id="ext_search" title="Keresés"></div>').prependTo('body')

    // Place search overlay arrow
    $('<div id="ext_overlay_search_arrow"></div>').appendTo('body')

    ext_search = $('#ext_search')

    // Place search icon background
    ext_search.css('background-image', 'url(' + chrome.extension.getURL('/images/content/search.png') + ')')

    // Create the search event
    ext_search.on('click', function () {
      if ($('#ext_overlay_search').length) {
        showNavigationButtons.removeOverlay()
      } else {
        showNavigationButtons.showSearch()
      }
    })
  }

  // Execute when the user is logged in
  if (dataStore['user']['userName'] || document.location.href.match(/uzenetek/)) {

    // Create faves button
    $('<div id="ext_nav_faves" title="Kedvencek"></div>').prependTo('body')

    ext_nav_faves = $('#ext_nav_faves')

    // Place the faves icon
    ext_nav_faves.css('background-image', 'url(' + chrome.extension.getURL('/images/content/star.png') + ')')

    // Place faves opened cotainer
    $('<p id="ext_nav_faves_arrow"></p>').prependTo('body')
    $('<div id="ext_nav_faves_wrapper"></div>').prependTo('body')
    $('<div class="ext_faves"><h5>Kedvencek</h5></div>').appendTo('#ext_nav_faves_wrapper')
    $('<div class="ext_nav_fave_list"></div>').appendTo('#ext_nav_faves_wrapper')

    // Create faves button event
    ext_nav_faves.click(function () {
      if ($('#ext_nav_faves_wrapper').css('display') === 'none') {
        showNavigationButtons.showFaves()
      } else {
        showNavigationButtons.removeOverlay()
      }
    })
  }

  //Night mode
  if (dataStore['showNavigationButtonsNight'] === true) {

    lights.init()

    ext_nightmode = $('#ext_nightmode')
  }

  // Set the button positions

  // Gather visible buttons
  let buttons = []

  if (ext_scrolltop.length) {
    buttons.push('ext_scrolltop')
  }

  if (ext_back.length) {
    buttons.push('ext_back')
  }

  if (ext_search.length) {
    buttons.push('ext_search')
  }

  if (ext_whitelist.length) {
    buttons.push('ext_whitelist')
  }

  if (ext_nightmode.length) {
    buttons.push('ext_nightmode')
  }

  if (ext_nav_faves.length) {
    buttons.push('ext_nav_faves')
  }

  // Reverse the array order for bottom positioning
  if (dataStore['navigationButtonsPosition'].match('bottom')) {
    buttons = buttons.reverse()
  }

  // Calculate buttons height
  let height = buttons.length * 36

  // Calculate the top position
  let top = ($(window).height() / 2) - (height / 2)

  // Iterate over the buttons
  for (let c = 0; c < buttons.length; c++) {

    if (dataStore['navigationButtonsPosition'] === 'lefttop') {

      $('#' + buttons[c]).css({ left: 10, right: 'auto', top: 30 + (36 * c), bottom: 'auto' })
    }

    if (dataStore['navigationButtonsPosition'] === 'leftcenter') {

      $('#' + buttons[c]).css({ left: 10, right: 'auto', top: top + (36 * c), bottom: 'auto' })
    }

    if (dataStore['navigationButtonsPosition'] === 'leftbottom') {

      $('#' + buttons[c]).css({ left: 10, right: 'auto', bottom: 30 + (36 * c), top: 'auto' })
    }

    if (dataStore['navigationButtonsPosition'] === 'righttop') {

      $('#' + buttons[c]).css({ right: 10, left: 'auto', top: 50 + (36 * c), bottom: 'auto' })
    }

    if (dataStore['navigationButtonsPosition'] === 'rightcenter') {

      $('#' + buttons[c]).css({ right: 10, left: 'auto', top: top + (36 * c), bottom: 'auto' })
    }

    if (dataStore['navigationButtonsPosition'] === 'rightbottom') {

      $('#' + buttons[c]).css({ right: 10, left: 'auto', bottom: 30 + (36 * c), top: 'auto' })
    }
  }
}

showNavigationButtons.disable = () => {

  $('#ext_scrolltop').remove()
  $('#ext_back').remove()
  $('#ext_search').remove()
  $('#ext_whitelist').remove()
  $('#ext_nav_faves').remove()
  $('#ext_nightmode').remove()
}

showNavigationButtons.showSearch = () => {

  let ext_search = $('#ext_search')
  let ext_overlay_search_arrow = $('#ext_overlay_search_arrow')

  // Hide opened overlays
  showNavigationButtons.removeOverlay()

  // Clone and append the original search form to body
  let clone = $('form#search-top').clone().appendTo('body')

  // Add class
  clone.attr('id', 'ext_overlay_search')

  let ext_overlay_search = $('#ext_overlay_search')

  // Set position
  showNavigationButtons.findArrowPosition(ext_overlay_search_arrow, ext_search)
  showNavigationButtons.findPosition(ext_overlay_search, ext_search)

  // Show the elements
  ext_overlay_search_arrow.show()
  ext_overlay_search.show()

  // Create the hiding overlay
  showNavigationButtons.createOverlay()
}

showNavigationButtons.showFaves = () => {

  let url = 'https://sg.hu/forum/'
  let ext_nav_faves_wrapper = $('#ext_nav_faves_wrapper')
  let ext_nav_faves = $('#ext_nav_faves')
  let ext_nav_faves_arrow = $('#ext_nav_faves_arrow')

  $.ajax({
    url: url,
    mimeType: 'text/html;charset=utf-8',
    dataType: 'html',
    success: function (tmp) {

      let data = $('nav#favorites-list', tmp)

      // Security reasons
      data = safeResponse.cleanDomHtml(data[0])

      // Write data into wrapper
      $('#ext_nav_faves_wrapper').find('.ext_nav_fave_list').html(data)

      if (dataStore['jumpUnreadMessages'] === 'true') {
        jumpUnreadMessages.activate()
      }

      // Hide topics that doesnt have unreaded messages
      favShowOnlyUnread.activate()

      // Faves: short comment marker
      if (dataStore['shortCommentMarker'] === 'true') {
        shortCommentMarker.activate()
      }

      // Set position
      showNavigationButtons.findArrowPosition(ext_nav_faves_arrow, ext_nav_faves)
      showNavigationButtons.findPosition(ext_nav_faves_wrapper, ext_nav_faves)

      // Hide opened overlays
      showNavigationButtons.removeOverlay()

      // Show the container
      ext_nav_faves_wrapper.show()
      ext_nav_faves_arrow.show()

      // Create the hiding overlay
      showNavigationButtons.createOverlay()
    }
  })
}

showNavigationButtons.findArrowPosition = (ele, target) => {

  let vPos
  // Top
  if (dataStore['navigationButtonsPosition'].match('bottom')) {
    vPos = parseInt($(target).css('bottom').replace('px', '')) + $(target).height() / 2 - $(ele).outerHeight() / 2
  } else {
    vPos = parseInt($(target).css('top').replace('px', '')) + $(target).height() / 2 - $(ele).outerHeight() / 2
  }

  // Left
  if (dataStore['navigationButtonsPosition'].match('left')) {

    if (dataStore['navigationButtonsPosition'].match('bottom')) {
      $(ele).css({
        'border-color': 'transparent #c0c0c0 transparent transparent',
        top: 'auto',
        bottom: vPos,
        left: 30,
        right: 'auto'
      })
    } else {
      $(ele).css({
        'border-color': 'transparent #c0c0c0 transparent transparent',
        top: vPos,
        bottom: 'auto',
        left: 30,
        right: 'auto'
      })
    }
    // Right
  } else {
    if (dataStore['navigationButtonsPosition'].match('bottom')) {
      $(ele).css({
        'border-color': 'transparent transparent transparent #c0c0c0',
        top: 'auto',
        bottom: vPos,
        left: 'auto',
        right: 30
      })
    } else {
      $(ele).css({
        'border-color': 'transparent transparent transparent #c0c0c0',
        top: vPos,
        bottom: 'auto',
        left: 'auto',
        right: 30
      })
    }
  }
}

showNavigationButtons.findPosition = (ele, target) => {

  let top, bottom
  if (dataStore['navigationButtonsPosition'] === 'lefttop') {

    top = parseInt($(target).css('top').replace('px', '')) - 15

    $(ele).css({ left: 50, right: 'auto', top: top, bottom: 'auto' })
  }

  if (dataStore['navigationButtonsPosition'] === 'leftcenter') {

    top = parseInt($(target).css('top').replace('px', '')) + $(target).height() / 2 - $(ele).outerHeight() / 2

    $(ele).css({ left: 50, right: 'auto', top: top, bottom: 'auto' })
  }

  if (dataStore['navigationButtonsPosition'] === 'leftbottom') {

    bottom = parseInt($(target).css('bottom').replace('px', '')) - 15

    $(ele).css({ left: 50, right: 'auto', top: 'auto', bottom: bottom })
  }

  if (dataStore['navigationButtonsPosition'] === 'righttop') {

    top = parseInt($(target).css('top').replace('px', '')) - 15

    $(ele).css({ left: 'auto', right: 50, top: top, bottom: 'auto' })
  }

  if (dataStore['navigationButtonsPosition'] === 'rightcenter') {

    top = parseInt($(target).css('top').replace('px', '')) + $(target).height() / 2 - $(ele).outerHeight() / 2

    $(ele).css({ left: 'auto', right: 50, top: top, bottom: 'auto' })
  }

  if (dataStore['navigationButtonsPosition'] === 'rightbottom') {

    bottom = parseInt($(target).css('bottom').replace('px', '')) - 15

    $(ele).css({ left: 'auto', right: 50, top: 'auto', bottom: bottom })
  }
}

showNavigationButtons.createOverlay = () => {

  $('<div id="ext_nav_overlay"></div>').prependTo('body').css({
    position: 'fixed',
    height: '100%',
    width: '100%',
    zIndex: 80
  })
  $('#ext_nav_overlay').click(function () {
    showNavigationButtons.removeOverlay()
  })
}

showNavigationButtons.removeOverlay = () => {

  // Hide buttons overlays
  $('#ext_nav_faves_wrapper').hide()
  $('#ext_nav_faves_arrow').hide()

  $('#ext_overlay_search').remove()
  $('#ext_overlay_search_arrow').hide()

  // Remove the overlay
  $('#ext_nav_overlay').remove()
}