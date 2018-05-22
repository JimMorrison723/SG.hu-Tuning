import { Module } from '../module'
import { dataStore } from '../../contentscript'

export const overlayReplyTo = new Module('overlayReplyTo')

overlayReplyTo.opened = false

overlayReplyTo.activate = () => {

  // Change tabindexes for suit the overlay textarea
  let ta = $('textarea:first')
  ta.attr('tabindex', '3')
  ta.closest('div').find('a:last').attr('tabindex', '4')

  // Change the behavior the replyto button
  $('.post header a:contains("válasz")').on('click', function (e) {

    // Prevent default submission
    e.preventDefault()

    // Get ref msg ID and comment element
    let msgno = $(this).closest('header').find('a.post-no').text().match(/\d+/g)
    let entry = $(this).closest('.post')

    // Call show method
    overlayReplyTo.show(entry, msgno)
  })
}

overlayReplyTo.disable = () => {

  $('li[id*=post] header a:contains("válasz")').off('click')
}

overlayReplyTo.show = (comment, msgno) => {

  // Return when the user is not logged in
  if (!dataStore['user']['isLoggedIn']) {
    alert('Nem vagy bejelentkezve!')
    return
  }

  // Prevent multiple instances
  if (overlayReplyTo.opened) {
    return false

    // Set opened status
  } else {
    overlayReplyTo.opened = true
  }

  let textarea_clone
  let body = $('body')

  // Create the hidden layer
  $('<div class="ext_hidden_layer"></div>').prependTo('body').hide().fadeTo(300, 0.9)

  // Highlight the reply comment
  let comment_clone = $(comment).clone().prependTo('#forum-posts-list ul').addClass('ext_highlighted_comment')

  // Maintain comment clone positions
  comment_clone.css({ 'top': comment.position().top })

  // Remove threaded view padding and border
  comment_clone.css({ margin: 0, padding: 0, border: 0 })

  // Remove 'msg for me' indicator
  comment_clone.find('.ext_comments_for_me_indicator').remove()

  // Remove sub-center tags
  comment_clone.find('ul.post-answer').remove()

  // Remove quoted subcomments
  comment_clone.find('ul.post-answer').remove()

  if (document.location.href.match(/cikkek/)) {
    comment_clone.css('width', 700)
  }

  // Create textarea clone

  // WYSIWYG editor
  if (dataStore['wysiwygEditor'] === 'true') {

    if (document.location.href.match(/cikkek/)) {

      textarea_clone = $('<div class="ext_clone_textarea"></div>').prependTo('body')
      $('form[name="newmessage"]').clone(true, true).prependTo('.ext_clone_textarea:first')

      // Add 'article' class to the clone
      textarea_clone.addClass('article')

      // Remove username line
      textarea_clone.find('b').remove()

      // Maintain style settings
      textarea_clone.find('div:first').removeAttr('id')

      // Remove div padding
      textarea_clone.find('form div div').css('padding', 0)

    } else {
      textarea_clone = $('form[name="newmessage"]').find('div.cleditorMain').clone(true, true).prependTo('body').addClass('ext_clone_textarea')

      // Add 'article' class to the clone
      textarea_clone.addClass('topic')

      // Remove div padding
      textarea_clone.find('form div:eq(0)').css('padding', 0)
    }

    textarea_clone.find('.cleditorMain').remove()
    textarea_clone.find('form div:eq(0)').append('<textarea cols="50" rows="10" name="message"></textarea>')

    // Copy textarea original comment to the tmp element
    textarea_clone.find('textarea').val($('form[name=newmessage]:gt(0) textarea').val())

    // Apply some styles
    textarea_clone.css({ 'background': 'none', 'border': 'none' })

    // Fix buttons
    textarea_clone.find('a:eq(0)').css({ position: 'absolute', top: 220, left: 0 })
    textarea_clone.find('a:eq(1)').css({ position: 'absolute', top: 220, left: 90, visibility: 'visible' })
    textarea_clone.find('a:eq(2)').css({ display: 'none' })
    textarea_clone.find('a:eq(3)').css({ display: 'none' })
    textarea_clone.find('a:eq(4)').css({ position: 'absolute', top: 220, left: 180 })
    textarea_clone.find('a:eq(5)').css({ position: 'absolute', top: 220, left: 270, right: 'auto' })

    textarea_clone.find('a:eq(6)').css({ position: 'absolute', top: 220, right: 0 })

    // Fix smile list
    if (document.location.href.match(/cikkek/)) {
      textarea_clone.find('#ext_smiles').css({ 'padding-left': 50, 'padding-right': 50, 'margin-top': 20 })
    } else {
      textarea_clone.find('#ext_smiles').css({ 'padding-left': 100, 'padding-right': 100, 'margin-top': 15 })
    }
    textarea_clone.find('.ext_smiles_block h3').css('color', 'black')

    // CLEditor init
    if (document.location.href.match(/cikkek/)) {
      $('.ext_clone_textarea textarea').cleditor({ width: 696, height: 200 })[0].focus()
      textarea_clone.find('.cleditorMain').css({ position: 'relative', top: -10 })
    } else {
      $('.ext_clone_textarea textarea').cleditor({ width: 800 })[0].focus()
    }

    // Normal textarea
  } else {

    if (document.location.href.match(/cikkek/)) {

      textarea_clone = $('<div class="ext_clone_textarea"></div>').prependTo('body')
      $('form[name="newmessage"]').clone(true, true).prependTo('.ext_clone_textarea:first')

      // Add 'article' class to the clone
      textarea_clone.addClass('article')

      // Remove username line
      textarea_clone.find('b').remove()

      // Maintain style settings
      textarea_clone.find('div:first').removeAttr('id')

      // Create a container element around the textarea for box-shadow
      $('<div id="ext_clone_textarea_shadow"></div>').insertAfter(textarea_clone.find('textarea'))

      // Put textarea the container
      textarea_clone.find('textarea').appendTo('#ext_clone_textarea_shadow')

    } else {

      textarea_clone = $('form[name="newmessage"] textarea').closest('form').clone(true, true).prependTo('body').addClass('ext_clone_textarea')

      // Add 'topic' class to the clone
      textarea_clone.addClass('topic')

      // Remove username line
      textarea_clone.find('#comments-login').remove()

      // Create a container element around the textarea for box-shadow
      $('<div id="ext_clone_textarea_shadow"></div>').insertAfter(textarea_clone.find('textarea'))

      // Put textarea the container
      textarea_clone.find('textarea').appendTo('#ext_clone_textarea_shadow')
    }

    // Copy textarea original comment to the tmp element
    textarea_clone.find('textarea').val($('form[name=newmessage]:gt(0) textarea').val())

    // Fix buttons
    textarea_clone.find('button:eq(1)').css({ position: 'absolute', left: 0 })   // -85
    textarea_clone.find('button:eq(2)').css({ position: 'absolute', left: 90 })  // -175
    textarea_clone.find('button:eq(3)').css({ position: 'absolute', left: 180 }) // -265
    textarea_clone.find('button:eq(4)').css({ position: 'absolute', left: 270 }) // -375
    textarea_clone.find('button:eq(5)').css({ position: 'absolute', left: 380 }) // -486
    textarea_clone.find('button:eq(6)').css({ position: 'absolute', left: 491 }) // -608
    textarea_clone.find('button:eq(7)').css({ position: 'absolute', left: 613 }) // -711,52

    /*textarea_clone.find('a:eq(6)').css({ position : 'absolute', right : 0 });*/
  }

  // Textarea position
  let top = $(comment_clone).offset().top + $(comment_clone).height()
  let left
  if (document.location.href.match(/cikkek/)) {
    left = $(document).width() / 2 - 350
  } else {
    left = $(document).width() / 2 - 475
  }

  textarea_clone.delay(350).css({ top: top + 200, left: left, opacity: 0 }).animate({
    top: top + 10,
    opacity: 1,
  }, 300)

  // Change textarea name attr to avoid conflicts
  $('form[name=newmessage]:gt(0)').attr('name', 'tmp')

  // Set msg no input
  textarea_clone.find('input[name=no_ref]').attr('value', msgno)

  // Autoscroll
  $('html, body').animate({
    scrollTop: comment.offset().top - $(window).height() / 3
  }, 500)

  // Set the right tabindex
  textarea_clone.find('textarea').attr('tabindex', '1')
  textarea_clone.find('a:last').attr('tabindex', '2')

  // Set the textarea focus
  textarea_clone.find('textarea').focus()

  // Set the iframe focus
  if (dataStore['wysiwygEditor'] === 'true') {
    textarea_clone.find('iframe')[0].focus()
  }

  // Block default tab action in non-WYSIWYG editor
  body.keydown(function (event) {
    if (event.keyCode === 9) {
      event.preventDefault()
      textarea_clone.find('a:last').focus()
    }
  });

  // Block default tab action in a WYSIWYG editor
  if (dataStore['wysiwygEditor'] === 'true') {
    $(textarea_clone.find('iframe')[0].contentDocument.body).keydown(function (event) {
      if (event.keyCode === '9') {
        event.preventDefault()
        textarea_clone.find('a:last').focus()
      }
    })
  }

  // Thickbox
  textarea_clone.find('a.thickbox').each(function () {

    // Get the title and other stuff
    let t = $(this).attr('title') || $(this).attr('name') || null
    let g = $(this).attr('rel') || false
    let h = $(this).attr('href')

    $(this).attr('href', 'javascript:TB_show(\'' + t + '\',\'' + h + '\',' + g + ');')

    $(this).blur()
  })

  // Add close button
  let close_btm = $('<img src="' + chrome.extension.getURL('images/content/overlay_close.png') + '" id="ext_close_overlay">').prependTo(textarea_clone).addClass('ext_overlay_close')

  // Change close button position if WYSIWYG editor is disabled
  if (dataStore['wysiwygEditor'] !== true) {
    close_btm.css({ 'right': 4, 'top': 9 })
  }

  // Add Close event
  $(close_btm).click(function () {
    $(textarea_clone).fadeTo(100, 0, function () {
      $(this).remove()
      $(comment_clone).fadeTo(100, 0, function () {
        $(this).remove()
        $('.ext_hidden_layer').fadeTo(300, 0, function () {
          $(this).remove()
          $('form[name=tmp]:first').attr('name', 'newmessage')

          // Set back opened status
          overlayReplyTo.opened = false

          // Remove keydown event
          body.unbind('keydown')
        })
      })
    })
  })
}