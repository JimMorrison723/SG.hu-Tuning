import {Module} from '../module'

export const quickInsertion = new Module('quickInsertion')

quickInsertion.activate = () => {

  let ta
  //TODO: enable when built-in wysiwyg editor works
  // let ta2

  ta = $('form[name="newmessage"] textarea')

  // if (dataStore['wysiwyg_editor']) {
  //   ta = $('.cleditorMain:first iframe').contents().find('body')
  //   ta2 = $('.cleditorMain:first textarea[name="message"]')
  // }

  // Paste event on WYSIWYG view and source view
  //   .add(ta2)
  $(ta).on('paste', function (e) {

    let data = e.originalEvent.clipboardData.getData('Text')

    if (data.length > 10) {

      //TODO: facebook images pattern
      let urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/
      let imgPattern = /^https?:\/\/(?:[a-z\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:jpe?g|gif|png)$/

      let bhtml
      //let ihtml;

      if (imgPattern.test(data)) {
        e.preventDefault()
        bhtml = '[img]' + data + '[/img]'
        //ihtml = '<img src="' + data + '">';
      }
      else if (urlPattern.test(data)) {
        e.preventDefault()

        // Create a dummy <a> element
        let a = document.createElement('a')
        // Assign link, let the browser parse it
        a.href = data
        let url_pathname = a.pathname.substring(1, data.length)
        if (url_pathname.length === 0) {
          url_pathname = data
        }
        bhtml = '[url=' + data + ']' + url_pathname + '[/url]'
        //ihtml = '<a href="' + data + '">' + url_pathname + '</a>';
      }

      if (bhtml) {
        ta.val(ta.val() + bhtml)
      }

    }
  })
}
