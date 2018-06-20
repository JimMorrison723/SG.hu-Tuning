import { Module } from '../module'
import { port, dataStore } from '../../contentscript'
import { getCookie, setCookie, removeCookie } from '../../util/cookies'
import { getAnswers, getMessage } from '../../util/api'

const getColonTimeFromDate = date => date.toLocaleString()

export const messageCenter = new Module('messageCenter')

messageCenter.activate = () => {

  if (document.location.href.match(/forum\/$/)) {
    messageCenter.init()
  }
  else if (document.location.href.match(/forum\/tema/)) {

    let id = $('input[name="fid"]').val()
    let whitelist = browser.storage.sync.get('topicWhitelist')
    whitelist.then((list) => {

      list = list['topicWhitelist'].split(',')

      if (list.indexOf(id) > -1) {
        messageCenter.topic()
      }
    })
  }
  else if (document.location.href.match(/cikkek/)) {
    messageCenter.article()
  }

}

messageCenter.init = () => {

  // HTML code to insert
  let html = ''

  html += '<ul id="ext_mc_tabs">'
  html += '<li class="ext_mc_tabs">Fórumkategóriák</li>'
  html += '<li class="ext_mc_tabs">Saját üzeneteim</li>'
  html += '<li class="ext_mc_tabs">Válaszok</li>'
  html += '</ul>'
  html += '<div id="ext_mc_page">'
  html += '<div class="ext_mc_pages"></div>'
  html += '<div class="ext_mc_pages"><h3>Még nem érkezett válasz egyetlen kommentedre sem.</h3><div class="contents"></div></div>'
  html += '<div class="ext_mc_pages"><h3>Még nincs egy elmentett üzenet sem.</h3></div>'
  html += '</div>'

  // Insert tabs
  $('#forum-chat').after(html)

  let topics = $('.forums-block')

  // Add topik lists to the first page
  $('#ext_mc_page').find('.ext_mc_pages:eq(0)').append(topics)

  // Show the last used tab
  messageCenter.tab(dataStore['mcSelectedTab'])

  // Set tab selection events
  $('.ext_mc_tabs').click(function () {
    messageCenter.tab($(this).index())
  })

  // buildOwnCommentsTab
  messageCenter.buildOwnCommentsTab()

  // Set auto list building in 6 minutes
  setInterval(function () {
    messageCenter.buildOwnCommentsTab()
  }, 360000)

  // buildAnswersTab
  // TODO: This is a hack, little problem handling async functions
  setTimeout(function () {
    messageCenter.buildAnswersTab()
  }, 1000)

  // Set auto list building in 6 minutes 360000
  setInterval(function () {
    messageCenter.buildAnswersTab()
  }, 6000)

  // Start searching ..
  messageCenter.search()

  // Set auto-search in 5 minutes 300000
  setInterval(function () {
    messageCenter.search()
  }, 5000)

}

messageCenter.topic = () => {

  // Set-up post logger
  messageCenter.log()

  // Start searching ..
  // messageCenter.search()
  //
  // // Set auto-search in 5 minutes
  // setInterval(function () {
  //   messageCenter.search()
  // }, 300000)

  messageCenter.jump()
}

messageCenter.article = () => {

  // Set-up post logger
  messageCenter.log()

  // // Start searching ..
  // messageCenter.search()
  //
  // // Set auto-search in 5 minutes
  // setInterval(function () {
  //   messageCenter.search()
  // }, 300000)

  messageCenter.jump()
}

messageCenter.tab = (n) => {

  let mc_pages = $('.ext_mc_pages')

  // Hide all pages
  mc_pages.hide()

  // Show selected page
  mc_pages.eq(n).show()

  // Maintain styles, remove active style 
  $('.ext_mc_tabs').removeClass('active')
  $('.ext_mc_tabs:eq(' + n + ')').addClass('active')

  // Store last selected tag for initial status
  port.postMessage({name: 'setMCSelectedTab', message: n})
}

