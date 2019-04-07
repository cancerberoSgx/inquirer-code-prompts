import { prompt } from 'inquirer';
import { Options, ResultValue } from './types';
/**
 * Ast explorer, user can see code, filter entering tsquery selectors and navigate thgouh matched nodes with arrow keys. finally select a node with enter. Usage:
```
import {astExplorer, AstExplorer} from './astExplorer'
import {registerPrompt} from 'inquirer'
import { tsquery } from '@phenomnomnominal/tsquery';
async function test(){
registerPrompt('ast-explorer', AstExplorer as any)
  const code = `
class Animal {
  constructor(public name: string) { }
  move(distanceInMeters: number = 0) {
    console.log('hello');
  }
}
class Snake extends Animal {
  constructor(name: string) { super(name); }
  move(distanceInMeters = 5) {
    console.log("Slithering...");
    super.move(distanceInMeters);
  }
}    `
const selectedNode= await astExplorer({code})
console.log({selectedNode: selectedNode.getText()});
 })```
 * TODO: move to its own project
 * TODO: pass directly all the options to the prompt - remove this function
 */
export async function astExplorer(options: Options): Promise<ResultValue> {
  // registerPrompt('ast-explorer', AstExplorer as any)
  const rows = process.stdout.rows || 24
  const choices = options.code.split('\n')
  const result = await prompt<{
    ' ': ResultValue
  }>([
    {
      type: 'ast-explorer',
      name: ' ',
      choices,
      paginated: true,
      pageSize: options.pageSize || Math.min(options.pageSize || Infinity, rows)
    }
  ])
  return result[' ']
}
