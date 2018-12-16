import { Module } from '../module'
import { PAGE } from './../../contentscript'

export const sgTabs = new Module('sgTabs')

sgTabs.activate = () => {
}

sgTabs.disable = () => {
  $('.opened_link').removeClass('opened_link')
}

sgTabs.refresh = (pages) => {
  // Remove every open marker, start fresh
  $('.opened_link').removeClass('opened_link')

  if (PAGE === 1) {
    sgTabs.forum(pages)
  } else if (PAGE === 2) {
    sgTabs.topic(pages)
  } else if (PAGE === 4) {
    sgTabs.temak(pages)
  }
}

sgTabs.forum = (pages) => {
  for (let page in pages) {
    $('#favorites-list a[href*="' + pages[page].url + '"]').addClass('opened_link')
    $('.forums-list a[href="' + pages[page].url + '"]').parent('li').addClass('opened_link')
  }
}

sgTabs.temak = (pages) => {
  for (let page in pages) {
    $('.forums-block a[href="' + pages[page].url + '"]').parent('li').addClass('opened_link')
  }
}

sgTabs.topic = (pages) => {
  const select = $('#topicslist')
  select.find('option').find('span').remove()
  for (let page in pages) {
    select.find('option[data-url="' + pages[page].url + '"]').prepend('<span>👓</span>')
  }
}