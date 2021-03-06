import { blocklist } from './blocklist'
import { addToList } from './addToList'
import { disablePointSystem } from '../news'
import { showNavigationButtons } from './showNavigationButtons'
import { highlightCommentsForMe } from './highlightCommentsForMe'
import { threadedComments } from './threadedComments'
import { profiles } from './profiles'
import { jumpUnreadMessages } from './jumpUnreadMessages'
import { autoloadNextPage } from './autoloadNextPage'
import { overlayReplyTo } from './overlayReplyTo'
import { quickUserInfo } from './quickUserInfo'
import { textareaAutoResize } from './textareaAutoResize'
import { quickInsertion } from './quickInsertion'
import { fetchNewComments } from './fetchNewComments'

// TODO: find a better way
import { removeAds } from './../always/removeAds'
import { messageCenter } from '../always/messageCenter'
import { sgTabs } from '../always'

export {
  removeAds,
  addToList,
  blocklist,
  disablePointSystem,
  showNavigationButtons,
  highlightCommentsForMe,
  threadedComments,
  profiles,
  jumpUnreadMessages,
  autoloadNextPage,
  overlayReplyTo,
  quickUserInfo,
  textareaAutoResize,
  quickInsertion,
  fetchNewComments,
  messageCenter,
  sgTabs
}