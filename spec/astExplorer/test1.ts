import { AstExplorer } from '../../src/astExplorer/astExplorer'
import { astExplorer } from "../../src/astExplorer/index";
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
  const {selectedNodes} = await astExplorer({ code })
  if(selectedNodes.length){
    const node = selectedNodes[0]
    console.log(node.getText());
    
  }
  // console.log(selectedNodes.length ? selectedNodes[0] : 'no selected nodes');
}
test()