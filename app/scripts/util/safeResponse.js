// https://github.com/operatester/safeResponse/blob/1.1/safeResponse.js
export let safeResponse = {

  validAttrs: ['class', 'id', 'href', 'style', 'data-info', 'data-post-info', 'rel', 'target', 'src', 'alt', 'title',
    'datetime', 'direction', 'data-id', 'border', 'height', 'width', 'onload', 'data-pagespeed-url-hash'],

  cleanDomString: function (html) {
    return safeResponse.__cleanDomString(html)
  },

  cleanDomHtml: function (html) {
    return safeResponse.__cleanDomHtml(html)
  },

  __removeInvalidAttributes: function (target) {
    let attrs = target.attributes, currentAttr

    for (let i = attrs.length - 1; i >= 0; i--) {
      currentAttr = attrs[i].name

      if (attrs[i].specified && safeResponse.validAttrs.indexOf(currentAttr) === -1) {
        target.removeAttribute(currentAttr)
      }

      if (
        currentAttr === 'href' &&
        target.getAttribute('href').length > 1 &&
        /^((javascript[:])|#(?!reply))/gi.test(target.getAttribute('href'))
      ) {
        target.parentNode.removeChild(target)
      }
    }
  },

  __cleanDomString: function (data) {
    let parser = new DOMParser
    let tmpDom = parser.parseFromString(data, 'text/html').body

    return safeResponse.clean(tmpDom)
  },

  __cleanDomHtml: function (data) {
    let parser = new DOMParser
    let tmpDom = parser.parseFromString(data.outerHTML, 'text/html').body

    return safeResponse.clean(tmpDom)
  },

  clean: function (tmpDom) {
    let list, current

    list = tmpDom.querySelectorAll('script')

    for (let i = list.length - 1; i >= 0; i--) {
      current = list[i]
      current.parentNode.removeChild(current)
    }

    list = tmpDom.getElementsByTagName('*')

    for (let i = list.length - 1; i >= 0; i--) {
      safeResponse.__removeInvalidAttributes(list[i])
    }
    return tmpDom.innerHTML
  }
}