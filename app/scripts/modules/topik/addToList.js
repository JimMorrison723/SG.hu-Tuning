import { Module } from '../module'
import { port, dataStore } from '../../contentscript'
import { block } from './blocklist'
import { profiles } from './profiles'

export const addToList = new Module('addToList')

addToList.colors = {

  '1': '7fadd4', '2': '90abc3', '3': '597995', '4': '657889', '5': '658969',
  '6': '898665', '7': '897665', '8': '896586', '9': '986856', '10': '985690',
  '11': '565698', '12': '56988f', '13': '689856', '14': '979155', '15': '977455',
  '18': '9dc6e2', '19': '9ca7e2', '20': 'c99ce2', '21': 'e29cdb', '22': 'e29da5',
  '24': 'c0c0c0', '25': 'a0a0a0', '26': '808080', '27': '555555'
}

addToList.activate = () => {

  // Create dropdowns
  $('#forum-posts-list').find('ul li header:not(.ext_add_to_list_topichead) a:contains("#")').each(function () {

    // Insert separator
    let separator = $('<span class="separator pull-right"></span>').insertBefore(this)

    // Insert dropdow placeholder
    let dropdown = $('<div class="ext_dropdown pull-right"><span>&#9660;</span></div>').insertBefore(separator)

    // Insert dropdown list
    let list = $('<ul></ul>').appendTo(dropdown).addClass('ext_addtolist_list')

    // Set dropdown background color
    let color_id = $(this).closest('#forum-posts-list ul li').css('background-image').match(/\d+/g)

    if (color_id) {
      list.css('background-color', '#' + addToList.colors[color_id])
    } else {
      list.css('background-color', '#ccc')
    }

    // Set relative position to the container
    $(this).closest('#forum-posts-list ul li header').css('position', 'relative').addClass('ext_add_to_list_topichead')

  })

  // Create dropdown event
  $('.ext_dropdown').off().on('click', function () {

    if ($(this).find('ul').css('display') === 'none') {
      $(this).find('ul').css('top', $(this).closest('#forum-posts-list ul li header').height()).slideDown()
    } else {
      $(this).find('ul').slideUp()
    }
  })

  $('.ext_addtolist_list').find('*').remove()

  // Build list
  addToList.buildList()

  // Create events for blocklist
  $('.ext_addtoblocklist').off().on('click', function () {
    block(this)
  })

  // Create events for lists
  $('.ext_addtolist').off().on('click', function () {
    addToList.addToList($(this).attr('class').match(/\d+/g), this)
  })
}

addToList.buildList = () => {
  // Add the title
  $('<li><h3>Hozzáadás listához</h3></li>').appendTo('.ext_addtolist_list')

  // Insert separator
  $('<li></li>').appendTo('.ext_addtolist_list')

  // Add blocklist option
  $('<li class="ident ext_addtoblocklist">Tiltólista</li>').appendTo('.ext_addtolist_list')

  if (!dataStore['profilesList']) {
    return
  }

  // Get the profile groups
  let profiles = JSON.parse(dataStore['profilesList'])

  // Iterate over the groups, add each one to the list
  for (let c = 0; c < profiles.length; c++) {
    $('<li><hr></li>').appendTo('.ext_addtolist_list')
    $('<li class="ident ext_addtolist profile_' + c + '" style="color: #' + profiles[c]['color'][0] + '">' + profiles[c]['title'] + '</li>').appendTo('.ext_addtolist_list')
  }
}

addToList.addToList = (group, ele) => {

  // Get profiles
  let list = JSON.parse(dataStore['profilesList'])
  let nick

  // Get user's nick
  let anchor = $(ele).closest('#forum-posts-list ul li header').find('a[href*="felhasznalo"]')

  if (anchor.children('img').length > 0) {
    nick = anchor.children('img').attr('title').replace(' - VIP', '')

  } else {
    nick = anchor.html().replace(' - VIP', '')
  }

  // Check user
  if (list[group]['users'].indexOf(nick) === -1) {
    list[group]['users'].push(nick)
  } else {
    list[group]['users'].splice(list[group]['users'].indexOf(nick), 1)
  }

  // Stringify the new profiles list
  let data = JSON.stringify(list)

  // Save in dataStore
  dataStore['profilesList'] = data

  // Save in localStorage
  port.postMessage({ name: 'setSetting', key: 'profilesList', val: data })

  // Remove checked class for update
  $('#forum-posts-list').find('.forum-post').each(function () {
    let nick_2

    if (document.location.href.match(/cikkek/)) {

      nick_2 = $(this).find('a:first').html()

    } else {
      /* BUG avatar nélküli felhasználóknál nem működik.     $(this).find("header a")[0]  undefined */
      nick_2 = ($(this).find('.name img').length === 1) ? $(this).find('.name img').attr('alt') : $(this).find('.name').text()
      nick_2 = nick_2.replace(/ - VIP/, '')
    }

    if (nick === nick_2) {
      $(this).removeClass('checked')
    }
  })

  // Update content GUI
  profiles.activate()
}