export function setCookie(c_name, value, exdays) {
  let exdate = new Date()
  exdate.setDate(exdate.getDate() + exdays)
  let c_value = escape(value) + ((exdays == null) ? '' : '; expires=' + exdate.toUTCString())
  document.cookie = c_name + '=' + c_value
}

export function getCookie(c_name) {
  let i, x, y, ARRcookies = document.cookie.split(';')
  for (i = 0; i < ARRcookies.length; i++) {
    x = ARRcookies[i].substr(0, ARRcookies[i].indexOf('='))
    y = ARRcookies[i].substr(ARRcookies[i].indexOf('=') + 1)
    x = x.replace(/^\s+|\s+$/g, '')
    if (x == c_name) {
      return unescape(y)
    }
  }
}

export function removeCookie(name, path, domain) {
  if (getCookie(name)) document.cookie = name + '=' +
    ((path) ? ';path=' + path : '') +
    ((domain) ? ';domain=' + domain : '') +
    ';expires=Thu, 01-Jan-1970 00:00:01 GMT'
}