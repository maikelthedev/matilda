const puppeteer = require('puppeteer')
const fs = require('fs')
require('dotenv').config()
const { USERNAME, PASS, ME } = process.env

export class Matilda {
  async getBrowser () {
    this.browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium',
      slowMo: 10,
      headless: false,
      defaultViewPort: {
        width: 1024,
        height: 768
      }
    })
    this.page = await this.browser.newPage()
    return this
  }

  async logIn () {
    await this.page.goto(
      'https://www.linkedin.com/uas/login?fromSignIn=true&trk=uno-reg-join-sign-in'
    )
    await this.page.click('#username')
    await this.page.keyboard.type(USERNAME)
    await this.page.click('#password')
    await this.page.keyboard.type(PASS)
    await this.page.click(
      '#app__container > main > div > form > div.login__form_action_container > button'
    )
    await this.page.waitForNavigation()
    return this
  }

  async accessMessages () {
    await this.page.click('#messaging-tab-icon')
    await this.page.waitForNavigation()
    return this
  }

  async getListOfMessagesSelector () {
    this.messagesListSelector = await this.page.evaluate(() => {
      const result = document.querySelectorAll('ul')
      return '#' + result[4].attributes.id.nodeValue
    })
    return this
  }

  async scrollToGetAll () {
    const times = 4 // Seems reasonable
    let i = 0
    while (i < times) {
      await this.page.evaluate(sel => {
        const result = document.querySelector(sel)
        result.scrollBy(0, 100000)
      }, this.messagesListSelector)
      i = i + 1
      await this.page.waitFor(1000)
    }
    return this
  }

  async getSelectorsConvo () {
    this.selectorsConvo = await this.page.evaluate(sel => {
      let result = []
      document.querySelector(sel).childNodes.forEach(each => {
        if (each.attributes && each.attributes.id) {
          result.push(each.attributes.id.nodeValue)
        }
      })
      return result
    }, this.messagesListSelector)
    return this
  }

  async getConvoURLs () {
    this.convoURLs = await this.page.evaluate(sel => {
      const results = []
      for (let select of sel) {
        if (document.querySelector('#' + select + ' > a')) {
          const result = document.querySelector('#' + select + ' > a')
            .attributes.href.nodeValue
          results.push('https://www.linkedin.com' + result)
        }
      }
      return results
    }, this.selectorsConvo)
  }

  async getConvosText () {
    this.convos = []
    for (const url of this.convoURLs) {
      await this.page.goto(url)
      await this.page.waitForSelector('.msg-s-message-list-content')
      let result = await this.page.evaluate(() => {
        return document.querySelector('.msg-s-message-list-content').innerText
      })
      this.convos.push({ url: url, result: result })
    }
    return this
  }

  async deleteOldFile (file = 'raw_convos.json') {
    await fs.unlink(file, err => {
      if (err && err.code !== 'ENOENT') {
        throw err
      }
    })
    return this
  }

  saveToFile (file = 'raw_convos.json') {
    fs.writeFileSync(file, JSON.stringify(this.convos))
  }

  loadConvos (file = 'raw_convos.json') {
    this.convos = JSON.parse(fs.readFileSync(file))
  }

  async closeBrowser () {
    await this.browser.close()
  }

  findWho () {
    for (const convo of this.convos) {
      convo['name'] = convo.result.split('profile')[1].split('\n')[1]
      convo['messages'] = convo.result.split('\n')
      delete convo['result']
    }
    return this
  }

  discardIStarted () {
    this.convos = this.convos.filter(convo => convo.name !== ME)
  }

  clean () {
    for (const convo of this.convos) {
      convo.messages = convo.messages.filter(message =>
        !message.includes('View ') &&
        !message.includes('sent the following ') &&
        message !== ME &&
        message !== convo.name &&
        message !== ''
      )
    }
    return this
  }

  saveReformatted () {
    this.saveToFile('reformatted_convos.json')
  }

  loadReformatted () {
    this.loadConvos('reformatted_convos.json')
  }

  loadCanned () {
    this.canned = JSON.parse(fs.readFileSync('canned.json'))
  }

  findCannedResponse () {
    for (const convo of this.convos) {
      convo['sent'] = []
      for (const canned of this.canned) {
        const firstMessage = canned.responses[0]
        if (convo.messages.includes(firstMessage)) {
          convo.sent.push(canned.name)
        }
      }
    }
    return this
  }
  prepareResponse () {
    for (let convo of this.convos) {
      const canned = this.canned.find(resp => !convo.sent.includes(resp.name))
      convo.response = canned.responses
    }
    return this
  }

  async respond () {
    for (const convo of this.convos) {
      if (convo.response && convo.response.length > 0) {
        await this.page.goto(convo.url)
        await this.page.click('.msg-form__contenteditable')
        for (const line of convo.response) {
          await this.page.keyboard.type(line)
          await this.page.keyboard.press('Enter')
        }
        await this.page.click('.msg-form__send-button')
        await this.page.waitFor(1000)
      }
    }
  }

  async archiveAll () {
    await this.accessMessages()
    await this.page.waitFor(2000)
    let all = await this.page.evaluate(() => {
      const giveBak = []
      const results = document.querySelectorAll('div.msg-conversation-card__content > div:nth-child(1) > div > button.msg-conversation-card__list-action.msg-conversation-card__list-action--right.msg-conversation-card__archive')
      for (const result of results) {
        giveBak.push('#' + result.offsetParent.id)
      }
      return giveBak
    })
    for (let a = 0; a < all.length; a++) {
      await this.page.click(all[a] + ' > div.msg-conversation-card__content > div:nth-child(1) > div > button.msg-conversation-card__list-action.msg-conversation-card__list-action--right.msg-conversation-card__archive')
    }
  }
}
