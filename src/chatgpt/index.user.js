// ==UserScript==
// @name          ChatGPT: Dismiss Annoying Modal Windows
// @icon          https://chatgpt.com/favicon.ico
// @namespace     https://github.com/nolddor
// @match         https://chatgpt.com/*
// @grant         GM_addStyle
// @version       1.2.0
// @author        Jack Nolddor
// @description   Dismiss modal windows that appear when you try to use ChatGPT without being logged in.
// @license       MIT
// @run-at        document-start
// @updateURL     https://raw.githubusercontent.com/nolddor/userscripts/main/src/chatgpt/index.user.js
// @downloadURL   https://raw.githubusercontent.com/nolddor/userscripts/main/src/chatgpt/index.user.js
// ==/UserScript==

(function () {
  GM_addStyle(`
    #credential_picker_container:has(iframe[src*="accounts.google.com"]) {
      display: none;
    }
  `)
})()
