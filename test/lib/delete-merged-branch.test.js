const deleteMergedBranch = require('../../lib/delete-merged-branch')
const payload = require('../fixtures/pull-request.closed')

describe('deleteMergedBranch function', () => {
  let context
  let deleteRef
  let owner
  let ref
  let repo

  beforeEach(() => {
    deleteRef = jest.fn().mockReturnValue(Promise.resolve())
    context = {
      log: {
        info: jest.fn(),
        warn: jest.fn()
      },
      event: {
        event: 'pull_request.closed'
      },
      payload: JSON.parse(JSON.stringify(payload)), // Njeh...
      github: {
        gitdata: {
          deleteRef
        }
      }
    }
    owner = payload.repository.owner.login
    ref = payload.pull_request.head.ref
    repo = payload.repository.name
  })

  describe('branch is merged from fork', () => {
    beforeEach(async () => {
      context.payload.pull_request.base.repo.id = 200
      context.payload.pull_request.head.repo.id = 100
      context.payload.pull_request.head.label = 'foo:bar'
      await deleteMergedBranch(context)
    })

    it('should log it didn\'t delete the branch', () => {
      expect(context.log.info).toBeCalledWith(`Closing PR from fork. Keeping ${context.payload.pull_request.head.label}`)
    })

    it('should NOT call the deleteRef method', () => {
      expect(context.github.gitdata.deleteRef).not.toHaveBeenCalled()
    })
  })

  describe('branch is merged', async () => {
    beforeEach(async () => {
      context.payload.pull_request.merged = true
      await deleteMergedBranch(context)
    })

    it('should call the deleteRef method', () => {
      expect(context.github.gitdata.deleteRef).toHaveBeenCalledWith({
        owner,
        ref: `heads/${ref}`,
        repo
      })
    })

    it('should log the delete', () => {
      expect(context.log.info).toBeCalledWith(`Successfully deleted ${owner}/${repo}/heads/${ref}`)
    })

    describe('deleteRef call fails', () => {
      beforeEach(async () => {
        context.github.gitdata.deleteRef = jest.fn().mockReturnValue(Promise.reject(new Error()))
        await deleteMergedBranch(context)
      })

      it('should log the error', () => {
        expect(context.log.warn).toBeCalledWith(expect.any(Error), `Failed to delete ${owner}/${repo}/heads/${ref}`)
      })
    })
  })

  describe('branch is NOT merged', () => {
    beforeEach(async () => {
      context.payload.pull_request.merged = false
      await deleteMergedBranch(context)
    })

    it('should log it didn\'t delete the branch', () => {
      expect(context.log.info).toBeCalledWith(`PR was closed but not merged. Keeping ${owner}/${repo}/heads/${ref}`)
    })

    it('should NOT call the deleteRef method', () => {
      expect(context.github.gitdata.deleteRef).not.toHaveBeenCalled()
    })
  })
})
