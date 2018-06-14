import { Module } from '../module'

export const removeAds = new Module('removeAds')

removeAds.activate = () => {

  // Home facebook widget
  $('#forum-fb-likebox').remove()
  // Top ad bar
  $('nav#menu-family').prev('div').remove()
  // Sidebar ad
  $('aside#sidebar-forum').find('div[id*="bmone2n"]').parent('div').remove()
  // Bottom ad
  $('div.forum-topics-block').next('div').remove()
}