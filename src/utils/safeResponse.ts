// https://github.com/operatester/safeResponse/blob/1.1/safeResponse.js
export const safeResponse = {
  validAttrs: ['class', 'id', 'href', 'style', 'data-info', 'data-post-info', 'rel', 'target', 'src', 'alt', 'title',
    'datetime', 'direction', 'data-id', 'border', 'height', 'width', 'onload', 'data-pagespeed-url-hash'],

  cleanDomString(html: string): string {
    return safeResponse.__cleanDomString(html)
  },

  cleanDomHtml(html: Element): string {
    return safeResponse.__cleanDomHtml(html)
  },

  __removeInvalidAttributes(target: Element): void {
    const attrs = target.attributes

    for (let i = attrs.length - 1; i >= 0; i--) {
      const currentAttr = attrs[i].name

      if (attrs[i].specified && safeResponse.validAttrs.indexOf(currentAttr) === -1) {
        target.removeAttribute(currentAttr)
      }

      if (
        currentAttr === 'href' &&
        target.getAttribute('href')!.length > 1 &&
        /^((javascript[:])|#(?!reply))/gi.test(target.getAttribute('href')!)
      ) {
        target.parentNode?.removeChild(target)
      }
    }
  },

  __cleanDomString(data: string): string {
    const parser = new DOMParser()
    const tmpDom = parser.parseFromString(data, 'text/html').body

    return safeResponse.clean(tmpDom)
  },

  __cleanDomHtml(data: Element): string {
    const parser = new DOMParser()
    const tmpDom = parser.parseFromString(data.outerHTML, 'text/html').body

    return safeResponse.clean(tmpDom)
  },

  clean(tmpDom: HTMLElement): string {
    let list = tmpDom.querySelectorAll('script')

    for (let i = list.length - 1; i >= 0; i--) {
      const current = list[i]
      current.parentNode?.removeChild(current)
    }

    const elements = tmpDom.getElementsByTagName('*')

    for (let i = elements.length - 1; i >= 0; i--) {
      safeResponse.__removeInvalidAttributes(elements[i])
    }
    return tmpDom.innerHTML
  }
}
