import { Module } from '../module'

export const chatHide = new Module('chatHide')

chatHide.activate = () => {

  $('#forum-chat').hide()
  $('#forum-wrap').find('.blue-border-top').hide()
  $('#forum-wrap').find('.forums-block:first').css({ 'margin-top': '0px' })
}

chatHide.disable = () => {

  $('#forum-chat').show()
  $('#forum-wrap').find('.blue-border-top').show()
  $('#forum-wrap').find('.forums-block:first').css({ 'margin-top': '35px' })
}