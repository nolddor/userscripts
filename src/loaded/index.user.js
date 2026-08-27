// ==UserScript==
// @name         Loaded.com Order Backup
// @icon         https://cdn.loaded.com/media/favicon/default/loaded_fav.png
// @namespace    nolddor
// @version      1.0
// @description  Backup order details to clipboard
// @author       Jack Nolddor
// @match        https://www.loaded.com/es_es/downloadable/download/link/id/*
// @match        https://www.loaded.com/downloadable/download/link/id/*
// @grant        none
// @updateURL     https://raw.githubusercontent.com/nolddor/userscripts/main/src/loaded/index.user.js
// @downloadURL   https://raw.githubusercontent.com/nolddor/userscripts/main/src/loaded/index.user.js
// ==/UserScript==

(function () {
  'use strict'

  const getGameData = (item, orderNum) => {
    const cells = item.querySelectorAll('table td')
    const details = {}

    for (let i = 0; i < cells.length; i += 2) {
      const label = cells[i]?.textContent.trim().replace(':', '')
      if (label) {
        details[label] = cells[i + 1]?.textContent.trim()
      }
    }

    const codes = []

    item.querySelectorAll('.key-group span').forEach(s => {
      const t = s.textContent.trim()
      if (/^[A-Z0-9-]+$/.test(t)) {
        codes.push(t)
      }
    })

    if (!codes.length) {
      const imgs = item.querySelectorAll('.key-group img').length
      codes.push(imgs ? '[Image CDKey]' : '[Unavailable]')
    }

    return {
      orderNum,
      product: item.querySelector('.order-history_image p')?.textContent.trim(),
      date: details['Date Ordered'] || '',
      payment: details['Payment'] || '',
      platform: details['Platform'] || '',
      region: details['Region'] || '',
      qty: details['Qty'] || '',
      codes: codes.join('\n - ')
    }
  }

  const notify = (msg, err) => {
    const bgColor = err ? '#d4d4d4' : '#e8e8e8'
    const n = document.createElement('div')

    n.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${bgColor};
            color: #333;
            border-radius: 5px;
            z-index: 10000;
            font-weight: bold;
            animation: slideIn 0.3s;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15)
        `

    n.textContent = msg
    document.body.appendChild(n)

    setTimeout(() => {
      n.style.animation = 'slideOut 0.3s'
      setTimeout(() => n.remove(), 300)
    }, 3000)
  };

  (document.readyState === 'loading' ? document : window).addEventListener(
    document.readyState === 'loading' ? 'DOMContentLoaded' : 'load',
    () => {
      const orderNum = document.querySelector('[data-ui-id="page-title-wrapper"]')
        ?.textContent.replace('Order # ', '')
        .trim()
      const items = document.querySelectorAll('[class*="order-history_item_"]')

      items.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]')
        if (checkbox) {
          checkbox.checked = true
          checkbox.dispatchEvent(new Event('change', { bubbles: true }))
          checkbox.dispatchEvent(new Event('input', { bubbles: true }))
        }

        setTimeout(() => {
          const getCodeBtn = item.querySelector('button.toggle-more')
          if (getCodeBtn) {
            getCodeBtn.click()
          }
        }, 500)

        const showBtn = item.querySelector('.show-instructions')
        if (!showBtn) return

        const btn = document.createElement('button')
        btn.textContent = 'COPY ORDER DETAILS'
        btn.className = 'btn btn-primary w-full uppercase justify-center gap-2'
        btn.style.cssText = `
                    background-color: #007bff !important;
                    border-color: #007bff !important;
                `

        btn.onmouseover = () => { btn.style.backgroundColor = '#0056b3' }
        btn.onmouseout = () => { btn.style.backgroundColor = '#007bff' }

        btn.onclick = () => {
          const block = item.querySelector('.key-group')
          const hasText = block?.querySelector('span')?.textContent.trim()
          const hasImg = block?.querySelector('img')

          if (!hasText && !hasImg) {
            notify('Click `GET CODE` first for this game', 1)
            return
          }

          const game = getGameData(item, orderNum)
          let md = '```\n'

          md += `Order #${game.orderNum} - ${game.date}\n`
          md += '------------------------------------\n'
          md += `Title: ${game.product}\n`
          md += `Platform: ${game.platform}\n`
          md += `Region: ${game.region}\n`
          md += `Qty: ${game.qty}\n`
          md += '\n'
          md += 'Your game code is:\n'
          md += ` - ${game.codes}\n`
          md += '```'

          navigator.clipboard.writeText(md).then(() => {
            notify('Order details copied!')
          }).catch(() => {
            notify('Copy failed', 1)
          })
        }

        showBtn.replaceWith(btn)
      })
    }
  )

  const s = document.createElement('style')
  s.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `
  document.head.appendChild(s)
})()
