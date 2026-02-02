import { Module } from '../Module'

export const chatHide = new Module('chatHide')

chatHide.activate = () => {
  $('#forum-chat').hide()
  const wrap = $('#forum-wrap')
  wrap.find('.blue-border-top').hide()
  wrap.find('.forums-block:first').css({ 'margin-top': '0px' })
}

chatHide.disable = () => {
  $('#forum-chat').show()
  const wrap = $('#forum-wrap')
  wrap.find('.blue-border-top').show()
  wrap.find('.forums-block:first').css({ 'margin-top': '35px' })
}
