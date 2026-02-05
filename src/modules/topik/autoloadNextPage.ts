import { Module } from '../Module'
import { safeResponse } from '@/utils/safeResponse'

export const autoloadNextPage = new Module('autoloadNextPage')

autoloadNextPage.progress = false
autoloadNextPage.currPage = null
autoloadNextPage.maxPage = null
autoloadNextPage.counter = null

autoloadNextPage.activate = async () => {

  // Article
  if (document.location.href.match(/cikkek/)) {

    // Current page index
    autoloadNextPage.currPage = 1

    // Get topic ID
    const topic_id = $('section#forum-posts').data('topic-id')

    // Get the topic page to determine max page number
    try {
      const response = await fetch('forum/tema/' + topic_id)
      const html = await response.text()

      // Parse the response HTML
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')

      // Fetch the max page number
      const paginationLinks = doc.querySelectorAll('nav.pagination a')
      if (paginationLinks.length >= 2) {
        const secondToLast = paginationLinks[paginationLinks.length - 2]
        const pageNum = parseInt(secondToLast.textContent || '1', 10)
        if (!isNaN(pageNum)) {
          autoloadNextPage.maxPage = pageNum
        }
      }
    } catch (error) {
      console.warn('Failed to fetch topic page:', error)
    }

    // Fallback: Get max page number from current page
    if (!autoloadNextPage.maxPage) {
      autoloadNextPage.maxPage = parseInt($('nav.pagination a:last').prev().html()) || 1
    }

    // Topic
  } else {

    // Current page index
    autoloadNextPage.currPage = parseInt($('nav.pagination a.current').html())

    // Get max page number - Fix for "Last page"
    const temp = ($('nav.pagination a.last').attr('href'))
    if (temp) {
      autoloadNextPage.maxPage = parseInt(temp.substring(temp.lastIndexOf('=') + 1))
    }
  }

  $(document).scroll(function () {
    const docHeight = $(document).height() as number
    const scrollPosition = ($(window).height() as number) + ($(window).scrollTop() as number)

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

autoloadNextPage.load = async () => {

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
      const topic_id = $('section#forum-posts').data('topic-id')

      // Url to call
      url = 'forum/tema/' + topic_id
      url = url + '?page=' + (autoloadNextPage.currPage + 1) + '&callerid=1'

    } else {
      url = document.location.href.substring(0, 35)
      url = url + '?page=' + (autoloadNextPage.currPage + 1) + ''
    }
  }

  try {
    const response = await fetch(url)
    const data = await response.text()

    // Create the 'next page' indicator
    if (document.location.href.match(/cikkek/)) {
      $('<div class="ext_autopager_idicator">' + (autoloadNextPage.currPage + 1) + '. oldal</div>').insertAfter('.std2:last')
    } else {
      $('<div class="ext_autopager_idicator">' + (autoloadNextPage.currPage + 1) + '. oldal</div>').insertAfter('div#forum-posts-list:last')
    }

    // Parse the response HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(data, 'text/html')
    const tmp = doc.querySelector('div#forum-posts-list')

    if (tmp) {
      const cleanedHtml = safeResponse.cleanDomHtml(tmp)

      // Create container and insert
      const container = document.createElement('div')
      container.innerHTML = cleanedHtml

      if (document.location.href.match(/cikkek/)) {
        $(container).insertAfter('.ext_autopager_idicator:last')
      } else {
        $(cleanedHtml).insertAfter('.ext_autopager_idicator:last')
      }
    }

    autoloadNextPage.progress = false
    autoloadNextPage.currPage++
    autoloadNextPage.counter++
  } catch (error) {
    console.error('Failed to load next page:', error)
    autoloadNextPage.progress = false
  }
}
