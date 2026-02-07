import { Module } from '../Module'
import { context } from '../context'

export const topicWhitelist = new Module('topicWhitelist')

topicWhitelist.execute = (element: Element, id: string | number) => {

  // Add topic to whitelist
  if ($(element).html() === '+') {

    // Change the status icon
    $(element).html('-')

    // Change status title
    $(element).attr('title', 'Téma eltávolítása a fehérlistából')

    // Add to config
    context.port!.postMessage({name: 'addTopicToWhitelist', message: id})

    // Remove topic from whitelist
  } else {

    // Change the status icon
    $(element).html('+')

    // Change status title
    $(element).attr('title', 'Téma hozzáadása a fehérlistához')

    // Remove from config
    context.port!.postMessage({name: 'removeTopicFromWhitelist', message: id})
  }
}
