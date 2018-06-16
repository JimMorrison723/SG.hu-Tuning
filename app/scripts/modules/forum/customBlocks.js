import { Module } from '../module'
import { dataStore, port } from '../../contentscript'

export const customBlocks = new Module('customBlocks')

customBlocks.activate = () => {

  // Set blocks IDs
  customBlocks.setIDs()

  // Check localStorage for config
  if (!dataStore['blocksConfig'] || dataStore['blocksConfig'] === '') {
    customBlocks.buildConfig()
  }

  // Execute config
  customBlocks.executeConfig()

  // Set overlays
  if (!dataStore['hideBlocksButtons']) {
    customBlocks.setOverlay()
  }
}

customBlocks.disable = () => {

  $('.ext_blocks_buttons').remove()
}

customBlocks.setIDs = () => {

  customBlocks.helperClasses()

  // Blocks counter
  let counter = 1

  // Iterate over blocks
  $('#sidebar-forum > section, #forum-wrap > div, #forum-wrap > section').each(function () {

    // Set the ID
    $(this).addClass('ext_block block-' + counter)

    // Some elements doesn't have any id in the right column, fix it
    if ($(this).attr('id') === undefined)
      $(this).attr('id', 'block-' + counter)

    // Increase the counter
    counter++
  })
}

customBlocks.helperClasses = () => {
  $('.articles-block').children('div').wrapAll('<div class="ext-articles-block"></div>')
  $('.forum-topics-block').children('section').wrapAll('<div class="ext-forum-topics-block"></div>')
}

customBlocks.buildConfig = () => {

  // let for config
  let config = []

  // Iterate over the blocks
  $('.ext_block').each(function (index) {

    let tmp = {

      id: $(this).attr('id'),
      visibility: true,
      contentHide: false,
      side: $(this).parent('#sidebar-forum').length > 0 ? 'left' : 'right',
      index: index
    }
    config.push(tmp)

  })

  // Store in localStorage
  port.postMessage({name: 'setBlocksConfig', message: JSON.stringify(config)})

  // Update in dataStore let
  dataStore['blocksConfig'] = JSON.stringify(config)
}

customBlocks.setConfigByKey = (id, key, value) => {

  let config = JSON.parse(dataStore['blocksConfig'])

  for (let c = 0; c < config.length; c++) {

    if (config[c]['id'] === id) {
      config[c][key] = value
    }
  }

  // Store in dataStore
  port.postMessage({name: 'setBlocksConfig', message: JSON.stringify(config)})

  // Update dataStore let
  // dataStore['blocksConfig'] = JSON.stringify(config)
}

customBlocks.getConfigValByKey = (id, key) => {

  let config = JSON.parse(dataStore['blocksConfig'])

  for (let c = 0; c < config.length; c++) {

    if (config[c]['id'] === id) {
      return config[c][key]
    }
  }
}

customBlocks.reindexOrderConfig = () => {

  // let for config
  //let config = JSON.parse(dataStore['blocksConfig']);
  let _config = []

  $('.ext_block').each(function (index) {
    console.log()

    let _id = $(this).attr('id')

    // Iterate over the blocks
    let tmp = {
      id: _id,
      visibility: customBlocks.getConfigValByKey(_id, 'visibility'),
      contentHide: customBlocks.getConfigValByKey(_id, 'contentHide'),
      side: $(this).parent('#sidebar-forum').length > 0 ? 'left' : 'right',
      index: index
    }

    _config.push(tmp)

  })

  // Store in localStorage
  port.postMessage({name: 'setBlocksConfig', message: JSON.stringify(_config)})
}

customBlocks.executeConfig = () => {

  let config = JSON.parse(dataStore['blocksConfig'])
  config = config.reverse()
  for (let c = 0; c < config.length; c++) {

    // Visibility
    if (config[c]['visibility'] === false) {
      customBlocks.hide(config[c]['id'], false)
    }

    // ContentHide
    if (config[c]['contentHide'] === true) {
      customBlocks.contentHide(config[c]['id'], false)
    }

    // Side and pos
    if (config[c]['side'] === 'left') {

      $('#' + config[c]['id']).prependTo('#sidebar-forum')

    } else {

      $('#' + config[c]['id']).prependTo('#forum-wrap')
    }
  }

}

