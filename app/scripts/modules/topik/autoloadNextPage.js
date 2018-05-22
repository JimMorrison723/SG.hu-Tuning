import { Module } from '../module'
import { safeResponse } from './../../util/safeResponse'

export const autoloadNextPage = new Module('autoloadNextPage')

autoloadNextPage.progress = false
autoloadNextPage.currPage = null
autoloadNextPage.maxPage = null
autoloadNextPage.counter = null

autoloadNextPage.activate = () => {

  // Artcile
  if (document.location.href.match(/cikkek/)) {

    // Current page index
    autoloadNextPage.currPage = 1

    // Get topic ID
    let topic_id = $('section#forum-posts').data('topic-id')

    // Get the topic page to determinate max page number
    $.ajax({
      url: 'forum/tema/' + topic_id,
      dataType: 'html',
      success: function (data) {

        // Parse the response HTML
        let tmp = $(data)

        // Fetch the max page number
        autoloadNextPage.maxPage = parseInt($(tmp).find('nav.pagination a:last').prev().html())
        //TODO: this is NaN
      }
    })

    // Get max page number 
    autoloadNextPage.maxPage = parseInt($('nav.pagination a:last').prev().html())

    // Topic
  } else {

    // Current page index
    autoloadNextPage.currPage = parseInt($('nav.pagination a.current').html())

    // Get max page number - Fix for "Last page"
    let temp = ($('nav.pagination a.last').attr('href'))
    if (temp) {
      autoloadNextPage.maxPage = parseInt(temp.substring(temp.lastIndexOf('=') + 1))
    }
  }

  $(document).scroll(function () {
    let docHeight = $(document).height()
    let scrollPosition = $(window).height() + $(window).scrollTop()

    if ((docHeight - scrollPosition) / docHeight < 0.1
      && !autoloadNextPage.progress
      && autoloadNextPage.currPage < autoloadNextPage.maxPage) {
      autoloadNextPage.progress = true
      autoloadNextPage.load()
    }
  })
}

autoloadNextPage.disable = () => {

  $(document).unbind('scroll')
}

autoloadNextPage.load = () => {

  let url
  // Url to call
  // date ASC order
  if (document.location.href.match(/timeline/)) {
    url = document.location.href.substring(0, 44)
    url = url + '&order=timeline&index=' + (autoloadNextPage.currPage + 1) + ''

    // Date DESC order
  } else {

    if (document.location.href.match(/cikkek/)) {

      // Get topic ID
      let topic_id = $('section#forum-posts').data('topic-id')

      // Url to call	
      url = 'forum/tema/' + topic_id
      url = url + '?page=' + (autoloadNextPage.currPage + 1) + '&callerid=1'

    } else {
      url = document.location.href.substring(0, 35)
      url = url + '?page=' + (autoloadNextPage.currPage + 1) + ''
    }
  }

  // Make the ajax query
  $.get(url, function (data) {

    // Create the 'next page' indicator
    // if (dataStore['threaded_comments'] !== 'true') {
    if (document.location.href.match(/cikkek/)) {
      $('<div class="ext_autopager_idicator">' + (autoloadNextPage.currPage + 1) + '. oldal</div>').insertAfter('.std2:last')
    } else {
      $('<div class="ext_autopager_idicator">' + (autoloadNextPage.currPage + 1) + '. oldal</div>').insertAfter('div#forum-posts-list:last')
    }
    // }

    // Parse the response HTML
    let tmp = $(data)
    let d

    // Articles
    if (document.location.href.match(/cikkek/)) {

      tmp = tmp.find('div#forum-posts-list')
      tmp = safeResponse.cleanDomHtml(tmp[0])

      //TODO: fix meh workaround
      d = document.createElement('div')
      d.innerHTML = tmp
      $(d).insertAfter('.ext_autopager_idicator:last')

      // Topics
    } else {
      tmp = tmp.find('div#forum-posts-list')
      tmp = safeResponse.cleanDomHtml(tmp[0])

      //TODO: fix meh workaround
      d = document.createElement('div')
      d.innerHTML = tmp
      $(tmp).insertAfter('.ext_autopager_idicator:last')
    }

    autoloadNextPage.progress = false
    autoloadNextPage.currPage++
    autoloadNextPage.counter++

    // TODO: Reinit settings
  }, 'html')
}