import { Matilda } from './index'
import { expect } from 'chai'
require('dotenv').config()
const { ME } = process.env

describe.skip('Read the non-archived messages and save them locally', () => {
  let instance
  process.stdout.write('\u001b[2J\u001b[0;0H') // I hate dirty screens
  it('Create and attach a browser instance', async () => {
    instance = new Matilda()
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
    // TODO: Write a test
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

  it('deleteOldFile()', async () => {
    await instance.deleteOldFile()
    // TODO: Write a test
  })

  it('saveToFile()', async () => {
    await instance.saveToFile()
    // TODO: Write a test
  })

  it('closeBrowser()', async () => {
    await instance.closeBrowser()
    // TODO: Write a test
  })
})

describe.skip('Clean up the conversations downloaded', () => {
  let instance

  before('Create matilda', () => {
    instance = new Matilda()
  })

  it('Should load the conversations', () => {
    instance.loadConvos()
    expect(Object.keys(instance).includes('convos'))
    expect(instance.convos.length > 0)
  })

  it('Should find out who sent the message', () => {
    instance.findWho()
    for (let convo of instance.convos) {
      expect(Object.keys(convo).includes('name'))
      expect(convo.name !== '')
    }
  })

  it('Should discard the conversations that I started', () => {
    instance.discardIStarted()
    for (const convo of instance.convos) {
      expect(convo.name !== ME)
    }
  })

  it('Clean the conversation', () => {
    instance.clean()
    for (const convo of instance.convos) {
      for (const message of convo.messages) {
        expect(message !== '')
      }
    }
  })

  it('Save them', () => {
    instance.saveReformatted()
    // TODO: Write a test
  })
})

describe('Respond', () => {
  let instance
  it('Should read the pending respond conversations from a DB or file', () => {
    instance = new Matilda()
    instance.loadReformatted()
    expect(Object.keys(instance).includes('convos'))
    expect(instance.convos.length > 0)
  })

  it('Should load the list of canned responses', () => {
    instance.loadCanned()
    expect(instance.canned !== null)
  })

  it('Should check whether the canned response has been used', () => {
    instance.findCannedResponse()
    // TODO: Write a test
  })

  it('Should take the first not used canned response and add it', () => {
    instance.prepareResponse()
    // TODO: Write a test.
  })
  it('Should respond', async () => {
    await instance.getBrowser()
    await instance.logIn()
    await instance.respond()
    // TODO: Write a test
  })
  it('Should now archive all the conversations', async () => {
    await instance.archiveAll()
    // TODO: Write a test
  })
  
  it('Should now delete the files', () => {
  })


})
