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

describe.skip('Stage 2: Process and save conversations', () => {
  let instance
  it('loadConvos()',  () => {
    instance = new LinkedinMessages()
    instance.loadConvos()
    expect(instance.convos.length > 0)
  })

  it('Should find out who sent the message', () => {
    instance.findWho()
    for (let convo of instance.convos) {
      // This is a shitty test
      expect(convo.name !== 'Maikel Frias')
    }
  })
  it('Reformat responses', () => {
    instance.reformat()
    // TODO: Write a test for this.
  })
  describe('Should save only the reformatted responses that do not exist already', () => {
    // What does exist already mean?
    // Do not use a database until you have a clear idea of the data model.
    it('Should read the previous conversations', () => {
      instance.readConvos()
      expect(instance.prevConvos.length >1)
    })
    it('Should mark those that are new or the author has responded', () => {
      instance.markNew()
      const testNewLength = instance.convos.filter(convo => convo.new).length
      const testResponded = instance.convos.filter(convo => convo.responded)
      const testRespondedLength = testResponded.length
      expect(testResponded[0].name).equal('Jack Sims')
      expect(testNewLength).equal(4)
      expect(testRespondedLength).equal(1)
    })
    it('Should save the modified file', () => {
      // TODO: You'll need to add crap to this file, real convos are no good
      instance.saveConvos('./fixtures/refEnd.json')
      // Test this.
    })
  })

})

describe('Stage 3: Respond', () => {
  let instance
  it('Should read the pending respond conversations from a DB or file', () => {
    instance = new LinkedinMessages()
    instance.readConvos('./fixtures/refEnd.json')
    const testNewLength = instance.convos.filter(convo => convo.new).length
    const testResponded = instance.convos.filter(convo => convo.responded)
    const testRespondedLength = testResponded.length
    expect(testResponded[0].name).equal('Jack Sims')
    expect(testNewLength).equal(4)
    expect(testRespondedLength).equal(1)
  })
  it('Should match a canned response depending of a pattern that the message includes', () => {
    // This is where the fun starts. 
  })
  it('Should respond, then archive the conversation')
  it('Should mark as hasResponded to the conversation')
  it('Should mark as newResponse if the recruiter has responsed again')
  it('Should repeat the process with all the possible canned responses, never manual')
  it('Should serve a control panel for canned responses')
})

describe('Stage 4: Repeat', () => {
  it('Should repeat the entire process according to a schedule')
  it('Should allow to change that schedule')
  it('Should keep logs of the conversations as leads')
})
