
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




let lastFocus = 0;
export function installFocusHandler(f: blessed.Widgets.BlessedElement[] ,  screen: blessed.Widgets.Screen, focusStyle: { border: { type: string; fg: string; }; }) {  
  screen.key(['tab'], function (ch, key) {
    try {
      if (screen.focused) {
        [f[lastFocus], f[lastFocus].parent, ...f[lastFocus].children || []].filter(isBlessedElement).forEach(c => {
          c.style = { ...c.style || {}, border: {} };
        });
      }
      lastFocus = lastFocus >= f.length - 1 ? 0 : lastFocus + 1;
      f[lastFocus].focus();
      [f[lastFocus], f[lastFocus].parent, ...f[lastFocus].children || []].filter(isBlessedElement).forEach(c => {
        c.style = { ...c.style || {}, ...focusStyle };
      });
      f[lastFocus].key;
      screen.render();
    }
    catch (error) {
      console.log(error);
      throw error;
    }
  });
  f[0].focus(); 
  [f[0], f[0].parent, ...f[0].children || []].filter(isBlessedElement).forEach(c => {
      c.style = { ...c.style || {}, ...focusStyle }
    })
}








export function alert(screen: blessed.Widgets.Screen,s: string) {
  if (!p) {
    p = blessed.prompt({
      mouse: true,
      parent: screen,
      top: 'center',
      left: 'center',
      height: 'shrink',
      width: 'shrink',
      keys: true,
      vi: true,
      tags: true,
      border: 'line',
      hidden: true
    });
    [p, ...p.children].forEach(c=>c.on('click', data=>p!.hide()))
  }
  p.setContent(s)
  p.show()
}
let p: blessed.Widgets.PromptElement | undefined
export function closeAlert(screen: blessed.Widgets.Screen){
  if(p){
    p.hide()
  }
  screen.render()
}
export function alertVisible(){
  return p && p.visible
}