customBlocks.setOverlay = () => {

  $('.ext_block').each(function () {

    let item = $('<p class="ext_blocks_buttons"></p>').prependTo(this)

    // Content hide
    $('<img src="' + browser.extension.getURL('/images/blocks/minimize.png') + '" class="ext_block_button_right">').prependTo(item).click(function (e) {
      e.preventDefault()
      customBlocks.contentHide($(this).closest('section, div').attr('id'), true)
    })

    // Hide
    $('<img src="' + browser.extension.getURL('/images/blocks/close.png') + '" class="ext_block_button_right">').prependTo(item).click(function (e) {
      e.preventDefault()
      customBlocks.hide($(this).closest('section, div').attr('id'), true)
    })

    // Down
    $('<img src="' + browser.extension.getURL('/images/blocks/down.png') + '" class="ext_block_button_left">').prependTo(item).click(function (e) {
      e.preventDefault()
      customBlocks.down($(this).closest('section, div').attr('id'), true)
    })

    // Up
    $('<img src="' + browser.extension.getURL('/images/blocks/up.png') + '" class="ext_block_button_left">').prependTo(item).click(function (e) {
      e.preventDefault()
      customBlocks.up($(this).closest('section, div').attr('id'), true)
    })

  })
}

customBlocks.hide = (id, clicked) => {

  if (clicked === true) {
    // Change the config
    customBlocks.setConfigByKey(id, 'visibility', false)

    // Hide the item
    $('#' + id).slideUp(200)
  } else {
    $('#' + id).hide()
  }
}

customBlocks.contentHide = (id, clicked) => {

  let c_id = $('#' + id)

  let element_hide = customBlocks.getChildrenToHide(c_id)

  if (clicked === false) {
    element_hide.hide()
    return true
  }

  if (element_hide.css('display') === 'none') {

    // Change the config
    customBlocks.setConfigByKey(id, 'contentHide', false)

    // Hide the item
    element_hide.show()

  } else {

    // Change the config
    customBlocks.setConfigByKey(id, 'contentHide', true)

    // Hide the item
    element_hide.hide()
  }
}

customBlocks.getChildrenToHide = (parent) => {

  // This is a very cool method name

  return (parent.has('#birthday-wrap').length && parent.children('#birthday-wrap')) ||
    (parent.has('.forums-list').length && parent.children('.forums-list')) ||
    (parent.has('.ext-articles-block').length && parent.children('.ext-articles-block')) ||
    (parent.has('.ext-forum-topics-block').length && parent.children('.ext-forum-topics-block')) ||
    (parent.has('nav').length && parent.children('nav'))
}

customBlocks.up = (id) => {

  let c_id = $('#' + id)

  // Get index val
  let index = c_id.index('.ext_block')

  // Current position
  if (c_id.closest('#ext_left_sidebar').length > 0) {

    if (index === 0) {
      return false
    }

  } else {

    let first = $('#ext_left_sidebar').find('.ext_block').length
    if (index === first) {
      return false
    }
  }

  // Move to target
  c_id.insertBefore('.ext_block:eq(' + (index - 1) + ')')

  // Store data in localStorage
  customBlocks.reindexOrderConfig()
}

customBlocks.down = (id) => {

  let c_id = $('#' + id)

  // Get index val
  let index = c_id.index('.ext_block')

  // Current position
  if (c_id.closest('#ext_left_sidebar').length > 0) {

    let last = $('#ext_left_sidebar').find('.ext_block').length - 1

    if (last === index) {
      return false
    }
  }

  // Move to target
  c_id.insertAfter('.ext_block:eq(' + (index + 1) + ')')

  // Store data in localStorage
  customBlocks.reindexOrderConfig()
}
