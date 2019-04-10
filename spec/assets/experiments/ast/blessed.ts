
import * as blessed from 'blessed';

function isBlessedElement(n: any): n is blessed.Widgets.BlessedElement {
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
function updateDescendantNodes(node: blessed.Widgets.BlessedElement, fn: (l: blessed.Widgets.Node) => string) {
  node.children.forEach(c => {
    fn(c);
    if (isBlessedElement(c)) {
      updateDescendantNodes(c, fn);
    }
  });
}
export function updateDescendantElements(node: blessed.Widgets.BlessedElement, fn: (l: blessed.Widgets.BlessedElement) => void) {
  node.children.forEach(c => {
    if (isBlessedElement(c)) {
      fn(c);
      updateDescendantElements(c, fn);
    }
  });
}
