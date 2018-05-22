import { Module } from '../module'

export const highlightForumCategories = new Module('highlightForumCategories')

highlightForumCategories.activate = () => {
  $('nav#favorites-list a.category').css({
    'color': '#ffffff',
    'background-color': '#6c9ff7',
    'padding-left': '5px'
  })
}

highlightForumCategories.disable = () => {
  $('nav#favorites-list a.category').css({
    'color': '#444',
    'background-color': '#fff',
    'padding-left': '15px'
  })
}