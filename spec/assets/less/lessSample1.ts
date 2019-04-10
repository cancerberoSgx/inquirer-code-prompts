import { less, Less } from '../../../src'
import { registerPrompt } from 'inquirer'
import { longText } from './text';

async function test() {
  registerPrompt('less', Less as any)
  // no result , just await until user press other key than arrows:
  await less({ text: longText() })
}
test()

