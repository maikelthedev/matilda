const puppeteer = require('puppeteer')
const fs = require('fs')
require('dotenv').config()
const { USERNAME, PASS, ME } = process.env

export class LinkedinMessages {
  async getBrowser () {
    const puppet = await puppeteer.launch({
      executablePath: '/usr/bin/chromium',
      slowMo: 10,
      headless: false
    })
    this.page = await puppet.newPage()
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
    const times = 4
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

  async deleteOldFile () {
    fs.unlink('convos.json', err => {
      if (err && err.code !== 'ENOENT') {
        throw err
      }
    })
    return this
  }

  async saveToFile () {
    await fs.writeFile('convos.json', JSON.stringify(this.convos), function (
      err
    ) {
      if (err) throw err
    })
    delete this.page
    delete this.convos
    delete this.convoURLs
    delete this.messagesListSelector
    delete this.selectorsConvo
    return this
  }

  loadConvos (file = 'convos.json') {
    this.convos = JSON.parse(fs.readFileSync(file))
  }

  findWho () {
    const change = []
    for (const convo of this.convos) {
      const name = convo.result.split('profile')[1].split('\n')[1]
      // Because I'm not interested in conversations that I started
      if (name !== 'Maikel Frias') {
        let messages = convo.result.split('\n')
        const isRecruiter = messages.includes('Recruiter')
        messages = messages.filter(message => !message.includes('Recruiter'))

        change.push({
          name: name,
          recruiter: isRecruiter,
          url: convo.url,
          messages: messages
        })
      }
    }
    this.convos = change
    return this
  }

  reformat () {
    // TODO: Make it in a format that is actually usable or saveble in Mongo/GraphQL
    for (const convo of this.convos) {
      let messages = convo.messages
      messages = messages.filter(message => message !== '')
      messages = messages.filter(message => !message.includes('View '))
      messages = messages.filter(
        message => !message.includes('sent the following ')
      )
      messages = messages.filter(message => message !== ME)
      messages = messages.filter(message => message !== convo.name)
      convo.messages = messages
    }
    return this
  }

  recruiters () {
    for (const person of this.convos) {
      if (person.recruiter === true) {
        person['response'] = [
          `Dear ${person.name}, thank you for taking your time contacting me.`,
          'Unfortunately I am only accepting messages direct from employers, not recruiters.',
          'Have a nice day.',
          '',
          'Sent with LinkedInBot created by Maikel,',
          'available in https://github.com/maikeldotuk/linkedinBot'
        ]
      }
    }
  }
  async respond () {
    for (const convo of this.convos) {
      if (convo.response && convo.responded === false) {
        await this.page.goto(convo.url)
        await this.page.click('.msg-form__contenteditable')
        for (const line of convo.response) {
          await this.page.keyboard.type(line)
          await this.page.keyboard.press('Enter')
        }
        await this.page.click('.msg-form__send-button')
        convo['responded'] = true
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

