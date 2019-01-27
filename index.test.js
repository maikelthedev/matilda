import {LinkedinMessages} from './index'
import {expect} from 'chai'

describe.skip('Stage 1: Read some data and save it locally', () => {
  let instance
  it('Create an instance', async () => {
      instance = new LinkedinMessages();
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
    const test = instance.messagesListSelector.slice(0,6)
    expect(test).equals('#ember')
  })
  it('scrollToGetAll()', async () => {
    await instance.scrollToGetAll()
    // Maybe test you've scrolled the maximum width of that element.
  })
  it('getSelectorsConvo()', async () => {
      await instance.getSelectorsConvo()
      for (let selector of instance.selectorsConvo) {
        expect(selector.slice(0,5)).equals('ember')
      }
  })
  it('getConvoURLs()', async () => {
      await instance.getConvoURLs()
      for (const url of instance.convoURLs) {
       expect(url.slice(0,42)).equals('https://www.linkedin.com/messaging/thread/')
      }
  })

  it('getConvosText()', async () => {
      await instance.getConvosText()
      expect(instance.convos.length > 0)
  }).timeout(10000000)

  it('deleteOldFile()', async () => {
    await instance.deleteOldFile()
    // Write some test later
  })

  it('Save it', async () => {
    await instance.saveToFile()
    // Write some test later
  })
})

describe('Stage 2: Process the responses', () => {
  let instance
  it('loadConvos()',  () => {
    instance = new LinkedinMessages()
    instance.loadConvos()
    expect(instance.convos.length > 0)
  })
  it('Reformat responses', () => {
    instance.reformat()
    //console.log(instance)
  })
})
