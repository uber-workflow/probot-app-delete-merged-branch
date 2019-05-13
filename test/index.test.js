const fs = require('fs')
const path = require('path')
const { Probot } = require('probot')
const plugin = require('../index')
const deleteMergedBranch = require('../lib/delete-merged-branch')
const payload = require('./fixtures/pull-request.closed')

const MOCK_CERT_PATH = path.resolve(__dirname, 'fixtures/mock-cert.pem')
// mock cert copied from copied from:
// https://github.com/probot/create-probot-app/blob/de9078d/templates/basic-js/test/fixtures/mock-cert.pem
const MOCK_CERT = fs.readFileSync(MOCK_CERT_PATH, 'utf-8')

jest.mock('../lib/delete-merged-branch', () => jest.fn())

describe('Auto-delete-merged-branch ProBot Application', () => {
  let app

  beforeEach(() => {
    app = new Probot({
      id: 123,
      cert: MOCK_CERT
    })

    app.load(plugin)
  })

  describe('Delete branch functionality', () => {
    describe('It does not receive the `pull_request.closed` event', () => {
      beforeEach(async () => {
        const event = 'pull_request.open'
        await app.receive({ name: event, payload })
      })

      it('should NOT call the deleteRef method', () => {
        expect(deleteMergedBranch).not.toHaveBeenCalled()
      })
    })

    describe('It receives the `pull_request.closed` event', () => {
      beforeEach(async () => {
        const event = 'pull_request.closed'
        await app.receive({ name: event, payload })
      })

      it('should call the deleteRef method', () => {
        expect(deleteMergedBranch).toHaveBeenCalled()
      })
    })
  })
})
