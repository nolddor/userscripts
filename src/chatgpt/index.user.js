// ==UserScript==
// @name          ChatGPT: Dismiss No-Auth Modal Window
// @icon          https://chatgpt.com/favicon.ico
// @namespace     https://github.com/nolddor
// @match         https://chatgpt.com/*
// @grant         none
// @version       1.1.1
// @author        Jack Nolddor
// @description   Dismiss modal window that appears when you try to use ChatGPT without being logged in.
// @license       MIT
// @run-at        document-start
// @updateURL     https://raw.githubusercontent.com/nolddor/userscripts/main/src/chatgpt/index.user.js
// @downloadURL   https://raw.githubusercontent.com/nolddor/userscripts/main/src/chatgpt/index.user.js
// ==/UserScript==

(function () {
  if (!sessionStorage) {
    console.warn('sessionStorage is not available.');
    return;
  }
  sessionStorage.setItem('oai/apps/noAuthHasDismissedSoftRateLimitModal', true);
  sessionStorage.setItem('has-dismissed-welcome-back-modal', true);
})();