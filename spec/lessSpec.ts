import { Driver } from 'cli-driver'
import { Helper } from './interactionHelper'

describe('less', () => {
  let client: Driver
  let helper: Helper

  beforeAll(async done => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
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

  it('should let scroll long text', async done => {
    const data1 = await client.enterAndWaitForData(
      'npx ts-node spec/assets/less/lessSample1.ts',
      'Adapted from inquirer sources'
    )
    // const data1 = await client.getAllData()
    // expect().not.toContain('Move the pointer only when the user')
    await helper.down(10)

    await client.write('')
    const data2 = await client.getDataFromLastWrite()
    expect(data1).not.toEqual(data2)
    await client.enter('')
    await helper.expectLastExitCode(true)
    done()
  })
})
