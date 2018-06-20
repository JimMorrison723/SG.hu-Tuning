export { getAnswers, getMessage }

/**
 * Get answers to a specific comment
 *
 * @param {number} topicId
 * @param {number} unique
 * @returns Promise<any>
 */
function getAnswers(topicId, unique) {

  return new Promise(function (resolve, reject) {

    let request = new XMLHttpRequest()

    request.open('GET', '/api/forum/answers?topic_id=' + topicId + '&msg_unique=' + unique, true)

    request.onload = () => {

      if (request.status >= 200 && request.status < 400) {

        resolve(JSON.parse(request.responseText).msg)
      }
    }

    request.onerror = () => {
      reject(request.responseText)
    }

    // Send our request
    request.send()
  })

}

function getMessage(topicId, unique) {

  return new Promise(function (resolve, reject) {

    let request = new XMLHttpRequest()
    request.open('GET', '/api/forum/message?topicId=' + topicId + '&unique=' + unique, false)

    if (!topicId || !unique)
      reject()

    request.onload = function () {

      if (request.status >= 200 && request.status < 400) {

        // We only need the msg object
        resolve(JSON.parse(request.responseText).value)
      }
    }

    request.onerror = () => {
      reject(request.responseText)
    }

    // Send our request
    request.send()
  })
}

