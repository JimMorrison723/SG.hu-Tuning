import { API_KEY } from './config'

interface AnswersResponse {
  msg: Answer[]
}

interface Answer {
  unique: number
  nick: string
  text: string
  created: string
}

interface MessageResponse {
  value: Message
}

interface Message {
  unique: number
  nick: string
  text: string
  created: string
}

/**
 * Get answers to a specific comment
 *
 * @param topicId - The topic ID
 * @param unique - The unique message identifier
 * @returns Promise resolving to array of answers
 */
export async function getAnswers(topicId: number, unique: number): Promise<Answer[]> {
  const response = await fetch(`/api/forum/answers?topic_id=${topicId}&msg_unique=${unique}`)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data: AnswersResponse = await response.json()
  return data.msg
}

/**
 * Get a specific message
 *
 * @param topicId - The topic ID
 * @param unique - The unique message identifier
 * @returns Promise resolving to the message object
 */
export async function getMessage(topicId: number, unique: number): Promise<Message> {
  if (!topicId || !unique) {
    throw new Error('topicId and unique are required')
  }

  const response = await fetch(`/api/forum/message?topicId=${topicId}&unique=${unique}`)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data: MessageResponse = await response.json()
  return data.value
}

interface UserInfo {
  nick: string
  isMod: string
  buntetopontok: string
  uzenetek: string
  _zodiac: string
  _age: string
  nem: string
  honlap: string
  hobby: string
  iskola: string
  foglalkozas: string
  created_at: string
  forum_last_post: string
  updated_at: string
  openedTopics: OpenedTopic[]
}

interface OpenedTopic {
  _listingUrl: string
  created: string
  title: string
}

interface UserResponse {
  msg: UserInfo
}

/**
 * Get user info by user ID
 *
 * @param userId - The user ID
 * @returns Promise resolving to user info object
 */
export async function getUserInfo(userId: string): Promise<UserInfo> {
  const response = await fetch(`https://sg.hu/api/forum/user?apikey=${API_KEY}&user_id=${userId}`)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data: UserResponse = await response.json()
  return data.msg
}

/**
 * Get user info by ident ID (cookie)
 *
 * @param identId - The ident ID from cookie
 * @returns Promise resolving to user info object
 */
export async function getUserByIdentId(identId: string): Promise<UserInfo> {
  const response = await fetch(`https://sg.hu/api/forum/user?apikey=${API_KEY}&ident_id=${identId}`)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data: UserResponse = await response.json()
  return data.msg
}

/**
 * Check if user is logged in
 *
 * @returns Promise resolving to boolean
 */
export async function isUserLoggedIn(): Promise<boolean> {
  const response = await fetch(`https://sg.hu/api/forum/user/islogged?apikey=${API_KEY}`)
  return response.ok
}
