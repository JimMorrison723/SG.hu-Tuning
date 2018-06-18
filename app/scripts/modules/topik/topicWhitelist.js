import { Module } from '../module'
import { port } from '../../contentscript'

export const topicWhitelist = new Module('topicWhitelist')

topicWhitelist.execute = (element, id) => {

  // Add topic to whitelist
  if ($(element).html() === '+') {

    // Change the status icon
    $(element).html('-')

    // Change status title
    $(element).attr('title', 'Téma eltávolítása a fehérlistából')

    // Add to config
    port.postMessage({name: 'addTopicToWhitelist', message: id})

    // Remove topic from whitelist
  } else {

    // Change the status icon
    $(element).html('+')

    // Change status title
    $(element).attr('title', 'Téma hozzáadása a fehérlistához')

    // Remove from config
    port.postMessage({name: 'removeTopicFromWhitelist', message: id})
  }
}