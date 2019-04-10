
import * as blessed from 'blessed';

export function isBlessedElement(n: any): n is blessed.Widgets.BlessedElement {
  return n && n.screenshot && n.enableDrag;
}

function updateNodeLines(node: blessed.Widgets.BlessedElement, fn: (l: string) => string) {
  node.getLines().forEach((l, i) => {
    node.setLine(i, fn(l));
  });
  node.children.forEach(c => {
    if (isBlessedElement(c)) {
      updateNodeLines(c, fn);
    }
  });
}
function visitDescendantNodes(node: blessed.Widgets.BlessedElement, fn: (l: blessed.Widgets.Node) => boolean) {
  let stop : boolean = false
  node.children.forEach(c => {
    if(stop){
      return
    }
    if(fn(c)){
      stop=true
      return
     }
    if (isBlessedElement(c)) {
      visitDescendantNodes(c, fn);
    }
  });
}
export function visitDescendantElements(node: blessed.Widgets.BlessedElement, fn: (l: blessed.Widgets.BlessedElement) => boolean) {
  return visitDescendantNodes(node, n=>isBlessedElement(n) ? fn(n) : false)
}
export function findDescendantNode(node:blessed.Widgets.BlessedElement, fn: (l: blessed.Widgets.Node) => boolean ) {
  var found: blessed.Widgets.Node|undefined
  visitDescendantNodes(node, c=>{
if(fn(c)){
  found = c
  return true
}
return false
  })
  return found
}

export function isFocused(screen: blessed.Widgets.Screen, el: blessed.Widgets.BlessedElement) {
  return el === screen.focused || el.hasDescendant(screen.focused)
}