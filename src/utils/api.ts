/**
 * Get answers to a specific comment
 *
 * @param topicId - The topic ID
 * @param unique - The unique message identifier
 * @returns Promise resolving to array of answers
 */
export function getAnswers(topicId: number, unique: number): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()

    request.open('GET', '/api/forum/answers?topic_id=' + topicId + '&msg_unique=' + unique, true)

    request.onload = () => {
      if (request.status >= 200 && request.status < 400) {
        resolve(JSON.parse(request.responseText).msg)
      }
    }

    request.onerror = () => {
      reject(request.responseText)
    }

    request.send()
  })
}

/**
 * Get a specific message
 *
 * @param topicId - The topic ID
 * @param unique - The unique message identifier
 * @returns Promise resolving to the message object
 */
export function getMessage(topicId: number, unique: number): Promise<any> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('GET', '/api/forum/message?topicId=' + topicId + '&unique=' + unique, false)

    if (!topicId || !unique) {
      reject()
      return
    }

    request.onload = () => {
      if (request.status >= 200 && request.status < 400) {
        resolve(JSON.parse(request.responseText).value)
      }
    }

    request.onerror = () => {
      reject(request.responseText)
    }

    request.send()
  })
}
