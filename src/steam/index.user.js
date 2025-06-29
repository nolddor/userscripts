// ==UserScript==
// @name          Steam: Add Reputation Links
// @icon          https://steamcommunity.com/favicon.ico
// @namespace     https://github.com/nolddor
// @match         https://steamcommunity.com/profiles/*
// @match         https://steamcommunity.com/id/*
// @exclude       https://steamcommunity.com/profiles/*/*
// @exclude         https://steamcommunity.com/id/*/*
// @grant         unsafeWindow
// @version       1.1.6
// @author        Jack Nolddor
// @description   Steam: Adds reputation links to user profiles for SteamTrades, Backpack.tf, and CSGORep.
// @license       MIT
// @run-at        document-end
// @updateURL     https://raw.githubusercontent.com/nolddor/userscripts/main/src/steam/index.user.js
// @downloadURL   https://raw.githubusercontent.com/nolddor/userscripts/main/src/steam/index.user.js
// ==/UserScript==

class HTMLUtils {
  static parse (str) {
    const container = document.createElement('div')
    container.innerHTML = `${str}`.trim()
    return container.firstElementChild
  }
}

class TemplateUtils {
  static render (str, context) {
    return str.replace(/{{\s*([^{}\s]+)\s*}}/g, (match, key) => {
      // Check if key exists in context, else keep original placeholder
      return key in context ? context[key] : match
    })
  }
}

function GetSteamID () {
  return unsafeWindow.g_rgProfileData?.steamid
}

function GetPlayerStatusPanel () {
  return document.querySelector('.responsive_status_info')
}

