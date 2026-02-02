import { Module } from '../Module'
import { context } from '../context'

export const sgTabs = new Module('sgTabs')

sgTabs.activate = () => {
  // No initial activation needed
}

sgTabs.disable = () => {
  $('.opened_link').removeClass('opened_link')
}

sgTabs.refresh = (pages: any) => {
  // Remove every open marker, start fresh
  $('.opened_link').removeClass('opened_link')

  if (context.PAGE === 1) {
    sgTabs.forum(pages)
  } else if (context.PAGE === 2) {
    sgTabs.topic(pages)
  } else if (context.PAGE === 4) {
    sgTabs.temak(pages)
  }
}

sgTabs.forum = (pages: any) => {
  for (const page in pages) {
    $('#favorites-list a[href*="' + pages[page].url + '"]').addClass('opened_link')
    $('.forums-list a[href="' + pages[page].url + '"]').parent('li').addClass('opened_link')
  }
}

sgTabs.temak = (pages: any) => {
  for (const page in pages) {
    $('.forums-block a[href="' + pages[page].url + '"]').parent('li').addClass('opened_link')
  }
}

sgTabs.topic = (pages: any) => {
  const select = $('#topicslist')
  select.find('option').find('span').remove()
  for (const page in pages) {
    select.find('option[data-url="' + pages[page].url + '"]').prepend('<span>👓</span>')
  }
}
