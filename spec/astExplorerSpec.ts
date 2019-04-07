import { ansi, Driver } from 'cli-driver'
import { cp, mkdir, rm } from 'shelljs'
import { Helper } from './interactionHelper'

describe('astExplorerSpec', () => {
  let client: Driver
  let helper: Helper
  beforeAll(async done => {
    client = new Driver()
    helper = new Helper(client)
    await client.start({
      notSilent: true
    })
    done()
  })
  afterAll(async done => {
    await client.destroy().catch()
    helper = null as any
    done()
  })

  it('should run simple test basic usage path', async done => {
    const data = await client.enterAndWaitForData(
      'npx ts-node spec/astExplorer/test1.ts',
      'Animal'
    )
    done()
  })
})
