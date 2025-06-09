// ==UserScript==
// @name          Photopea: Dismiss Welcome Page
// @icon          https://www.photopea.com/promo/icon512.png
// @namespace     https://github.com/nolddor
// @match         https://www.photopea.com/
// @grant         none
// @version       1.0.0
// @author        Jack Nolddor
// @description   Dismiss welcome page shown at first time you visit Photopea.
// @license       MIT
// @run-at        document-start
// @updateURL     https://raw.githubusercontent.com/nolddor/userscripts/main/src/photopea/index.user.js
// @downloadURL   https://raw.githubusercontent.com/nolddor/userscripts/main/src/photopea/index.user.js
// ==/UserScript==

(function () {
  if (!localStorage) {
    console.warn('localStorage is not available.')
    return
  }
  localStorage.setItem('_ppp', JSON.stringify({ capShown: 'false' }))
})()
