export function setCookie(c_name: string, value: string, exdays: number | null): void {
  const exdate = new Date()
  exdate.setDate(exdate.getDate() + (exdays || 0))
  const c_value = encodeURIComponent(value) + ((exdays == null) ? '' : '; expires=' + exdate.toUTCString())
  document.cookie = c_name + '=' + c_value
}

export function getCookie(c_name: string): string | undefined {
  const ARRcookies = document.cookie.split(';')
  for (let i = 0; i < ARRcookies.length; i++) {
    let x = ARRcookies[i].substring(0, ARRcookies[i].indexOf('='))
    const y = ARRcookies[i].substring(ARRcookies[i].indexOf('=') + 1)
    x = x.replace(/^\s+|\s+$/g, '')
    if (x == c_name) {
      return decodeURIComponent(y)
    }
  }
  return undefined
}

export function removeCookie(name: string, path?: string, domain?: string): void {
  if (getCookie(name)) {
    document.cookie = name + '=' +
      ((path) ? ';path=' + path : '') +
      ((domain) ? ';domain=' + domain : '') +
      ';expires=Thu, 01-Jan-1970 00:00:01 GMT'
  }
}
