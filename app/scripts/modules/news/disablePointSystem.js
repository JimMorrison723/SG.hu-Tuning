import { Module } from '../module'

export const disablePointSystem = new Module('disablePointSystem')

disablePointSystem.activate = () => {

  $('span.forum-post-rate-place').hide()
}

disablePointSystem.disable = () => {

  $('span.forum-post-rate-place').show()
}