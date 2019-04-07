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
    let data = await client.enterAndWaitForData(
      'npx ts-node spec/astExplorer/test1.ts',
      'Animal'
    )
    data = await client.enterAndWaitForData('', 'selectedNode')
    expect(client.getStrippedDataFromLastWrite()).toContain(`{ selectedNode: 'Animal' }`)
    await helper.expectLastExitCode(true)

    data = await client.enterAndWaitForData(
      'npx ts-node spec/astExplorer/test1.ts',
      'Animal'
    )
      await client.writeAndWaitForData(ansi.cursor.down(2), 'class')
      data = await client.enterAndWaitForData('', 'selectedNode')
      expect(client.getStrippedDataFromLastWrite()).toContain(`{ selectedNode: 'name' }`)
    await helper.expectLastExitCode(true)
    done()
  })
})