function RenderReputationPanel (steamid) {
  const template = `
  <div class="profile_count_link_preview_ctn">
    <div class="profile_count_link ellipsis">
      <a href="#">
        <span class="count_link_label">Reputation</span>
      </a>
    </div>
    <div>
      <div class="profile_badges_badge" data-tooltip-html="SteamTrades.com">
        <a href="https://www.steamtrades.com/user/{{steamid}}" target="_blank">
          <img class="badge_icon small" style="max-height: 40px; max-width: 40px;"
            src="data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDI3IDM4IiB3aWR0aD0iMjciIGhlaWdodD0iMzgiPjxzdHlsZT4uYXtvcGFjaXR5Oi41NztmaWxsOiNmY2ZlZmV9LmJ7b3BhY2l0eToxO2ZpbGw6I2ZjZmVmZX0uY3tvcGFjaXR5OjE7ZmlsbDojZmNhYjBifS5ke29wYWNpdHk6MTtmaWxsOiNmYzc0NGN9LmV7b3BhY2l0eToxO2ZpbGw6IzRlYTkwZH0uZntvcGFjaXR5OjE7ZmlsbDojMTU3ZWQxfS5ne29wYWNpdHk6LjMyO2ZpbGw6I2ZkZmVmZX0uaHtvcGFjaXR5Oi4yNjtmaWxsOiNmY2ZlZmV9Lml7b3BhY2l0eTouNTE7ZmlsbDojZmRmZWZlfTwvc3R5bGU+PHBhdGggY2xhc3M9ImEiIGQ9Im0xMyAwLjVjMCAwLjMgMC4yIDAuNSAwLjUgMC41IDAuMyAwIDAuNS0wLjIgMC41LTAuNSAwLTAuMy0wLjItMC41LTAuNS0wLjUtMC4zIDAtMC41IDAuMi0wLjUgMC41eiIvPjxwYXRoIGNsYXNzPSJiIiBkPSJtOSAzYy0xLjkgMS4xLTQuNyAxLjktNi4zIDJoLTIuN2MwIDE4IDAuNCAyMS4zIDEuOCAyMy45IDEuMSAyLjIgMy41IDQuNCA3IDYuM2w1LjIgMi44YzguNS01LjMgMTAuOC03LjcgMTEuNy05LjcgMC44LTIgMS4zLTcuMyAxLjMtMTMuM3YtMTBjLTMuOSAwLTYuOC0wLjktOS0yLTIuMi0xLjEtNC4zLTItNC44LTItMC40IDAuMS0yLjMgMC45LTQuMiAyeiIvPjxwYXRoIGNsYXNzPSJjIiBkPSJtMTEuMyAyNC41Yy0wLjUgMC45LTAuMyAyLjEgMC40IDIuOCAwLjcgMC43IDEuOSAwLjkgMi44IDAuNSAwLjgtMC41IDEuNC0xLjYgMS4yLTIuNS0wLjEtMS0xLTEuOS0xLjktMi4xLTAuOS0wLjItMiAwLjQtMi41IDEuM3oiLz48cGF0aCBjbGFzcz0iZCIgZD0ibTE3LjMgMTguNWMtMC41IDAuOS0wLjMgMi4xIDAuNCAyLjggMC43IDAuNyAxLjkgMC45IDIuOCAwLjUgMC44LTAuNSAxLjQtMS42IDEuMi0yLjUtMC4xLTEtMS0xLjktMS45LTIuMS0wLjktMC4yLTIgMC40LTIuNSAxLjN6Ii8+PHBhdGggY2xhc3M9ImUiIGQ9Im01LjMgMTguNWMtMC41IDAuOS0wLjMgMi4xIDAuNCAyLjggMC43IDAuNyAxLjkgMC45IDIuOCAwLjUgMC44LTAuNSAxLjQtMS42IDEuMi0yLjUtMC4xLTEtMS0xLjktMS45LTIuMS0wLjktMC4yLTIgMC40LTIuNSAxLjN6Ii8+PHBhdGggY2xhc3M9ImYiIGQ9Im0xMS4zIDEyLjVjLTAuNSAwLjktMC4zIDIuMSAwLjQgMi44IDAuNyAwLjcgMS45IDAuOSAyLjggMC41IDAuOC0wLjUgMS40LTEuNiAxLjItMi41LTAuMS0xLTEtMS45LTEuOS0yLjEtMC45LTAuMi0yIDAuNC0yLjUgMS4zeiIvPjxwYXRoIGNsYXNzPSJnIiBkPSJtMCAyNi41YzAgMC4zIDAuMiAwLjUgMC41IDAuNSAwLjMgMCAwLjUtMC4yIDAuNS0wLjUgMC0wLjMtMC4yLTAuNS0wLjUtMC41LTAuMyAwLTAuNSAwLjItMC41IDAuNXoiLz48cGF0aCBjbGFzcz0iZyIgZD0ibTI2IDI2LjVjMCAwLjMgMC4yIDAuNSAwLjUgMC41IDAuMyAwIDAuNS0wLjIgMC41LTAuNSAwLTAuMy0wLjItMC41LTAuNS0wLjUtMC4zIDAtMC41IDAuMi0wLjUgMC41eiIvPjxwYXRoIGNsYXNzPSJoIiBkPSJtMTAgMzYuNWMwIDAuMyAwLjIgMC41IDAuNSAwLjUgMC4zIDAgMC41LTAuMiAwLjUtMC41IDAtMC4zLTAuMi0wLjUtMC41LTAuNS0wLjMgMC0wLjUgMC4yLTAuNSAwLjV6Ii8+PHBhdGggY2xhc3M9ImgiIGQ9Im0xNiAzNi41YzAgMC4zIDAuMiAwLjUgMC41IDAuNSAwLjMgMCAwLjUtMC4yIDAuNS0wLjUgMC0wLjMtMC4yLTAuNS0wLjUtMC41LTAuMyAwLTAuNSAwLjItMC41IDAuNXoiLz48cGF0aCBjbGFzcz0iaSIgZD0ibTEyIDM3LjVjMCAwLjMgMC4yIDAuNSAwLjUgMC41IDAuMyAwIDAuNS0wLjIgMC41LTAuNSAwLTAuMy0wLjItMC41LTAuNS0wLjUtMC4zIDAtMC41IDAuMi0wLjUgMC41eiIvPjwvc3ZnPg==">
        </a>
      </div>
      <div class="profile_badges_badge" data-tooltip-html="Backpack.tf">
        <a href="https://www.backpack.tf/trust/{{steamid}}" target="_blank">
          <img class="badge_icon small" style="max-height: 40px; max-width: 40px;"
            src="data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDU3IDQzIiB3aWR0aD0iNTciIGhlaWdodD0iNDMiPjxkZWZzPjxpbWFnZSB3aWR0aD0iNTgiIGhlaWdodD0iNDMiIGlkPSJpbWcxIiBocmVmPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURvQUFBQXJDQVlBQUFBcE1ac1dBQUFFQkVsRVFWUm9RODFaelU4VFVSRGZiVEJSNDhkSjQwV3ZlTlU3WGtuMFNNQ0tZaXdKUVEwUk5FS0xRR3dUdzRlcGJkTWdOU2lvUVl4aWpDVGlrZWpCQzRuaVFZMy9nWW1KSGtVQzdIdk83bmJMdHZ2ZXZzOEZsZ3Z0enB1WjMveG1abWUycHFIaFNwYmVUR0dNMi8ycVRQaUFOZWdPVjRIZ2Rpd2dRckp0ZjZkMDlZMi96bU1EOXpoS2JKdTJiWTdMRG9LNGNRRUROYUxpdG53Z2JoWmZiWUwwdmxlbGtreFN4YXBjZ0dTQ1dqWjVvL0J5RkJzb3lVSGVqaENSWXJRblA1dkcyTGk5ZlFpOHZPUlBaV0dnMSs3TnNFSFMwcGZmcjVBWXlpV3ZFTkN1N0xPVWdkR0lNSk55dmdtYkNUdkFEYlFyTzlPTkVTb29XU2MwR2tidmtUQkhqaW9YMEt0M24zS0EzQUcwaFlTRkNmVEsySk1FTURsZHJZTlNoQkZnWlQrdE5uUENrYVg0RUFxMGMzZzZBVFg1Q000R3h3K0pwSXJ5Q0NzZ1ZLQ2R3dytCU1lNQVVyV3FJcUNkSTRKRW9CMTNwcG9NYk0xQkdzU3E1elJXM0Rnc2FoRVJEM1lBYUh0bXNzazAwQXVJZTExRlhRMEpSRE9LUkNHSWFZeDNVSllJVmhYUWpzeGtvNFd0QlJ1a3UzdTR0MlBsLzUxNVhRT3BXdVlHUWJBVm9JbE1xUkZTZFI3YTF1NWFIYnpZZU9YWVBvcW5KbFZubVM4SHFBTVM0WG5ZS1FNZzJVNkZTMmgwV2NrVnMzMXNhdi9HMzlXZndPUSt1aVo5WENsNXEzRFlZYlJ0YUFJV1o1UW42WEdacjZrcWpzYkRJUkx1dHJJQ24zcHd2MUtqRjRmR1p5RjFXeFdDcHVWb0FKK216bFVCZWowM3QrZjNuMS9MOEZya3VCYVBkNWlTcXNmTGhjR0plb3l0SlhpMEhQVDdTZDhIdkR2dWF6Q2QyYVk3VG9HQm9XMXcvTFNGckhlNkRXblRCeDZiRUZIZU40eE8xN2ZQa0J4b3ZWVVlCVTNiL3o2SW1pSnU0WnJ3QjZWVzNYWDgwNVh2UEJFb05DV3pkYUQ0Rmg0NVozUXdvU09sVlhWUXQ1Zno2ZUlCYXhWOWhTUTVwZ1BzZHVzSTNVZmpxZUlKdzdBK0FyTjdvM1hVRzBoMERDYitSUnhCWXJ1ck5QTU5RenlWdndTcC9EaGFvTkZyWndLMVhUaWJ6RC9BR0hWS3U3UGxBMit3b3JtQXB0UHY2MzZzZkZtQ0RuZVNDSmFaY2FxdFJEckU3bTlCL2hHUXBTbytjUDhvV2wvOUJIS0h5YksrV1kwSm5HSXRRdWE1R1BYY2l2Zm5HbUNkKytDOFlvbnNpb1o5SWFCdXZlWlMwSnhHdkpTUXhSdE9ucHNkWEFUN2hVSXlTUmlvRGF3NW1WMkF2cTFsbUpBTmxPZzVLYUQyTUxIMmIzMEpucS9zVFllRGxzQW14bkZtUzRBNnJQWVY2bUdZV09ZZUpsUktUK1ZzT1NKU2pIclJiT25ObmdNZm5ndjlwaTlBaGFhZG0yOHlZdm5Wbk13VkRJUzZXWEswK3pyQmhQbWd4S2l0MkI0bXZxOThYb1JPZklwb2lEdnRhSVhKclNBMDFzcEFuWHJ0THg3Q0cydmZZTk9oREJPeWZKUE95WFVxTFVCdGQrSzl1UWJMUUlzd0p1NGl3Mkl3b3pwWU1kUnJBMnFEYStuTFhrWVlsNFQ0azgzTXNIT0V3dGNLMUFNTEtYeEVDT3dXQ1A4SGJOaGR1cVVhdUdzQUFBQUFTVVZPUks1Q1lJST0iLz48aW1hZ2Ugd2lkdGg9IjIxIiBoZWlnaHQ9IjM1IiBpZD0iaW1nMiIgaHJlZj0iZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFCVUFBQUFqQ0FZQUFBQjdORUVtQUFBRGQwbEVRVlJJUzcyV2EwZ1VVUlRIejUxWmRUVlJleGM5VkV6VG9nY21tTFpHUHRDMC9PQnJjMHRLS0F5RUlIVlhXM3RnaUEvR1hZMUNJei9rQndNcms4b0lJdXBEZnRCQ0loSXFDU0dwdERRS0VWKzVPL2QyWjNTMzFaMTFaMG1iVDdQM25QdmIvem5uM2pNSHdSSTh5QlZtUWw2MTczSWY5emhFY0N6alpxcTlYYTN2bDlxL0lEUzNyRWs1TVRhaTRna2ZEd2ppR1lCd2dnZ3JnQkJHMjF1TjJ2ZXlvQnE5SVpRM29Td01KQTR4T0pvUTVENTNJeEdRNEtaQVlTMVYybDVaMFBRU3JvTEJxTlRPbWNvRS9IZVZSWXB0ZDdpQ0Q3S2dHVVdHS3NTUWM4NXk3Vkw0YXEyeEVpT3NWM3E0d1pGRUZhVHNDd2VHbVVuOVdjTk5HQmorSmI0N2hXWVhWa2RqQlVvVW5BbG00Mmt4Vk1MNzBlUVlTSXVOdElvdU1EVEIxK0dmNG0rR29BWmcrQisyRWZtTitIR05qYWNuUkFucUVrNkxNYXFaSDdMbW9BclM0L1phbDIyVlNxV0hYd1pyNzVmcGhoY05LdFRSNUFnYXNuazk3QW9KRUlYc0NQS0hzS0NOVmxGUE90L0E2TmpFSEpFUFgzVER0TWtzcmpsVW1yby9BbzRmUHVDcytGYjd5Y3YxTURvK3VUQjBqdEpncWpSUXZ0SkJHbjZuNDV6TzNKcEZLWlJRTlFGbmVmNEpLdmVjMmg0cHFYUHFzWnFwYWRicHh1MjZsTzAxbFZRNlJHOFUzZVgwUnRtVzJpbFU3alg5LzlCWWVrMW5rK1JTUTFseXBiWk4ycTVMR1dtWEdwcnBVaTQxYVZ2by9PcGZ2TjRDdlo4R1JLZ1pteU1lR1BXdnBlNnozWkZTNnd5bDlQdFVJVGpQN3dPMXQ5cWhxK2VqeUNFWUZUS2ZpK3JOd1pVaHdMdUZzNFNvN25FbGVZTE5EcHBad3AwQmpLNEt4cWlkVzZFd0o5VXE1dG1ySHJqUjlsU3kyU0NDUmxzTldsOUpxRnJIcFdCQWp3VmphTUFHS00vWFdDRW1NdytYYUFyNnZueTNBeThJVFN1cldjT093NUJZRElhQkJuMGVyUEQxdGtKNEhrTjdSemQwdit1ajhHOUFacHNGaFk1VHBhS2o1RENSVWN4MVVTZnhPNUlVdFJ0T3BTVkloaXcwNTJQbnI0ZzJoTWhVSzFmczZSaXFOZVlnaEpzRkJ3WExRSGFTQ2c3RjdLSHY0bkJpZmN3OER4cDluZmliRGgyLzJ3eGFwVU1vWkdXeG1mNlJqd0NSWkF0aGxaOFBiTm0wRGxiU1ZIZ3BQY1JsVEdOdmUvN1NvblNhS2hVTkRtZXByUHg2Yit3NWVZME9Gcm1Tc2M5YnBPbmlhVTRWQzBJdGU5VGF1Z1FDZkNPZEJRSWR3YW10bnlXbzQyNk43b1FzNkN3SXBWNG9EL0NjOGc3Q3JDa01FYUxFUER1TVdSZ0VML0pXK05iYi9xRkw4Nm1jTkxpaVZDNVA5UHNEZ2pQS00xcmtXMUlBQUFBQVNVVk9SSzVDWUlJPSIvPjwvZGVmcz48c3R5bGU+LmF7ZmlsbDojZmZmO3N0cm9rZTojNTQ3NThiO3N0cm9rZS1taXRlcmxpbWl0OjEwO3N0cm9rZS13aWR0aDozfS5ie2ZpbGw6I2ZmZn08L3N0eWxlPjx1c2UgIGhyZWY9IiNpbWcxIiB0cmFuc2Zvcm09Im1hdHJpeCgtMSwwLDAsMSw1OCwwKSIvPjx1c2UgIGhyZWY9IiNpbWcyIiB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwxLDMsNikiLz48cGF0aCBjbGFzcz0iYSIgZD0ibTMwIDM2LjZoLTYuOXYtMTYuNWgtMi44di01aDIuOHYtMC44cTAtMi43IDEuMS01IDEuMS0yLjMgMy4yLTMuNCAyLjEtMS4xIDQuNi0xLjEgMS44IDAgMy42IDAuNGwtMC4zIDUuMnEtMS0wLjMtMi4yLTAuMy0xLjUgMC0yLjMgMS4xLTAuOSAxLTAuOSAyLjh2MS4xaDQuNHY1aC00LjN6Ii8+PHBhdGggY2xhc3M9ImIiIGQ9Im05IDExbDYuNy0xLjh2NS45aDQuOXY1aC00Ljl2Ny41cTAgMi4yIDAuNiAzIDAuNiAwLjkgMi4xIDAuOSAxLjMgMCAyLjEtMC4ydjUuMXEtMS42IDAuNy00LjUgMC43LTMuMSAwLTUuMS0xLjktMS45LTEuOC0xLjktNi41di04LjZoLTN2LTVoM3oiLz48cGF0aCBjbGFzcz0iYiIgZD0ibTMwIDM2LjZoLTYuOXYtMTYuNWgtMi44di01aDIuOHYtMC44cTAtMi43IDEuMS01IDEuMS0yLjMgMy4yLTMuNCAyLjEtMS4xIDQuNi0xLjEgMS44IDAgMy42IDAuNGwtMC4zIDUuMnEtMS0wLjMtMi4yLTAuMy0xLjUgMC0yLjMgMS4xLTAuOSAxLTAuOSAyLjh2MS4xaDQuNHY1aC00LjN6Ii8+PC9zdmc+">
        </a>
      </div>
      <div class="profile_badges_badge" data-tooltip-html="CSGO-Rep.com">
        <a href="https://csgo-rep.com/profile/{{steamid}}" target="_blank">
          <img class="badge_icon small" style="max-height: 40px; max-width: 40px;"
            src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI1LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgNjQgNjQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDY0IDY0OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6dXJsKCNTVkdJRF8xXyk7fQo8L3N0eWxlPgo8bGluZWFyR3JhZGllbnQgaWQ9IlNWR0lEXzFfIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjMyIiB5MT0iLTEuMjEzMyIgeDI9IjMyIiB5Mj0iNjIuNzI4NCIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDY2LjY3KSI+Cgk8c3RvcCBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMEExREQiLz4KCTxzdG9wIG9mZnNldD0iMC4yMiIgc3R5bGU9InN0b3AtY29sb3I6IzAwNTZBNCIvPgoJPHN0b3Agb2Zmc2V0PSIwLjQyIiBzdHlsZT0ic3RvcC1jb2xvcjojMDA1NkE0Ii8+Cgk8c3RvcCBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiM0MkExREEiLz4KPC9saW5lYXJHcmFkaWVudD4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTYzLjcsNS42Yy0wLjMtMS44LTEuMy0zLjQtMi44LTQuNUM1OS44LDAuNCw1OC41LDAsNTcuMiwwSDYuOEMzLjEsMCwwLDMuMSwwLDYuOXYyNS44bDAuNCwxMS4xICBjMCwzLjMsMi40LDYsNS42LDYuNWMwLjMsMCwwLjYsMCwwLjgsMEgxNWwtMS4yLDExLjJjLTAuMSwxLjMsMC44LDIuNCwyLjEsMi41YzAuNiwwLjEsMS4zLTAuMSwxLjctMC42bDE0LjYtMTMuMWgyNS4xICBjMy44LDAsNi44LTMuMSw2LjgtNi45di0zNEM2NCw4LjIsNjMuOSw2LjksNjMuNyw1LjZ6IE00OS4zLDI4LjVsLTQuMy00LjNsLTIwLjIsMjBMOS44LDI4LjdsNS45LTUuN2w5LjMsOS42bDE0LjMtMTQuMWwtNC4zLTQuMyAgbDE5LjMtNS41TDQ5LjMsMjguNXoiLz4KPC9zdmc+">
        </a>
      </div>
      <div style="clear: left;"></div>
    </div>
  </div>
  `
  const raw = TemplateUtils.render(template, { steamid })
  return HTMLUtils.parse(raw)
}

function RenderSteamIDPanel (steamid) {
  const template = `
  <div class="profile_count_link_preview_ctn">
    <div class="profile_count_link ellipsis">
        <span class="count_link_label">SteamID:</span> <span class="count_link_label">{{steamid}}</span>
    </div>
  </div>
  `
  const raw = TemplateUtils.render(template, { steamid })
  return HTMLUtils.parse(raw)
}

// Main
(function () {
  const steamid = GetSteamID()
  if (!steamid) {
    console.warn('Unable to determine SteamID.')
    return
  }

  const playerStatusPanel = GetPlayerStatusPanel()
  if (playerStatusPanel) {
    playerStatusPanel.after(RenderReputationPanel(steamid))
    playerStatusPanel.after(RenderSteamIDPanel(steamid))
  }
})()
