import { astExplorer, AstExplorer } from '../../src/astExplorer/astExplorer'
import { registerPrompt } from 'inquirer'

registerPrompt('ast-explorer', AstExplorer as any)

async function test() {
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
}
    `
  const selectedNode = await astExplorer({ code })
  console.log({ selectedNode: selectedNode.getText() });
}
test()