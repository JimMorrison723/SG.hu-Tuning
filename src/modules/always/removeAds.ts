import { Module } from '../Module'

export const removeAds = new Module('removeAds')

removeAds.activate = () => {
  // Ad spaces
  $('div[id^="sg_forumnyito_"]').remove()
  // Home facebook widget
  $('#forum-fb-likebox').remove()
  // Forum page blue separator
  $('#forum-wrap').find('.blue-border-top').hide()
  // Top ad bar
  $('nav#menu-family').prev('div').remove()
  // Sidebar ad
  $('aside#sidebar-forum').find('div[id*="bmone2n"]').parent('div').remove()
  // Bottom ad
  $('div.forum-topics-block').next('div').remove()

  const style = document.createElement('style')
  style.textContent = `
      div[id^="sg_forumnyito_"],
      #forum-fb-likebox,
      #forum-wrap .blue-border-top,
      div:has(+ nav#menu-family),
      aside#sidebar-forum div:has(> div[id*="bmone2n"]),
      div.forum-topics-block + div {
        display: none !important;
      }
    `;
  
  (document.head || document.documentElement).appendChild(style)
}
