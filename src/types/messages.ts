/**
 * Type definitions for background <-> content script messaging
 */

// Messages from content script to background
export type ContentToBackgroundMessage =
  | { name: 'getSettings' }
  | { name: 'setBlocksConfig'; message: string }
  | { name: 'addToBlocklist'; message: string }
  | { name: 'removeUserFromBlocklist'; message: string }
  | { name: 'setSetting'; key: string; val: unknown }
  | { name: 'resetBlocksConfig' }
  | { name: 'setUserSetting'; message: UserInfo }
  | { name: 'setMCSelectedTab'; message: number }
  | { name: 'setMCMessages'; message: MCMessage[] }
  | { name: 'addTopicToWhitelist'; message: string }
  | { name: 'removeTopicFromWhitelist'; message: string }

// Messages from background to content script
export type BackgroundToContentMessage =
  | { name: 'setSettings'; message: Record<string, unknown> }
  | { name: 'updateSettings'; message: Record<string, unknown> }
  | { name: 'SGTabs'; message: SGTab[] }

// Shared data types
export interface UserInfo {
  isLoggedIn: boolean
  userName: string
}

export interface SGTab {
  id: number
  url: string
}

export interface MCMessage {
  topic_name: string
  topic_id: string
  time: number
  message: string
  checked: number
  comment_id?: string
  answers: MCAnswer[]
}

export interface MCAnswer {
  id: string
  author: string
  message: string
}

// Settings types
export interface ExtensionSettings {
  // Boolean toggles
  chatHide: boolean
  favShowOnlyUnread: boolean
  shortCommentMarker: boolean
  highlightForumCategories: boolean
  showNavigationButtons: boolean
  autoloadNextPage: boolean
  overlayReplyTo: boolean
  highlightCommentsForMe: boolean
  threadedComments: boolean
  quickQuote: boolean
  updateFavList: boolean
  customBlocks: boolean
  jumpUnreadMessages: boolean
  makeReadAllFavs: boolean
  removeAds: boolean
  quickInsertion: boolean
  fetchNewComments: boolean
  textareaAutoResize: boolean
  sgTabs: boolean
  messageCenter: boolean
  quickUserInfo: boolean
  nightMode: boolean
  disablePointSystem: boolean

  // Complex settings
  user: UserInfo
  blocklisted: string
  blocksConfig: string
  profiles: string
  topicWhitelist: string
  mcMessages: string
  mcSelectedTab: number
  highlightForumCategoriesConfig: string
  installed: string
}
