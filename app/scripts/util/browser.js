const browserInstance = (function () {
  return window.msBrowser ||
      window.browser ||
      window.chrome
})()

export default browserInstance