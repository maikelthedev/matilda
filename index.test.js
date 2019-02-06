import { LinkedinMessages } from './index'
import { expect } from 'chai'

describe.skip('Read some data and save it locally', () => {
  let instance
  it('Create an instance', async () => {
    instance = new LinkedinMessages()
    instance = await instance.getBrowser()
    expect(instance.page._target._targetInfo.title).equals('about:blank')
  })
  it('Should log into the account', async () => {
    await instance.logIn()
    expect(instance.page._target._targetInfo.title).equals('LinkedIn')
  })
  it('Access messages', async () => {
    await instance.accessMessages()
    expect(instance.page._target._targetInfo.title).equals('LinkedIn')
  })
  it('getListOfMessagesSelector()', async () => {
    await instance.getListOfMessagesSelector()
    const test = instance.messagesListSelector.slice(0, 6)
    expect(test).equals('#ember')
  })
  it('scrollToGetAll()', async () => {
    await instance.scrollToGetAll()
    // Maybe test you've scrolled the maximum width of that element.
  })
  it('getSelectorsConvo()', async () => {
    await instance.getSelectorsConvo()
    for (let selector of instance.selectorsConvo) {
      expect(selector.slice(0, 5)).equals('ember')
    }
  })
  it('getConvoURLs()', async () => {
    await instance.getConvoURLs()
    for (const url of instance.convoURLs) {
      expect(url.slice(0, 42)).equals(
        'https://www.linkedin.com/messaging/thread/'
      )
    }
  })

  it('getConvosText()', async () => {
    await instance.getConvosText()
    expect(instance.convos.length > 0)
  }).timeout(10000000)

  it('Should find out who sent the message', () => {
    instance = new LinkedinMessages()
    instance.loadConvos('convos.json')
    instance.findWho()
    console.log(instance)
    for (let convo of instance.convos) {
      // This is a shitty test
      expect(convo.name !== 'Maikel Frias')
    }
  })
  it('Reformat responses', () => {
    instance.reformat()
    // TODO: Write a test for this.
  })
  it('Save them', async () => {
    await instance.saveToFile('./fixtures/refEnd.json')
    // Write some test later
  })
})

describe('Respond', () => {
  let instance
  it('Should read the pending respond conversations from a DB or file', () => {
    instance = new LinkedinMessages()
    instance.loadConvos()
    const testResponded = instance.convos.filter(
      convo => convo.responded === false
    )
    expect(testResponded[0].name).equal('samer fawaz')
  })
  it('Should prepare a response for recruiters with no thank you', () => {
    instance.recruiters()
  })

  it.skip('Should respond and mark the conversation as answered', async () => {
    await instance.getBrowser()
    await instance.logIn()
    await instance.respond()
  })
  it('Should now archive all the conversations', async () => {
    await instance.archiveAll()
  })
  it('Should save the amended file', () => {
    instance.saveToFile()
  })
})

describe.skip('Stage 4: Repeat', () => {
  it('Should repeat the entire process according to a schedule')
  it('Should allow to change that schedule')
  it('Should keep logs of the conversations as leads')
})
