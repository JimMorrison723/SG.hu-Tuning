import { Module } from '../Module'

export const quickInsertion = new Module('quickInsertion')

quickInsertion.activate = () => {

  const ta = $('form[name="newmessage"] textarea')

  // Note: WYSIWYG editor integration disabled - requires built-in editor support

  // Paste event handler
  $(ta).on('paste', function (e) {

    const data = (e.originalEvent as ClipboardEvent).clipboardData?.getData('Text') || ''

    if (data.length > 10) {

      // URL and image patterns
      // Note: Facebook image URLs may need special handling
      const urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?/
      const imgPattern = /^https?:\/\/(?:[a-z-]+\.)+[a-z]{2,6}(?:\/[^/#?]+)+\.(?:jpe?g|gif|png)$/

      let bhtml = ''

      if (imgPattern.test(data)) {
        e.preventDefault()
        bhtml = '[img]' + data + '[/img]'
      }
      else if (urlPattern.test(data)) {
        e.preventDefault()

        // Create a dummy <a> element to parse the URL
        const a = document.createElement('a')
        a.href = data
        let url_pathname = a.pathname.substring(1, data.length)
        if (url_pathname.length === 0) {
          url_pathname = data
        }
        bhtml = '[url=' + data + ']' + url_pathname + '[/url]'
      }

      if (bhtml) {
        ta.val(ta.val() + bhtml)
      }
    }
  })
}