messageCenter.jump = () => {

  // Check for message ID in the url
  // Do nothing if not find any comment id
  if (!document.location.href.match(/#komment/)) {
    return false
  }

  // Fetch comment ID
  let url = document.location.href.split('#komment=')
  let id = url[1]

  // Reset hash
  window.location.hash = ''

  // Find the comment in DOM
  let target = $('#forum-posts-list').find('ul li header a:contains("#' + id + '")').closest('header')

  // Target offsets
  let windowHalf = $(window).height() / 2
  let targetHalf = $(target).outerHeight() / 2
  let targetTop = $(target).offset().top
  let targetOffset = targetTop - (windowHalf - targetHalf)

  // Scroll to target element
  $('body').delay(1000).animate({scrollTop: targetOffset}, 500, function () {
    $(target).css({border: '2px solid red', margin: '10px 0px', 'padding-bottom': 10})
  })
}

messageCenter.log = () => {

  let messages, id, message
  // Check the latest comment for getting the comment ID
  if (getCookie('updateComment')) {

    // Get messages for MC
    messages = JSON.parse(dataStore['mcMessages'])

    // Get the comment ID
    id = getCookie('updateComment')

    // Get message contents
    message = $('#forum-posts-list').find('.post header a:contains("#' + id + '")').closest('header').find('section.body').html()

    // Filter out html-s
    $.each([
      [/<div align="RIGHT">([\s\S]*?)<\/div>/img, '']
    ], function (index, item) {
      message = message.replace(item[0], item[1])
    })

    for (let c = 0; c < messages.length; c++) {
      if (messages[c]['comment_id'] === id) {

        // Update message content
        messages[c]['message'] = message
      }
    }

    // Store new messages object in LocalStorage
    // port.postMessage({name: 'setMCMessages', message: JSON.stringify(messages)})

    // Store in dataStore let 
    dataStore['mcMessages'] = JSON.stringify(messages)

    // Remove marker for getting an ID
    removeCookie('updateComment')
  }

  // Check for update marker
  if (getCookie('getCommentID') === '1') {

    // Remove marker for getting an ID
    // Get messages for MC
    messages = dataStore['mcMessages']

    if (!messages)
      messages = []

    // Get the comment ID
    id = $('header a:contains("#")').html().match(/\d+/g)

    // Get message contents
    message = $('header').next().find('.body').html()

    // Filter out html-s
    $.each([
      [/<div align="RIGHT">([\s\S]*?)<\/div>/img, '']
    ], function (index, item) {
      message = message.replace(item[0], item[1])
    })

    // Store the ID for the latest message
    messages[0]['comment_id'] = id[0]

    // Update message content
    messages[0]['message'] = message

    // Store new messages object in storage
    port.postMessage({name: 'setMCMessages', message: messages})

    // Store in dataStore let 
    dataStore['mcMessages'] = messages

    // // Remove marker for getting an ID
    removeCookie('getCommentID')
  }

  // Catch comment event
  if (!document.location.href.match(/szerkcode/)) {

    $('#post-submit').on('click', function (e) {
      e.preventDefault()

      let topic_name, topic_id

      // Article
      if (document.location.href.match(/cikkek/)) {

        // Get topic name
        topic_name = $('h3.headers-big').text()

        // Get topic ID
        topic_id = $('#forum-posts').data('topic-id')

        // Topic
      } else {

        // Get topic name
        topic_name = $('select#topicslist option:selected').text()
        topic_name = topic_name.trim()

        // Get topic ID
        topic_id = $('#topicdata').data('tid')
      }

      // Get comment time
      let time = Math.round(new Date().getTime())

      // Get message
      let message = $('textarea[name="message"]').val()

      // Build the message object
      let tmp = {

        topic_name: topic_name,
        topic_id: topic_id,
        time: time,
        message: message,
        checked: time,
        answers: []
      }

      let messages = browser.storage.sync.get('mcMessages')
      messages.then((temp) => {

        let mcMessages = temp['mcMessages']

        // If there is no previous messages
        if (!mcMessages) {
          messages = []
          messages.push(tmp)

          // There is other messages
        } else {

          // Get the previous messages from localStorage
          messages = JSON.parse(mcMessages)

          // Unshift the new message
          messages.unshift(tmp)

          // Check for max entries
          if (messages.length > 10) {
            messages.splice(9)
          }
        }

        // Store in storage
        port.postMessage({name: 'setMCMessages', message: messages})

        // Set a marker for getting the comment ID
        setCookie('getCommentID', '1', 1)
      })
    })

    $(this).submit()

  } else {

    $('form[name="newmessage"]').submit(function () {

      //TODO: get szerkesztés id from url
      // Get comment ID
      //let comment_id = parseInt($('.std1:first').find('b').html().match(/\d+/g))

      // Set marker to be update this comment
      //setCookie('updateComment', comment_id, 1)
    })

  }
}

messageCenter.search = () => {

  // Check if there is any previous posts
  if (!dataStore['mcMessages']) {
    return false
  }

  // Get the latest post
  let messages = dataStore['mcMessages']

  // Iterate over the posts
  for (let key = 0; key < messages.length; key++) {

    // Get current timestamp
    let time = new Date().getTime()

    //TODO: comment this section in dev
    // Check last searched state
    if (time < messages[key].checked + 60 * 1000) {
      continue
    }

    // Make the requests
    messageCenter.doAjax(messages, key)
  }
}

messageCenter.doAjax = (messages, key) => {

  let message = messages[key]
  let time

  getAnswers(message.topic_id, message.comment_id).then((answers) => {

    if (answers.length === 0)
      return false

    let answersArray = []

    for (let answer of answers) {

      getMessage(message.topic_id, answer.msg_unique).then((comment) => {

        let AD = {
          id: comment.msg_unique,
          author: comment._userInfo.nick,
          message: comment.text
        }
        answersArray.push(AD)
      })
    }

    // Get current time
    time = new Date().getTime()

    // Set new checked date
    messages[key]['checked'] = time

    messages[key]['answers'] = answersArray

    // Store in localStorage
    dataStore['mcMessages'] = messages

    // Store in storage
    port.postMessage({name: 'setMCMessages', message: messages})

  }).catch(() => {

    // Store in localStorage
    //port.postMessage({name: 'setMCMessages', message: messages})

    return false
  })

  return true
}

messageCenter.buildOwnCommentsTab = () => {

  // Get the previous messages form storage
  let mcMessages = browser.storage.sync.get('mcMessages')
  mcMessages.then((messages) => {

    // Check if there is any previous posts
    if (!messages['mcMessages']) {
      return false
    }

    messages = messages['mcMessages']

    if (messages.length > 0) {
      $('.ext_mc_pages:eq(1)').html('')
    }

    // Iterate over the messages
    for (let c = 0; c < messages.length; c++) {

      // Get the post date and time
      // let time = date('Y. m. d. -  H:i', messages[c]['time'])
      let time = messages[c]['time']

      // Get the today's date
      // let today = new Date()

      // Get yesterdays date
      let yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      // Convert today and yesterday strings
      // $.each([
      //   [today, 'ma'],
      //   [yesterday, 'tegnap']
      //
      // ], function (index, item) {
      //   time = time.replace(item[0], item[1])
      // })

      // Get the message
      let msg = messages[c]['message']

      // Filter out BB tags and add line breaks
      $.each([
        [/[\r|\n]/g, '<br>'],
        [/\[.*?]([\s\S]*?)\[\/.*?]/g, '$1']

      ], function (index, item) {
        msg = msg.replace(item[0], item[1])
      })

      let html = ''

      html += '<div class="ext_mc_messages">'
      html += '<p><a href="https://sg.hu/forum/tema/' + messages[c]['topic_id'] + '">' + messages[c]['topic_name'] + '</a></p>'
      html += '<span>' + new Date(time) + '</span>'
      html += '<div>' + msg + '</div>'
      html += '</div>'

      $(html).appendTo('.ext_mc_pages:eq(1)')
    }
  })

}

messageCenter.buildAnswersTab = () => {

  // Check if there is any previous posts
  if (!dataStore['mcMessages']) {
    return false
  }

  // Get the previous messages form LocalStorage
  let temp = dataStore['mcMessages']

  let messages = $.extend(true, [], temp)

  // Empty the container first for re-init
  $('.ext_mc_pages:eq(2) div.contents').html('')

  // Iterate over the messages message, c
  messages.forEach(function (message) {

    // Html to insert
    let html = ''

    // Continue when no answers
    if (message['answers'].length === 0) {
      return false
    }

    // Get the post date and time
    // let time = date('Y. m. d. -  H:i', message['time'])
    let time = message['time']

    // Get the today's date
    // let today = date('Y. m. d.', Math.round(new Date().getTime() / 1000))
    // let today = new Date()

    // Get yesterday's date
    // let yesterday = Math.round(new Date().getTime() / 1000) - 60 * 60 * 24
    // yesterday = date('Y. m. d.', yesterday)

    // Convert today and yesterday strings
    // $.each([
    //   [today, 'ma'],
    //   [yesterday, 'tegnap']
    //
    // ], function (index, item) {
    //   time = time.replace(item[0], item[1])
    // })

    // Get the message
    let msg = message['message']

    // Filter out BB tags and add line breaks
    $.each([
      [/[\r|\n]/g, '<br>'],
      [/\[.*?]([\s\S]*?)\[\/.*?]/g, '$1']

    ], function (index, item) {
      msg = msg.replace(item[0], item[1])
    })

    // Own comment
    html += '<div class="ext_mc_messages">'
    html += '<p><a href="https://sg.hu/forum/tema/' + message['topic_id'] + '">' + message['topic_name'] + '</a></p>'
    html += '<span>' + getColonTimeFromDate(time) + '</span>'
    html += '<div>' + msg + '</div>'
    html += '</div>'

    // Iterate over the answers
    for (let a = 0; a < message['answers'].length; a++) {

      html += '<div class="ext_mc_messages ident">'
      html += '<p>'
      html += '' + message['answers'][a]['author'] + ''
      html += ' - <a href="https://sg.hu/forum/tema/' + message['topic_id'] + '#komment=' + message['answers'][a]['id'] + '" class="ext_mc_jump_to">ugrás a hozzászólásra</a>'
      html += '</p>'
      html += '<div>' + message['answers'][a]['message'] + '</div>'
      html += '</div>'
    }

    if (html !== '') {
      $('.ext_mc_pages:eq(2)').find('h3').remove()
      // Insert html  div.contents
      $(html).appendTo('.ext_mc_pages:eq(2)')
    }
  })
}