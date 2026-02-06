import { Module } from '../Module'
import { context } from '../context'
import { getCookie, setCookie, removeCookie } from '@/utils/cookies'
import { getAnswers, getMessage } from '@/utils/api'
import { formatDateTime } from '@/utils/time'

export const messageCenter = new Module('messageCenter')

messageCenter.activate = () => {
  if (document.location.href.match(/forum\/$/)) {
    messageCenter.init()
  } else if (document.location.href.match(/forum\/tema/)) {
    const id = $('input[name="fid"]').val()
    const whitelist = browser.storage.sync.get('topicWhitelist')
    whitelist.then((list: any) => {
      const topicList = list['topicWhitelist'].split(',')

      if (topicList.indexOf(id) > -1) {
        messageCenter.topic()
      }
    })
  } else if (document.location.href.match(/cikkek/)) {
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

  const topics = $('.forums-block')

  // Add topik lists to the first page
  $('#ext_mc_page').find('.ext_mc_pages:eq(0)').append(topics)

  // Show the last used tab
  messageCenter.tab(context.dataStore['mcSelectedTab'])

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

  // Build answers tab after a delay to ensure messages are loaded
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

messageCenter.tab = (n: number) => {
  const mc_pages = $('.ext_mc_pages')

  // Hide all pages
  mc_pages.hide()

  // Show selected page
  mc_pages.eq(n).show()

  // Maintain styles, remove active style
  $('.ext_mc_tabs').removeClass('active')
  $('.ext_mc_tabs:eq(' + n + ')').addClass('active')

  // Store last selected tag for initial status
  if (context.port) {
    context.port.postMessage({ name: 'setMCSelectedTab', message: n })
  }
}

messageCenter.jump = () => {
  // Check for message ID in the url
  // Do nothing if not find any comment id
  if (!document.location.href.match(/#komment/)) {
    return false
  }

  // Fetch comment ID
  const url = document.location.href.split('#komment=')
  const id = url[1]

  // Reset hash
  window.location.hash = ''

  // Find the comment in DOM
  const target = $('#forum-posts-list').find('ul li header a:contains("#' + id + '")').closest('header')

  // Target offsets
  const windowHalf = $(window).height() as number / 2
  const targetHalf = $(target).outerHeight() as number / 2
  const targetTop = $(target).offset()?.top || 0
  const targetOffset = targetTop - (windowHalf - targetHalf)

  // Scroll to target element
  $('body').delay(1000).animate({ scrollTop: targetOffset }, 500, function () {
    $(target).css({ border: '2px solid red', margin: '10px 0px', 'padding-bottom': 10 })
  })
}

messageCenter.log = () => {
  let messages: any, id: any, message: any

  // Check the latest comment for getting the comment ID
  if (getCookie('updateComment')) {
    // Get messages for MC
    messages = JSON.parse(context.dataStore['mcMessages'] as string)

    // Get the comment ID
    id = getCookie('updateComment')

    // Get message contents
    message = $('#forum-posts-list').find('.post header a:contains("#' + id + '")').closest('header').find('section.body').html()

    // Filter out html-s
    $.each([
      [/<div align="RIGHT">([\s\S]*?)<\/div>/gim, '']
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
    // context.port.postMessage({name: 'setMCMessages', message: JSON.stringify(messages)})

    // Store in dataStore let
    context.dataStore['mcMessages'] = JSON.stringify(messages)

    // Remove marker for getting an ID
    removeCookie('updateComment')
  }

  // Check for update marker
  if (getCookie('getCommentID') === '1') {
    // Remove marker for getting an ID
    // Get messages for MC
    messages = context.dataStore['mcMessages']

    if (!messages) messages = []

    // Get the comment ID
    id = $('header a:contains("#")').html().match(/\d+/g)

    // Get message contents
    message = $('header').next().find('.body').html()

    // Filter out html-s
    $.each([
      [/<div align="RIGHT">([\s\S]*?)<\/div>/gim, '']
    ], function (index, item) {
      message = message.replace(item[0], item[1])
    })

    // Store the ID for the latest message
    messages[0]['comment_id'] = id[0]

    // Update message content
    messages[0]['message'] = message

    // Store new messages object in storage
    if (context.port) {
      context.port.postMessage({ name: 'setMCMessages', message: messages })
    }

    // Store in dataStore let
    context.dataStore['mcMessages'] = messages

    // // Remove marker for getting an ID
    removeCookie('getCommentID')
  }

  // Catch comment event
  if (!document.location.href.match(/szerkcode/)) {
    $('#post-submit').on('click', function (e) {
      e.preventDefault()

      let topic_name: any, topic_id: any

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
      const time = Math.round(new Date().getTime())

      // Get message
      const message = $('textarea[name="message"]').val()

      // Build the message object
      const tmp = {
        topic_name: topic_name,
        topic_id: topic_id,
        time: time,
        message: message,
        checked: time,
        answers: []
      }

      const messages = browser.storage.sync.get('mcMessages')
      messages.then((temp: any) => {
        const mcMessages = temp['mcMessages']
        let messagesList: any

        // If there is no previous messages
        if (!mcMessages) {
          messagesList = []
          messagesList.push(tmp)

          // There is other messages
        } else {
          // Get the previous messages from localStorage
          messagesList = JSON.parse(mcMessages)

          // Unshift the new message
          messagesList.unshift(tmp)

          // Check for max entries
          if (messagesList.length > 10) {
            messagesList.splice(9)
          }
        }

        // Store in storage
        if (context.port) {
          context.port.postMessage({ name: 'setMCMessages', message: messagesList })
        }

        // Set a marker for getting the comment ID
        setCookie('getCommentID', '1', 1)
      })
    })

    $('form[name="newmessage"]').trigger('submit')
  } else {
    $('form[name="newmessage"]').submit(function () {
      // Note: Edit mode comment ID extraction not yet implemented

      // Set marker to be update this comment
      //setCookie('updateComment', comment_id, 1)
    })
  }
}

messageCenter.search = () => {
  // Check if there is any previous posts
  if (!context.dataStore['mcMessages']) {
    return false
  }

  // Get the latest post
  const messages = context.dataStore['mcMessages'] as any

  // Iterate over the posts
  for (let key = 0; key < messages.length; key++) {
    // Get current timestamp
    const time = new Date().getTime()

    // Check last searched state - skip if checked less than 60 seconds ago
    if (time < messages[key].checked + 60 * 1000) {
      continue
    }

    // Make the requests
    messageCenter.doAjax(messages, key)
  }
}

messageCenter.doAjax = (messages: any, key: number) => {
  const message = messages[key]
  let time: any

  getAnswers(message.topic_id, message.comment_id).then((answers: any) => {
    if (answers.length === 0) return false

    const answersArray: any[] = []

    for (const answer of answers) {
      getMessage(message.topic_id, answer.msg_unique).then((comment: any) => {
        const AD = {
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
    context.dataStore['mcMessages'] = messages

    // Store in storage
    if (context.port) {
      context.port.postMessage({ name: 'setMCMessages', message: messages })
    }
  }).catch(() => {
    // Store in localStorage
    //context.port.postMessage({name: 'setMCMessages', message: messages})

    return false
  })

  return true
}

messageCenter.buildOwnCommentsTab = () => {
  // Get the previous messages form storage
  const mcMessages = browser.storage.sync.get('mcMessages')
  mcMessages.then((messages: any) => {
    // Check if there is any previous posts
    if (!messages['mcMessages']) {
      return false
    }

    const messagesList = messages['mcMessages']

    if (messagesList.length > 0) {
      $('.ext_mc_pages:eq(1)').html('')
    }

    // Iterate over the messages
    for (let c = 0; c < messagesList.length; c++) {
      // Get the post date and time
      // let time = date('Y. m. d. -  H:i', messagesList[c]['time'])
      const time = messagesList[c]['time']

      // Get the today's date
      // let today = new Date()

      // Get yesterdays date
      const yesterday = new Date()
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
      let msg = messagesList[c]['message']

      // Filter out BB tags and add line breaks
      $.each([
        [/[\r|\n]/g, '<br>'],
        [/\[.*?]([\s\S]*?)\[\/.*?]/g, '$1']

      ], function (index, item) {
        msg = msg.replace(item[0], item[1])
      })

      let html = ''

      html += '<div class="ext_mc_messages">'
      html += '<p><a href="https://sg.hu/forum/tema/' + messagesList[c]['topic_id'] + '">' + messagesList[c]['topic_name'] + '</a></p>'
      html += '<span>' + new Date(time) + '</span>'
      html += '<div>' + msg + '</div>'
      html += '</div>'

      $(html).appendTo('.ext_mc_pages:eq(1)')
    }
  })
}

messageCenter.buildAnswersTab = () => {
  // Check if there is any previous posts
  if (!context.dataStore['mcMessages']) {
    return false
  }

  // Get the previous messages form LocalStorage
  const temp = context.dataStore['mcMessages']

  const messages = $.extend(true, [], temp)

  // Empty the container first for re-init
  $('.ext_mc_pages:eq(2) div.contents').html('')

  // Iterate over the messages message, c
  messages.forEach(function (message: any) {
    // Html to insert
    let html = ''

    // Continue when no answers
    if (message['answers'].length === 0) {
      return false
    }

    // Get the post date and time
    // let time = date('Y. m. d. -  H:i', message['time'])
    const time = message['time']

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
    html += '<span>' + formatDateTime(new Date(time)) + '</span>'
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
