import * as blessed from 'blessed';
import * as contrib from 'blessed-contrib';
import { pwd } from 'shelljs';
import { Project } from 'ts-morph';
import { GeneralNode, getGeneralNodeChildren, isDirectory, isNode } from 'ts-simple-ast-extra';
import { isBlessedElement, visitDescendantElements } from './blessed';
import { getGeneralNodeKindName, getGeneralNodeName, getGeneralNodePath } from './project';

interface Options {
  project: Project
  screen: blessed.Widgets.Screen
}

export function buildCodeAst(options: Options) {
  const { screen, project } = options
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen })

  const focusStyle = {
    border: {
      type: 'line',
      fg: 'red'
    },
  }

  const viewCode: blessed.Widgets.ButtonElement = grid.set(0, 6, 1, 3, blessed.button,    {
      mouse: true,
      clickable: true,
      keys: true,
      name: 'ViewCode',
      content: 'View Code',
      align: 'center',
      valign: 'middle',
      style: {
        bg: 'blue',
        // focus: focusStyle
      }
    })  
    viewCode.on('pressed', e => {
      console.log('asdasd');
    })
  const optionsButton: blessed.Widgets.ButtonElement = grid.set(0, 9, 1, 3, blessed.button,    {
      mouse: true,
      clickable: true,
      keys: true,
      name: 'options',
      content: 'Options',
      align: 'center',
      valign: 'middle',
      style: {
        bg: 'blue',
        // focus: focusStyle
      }
    })
    optionsButton.on('pressed', e => {
    console.log('asdasd');
  })
  const tree: contrib.Widgets.TreeElement = grid.set(0, 0, 12, 6, contrib.tree, {
    template: { lines: true },
    label: 'Files and Nodes Tree',
    style: {
      fg: 'green'
    }
  }
  )
  tree.rows.style = { ...tree.rows.style || {}, ...focusStyle }

let p: blessed.Widgets.PromptElement | undefined
function alert(s: string) {
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
function closeAlert(){
  if(p){
    p.hide()
  }
  screen.render()
}
function alertVisible(){
  return p && p.visible
}

const editor: blessed.Widgets.TextboxElement = grid.set(1, 6, 11, 6, blessed.textbox, {
  // alwaysScroll: true,
  scrollable: true,
  clickable: true,
  focusable: true, 
  // hoverText: 'hshshs',
  mouse: true,
  scrollbar: {
    ch: ' ',
    track: {
      bg: 'cyan'
    },
    style: {
      inverse: true
    }
  },
  style: {
    item: {
      hover: {
        bg: 'blue'
      }
    },
    selected: {
      bg: 'blue',
      bold: true
    }
  },
  keyable: true,

  top: 0,
  left: 0, width: '100%', height: '100%',
} as blessed.Widgets.TextboxOptions)

editor.on('click', function (data:any) {
  alert( JSON.stringify(data) + '  ' + JSON.stringify(editor.position))
  screen.render();
});


let cursor=0
editor.key('down', function (data:any) {
  console.log('DSLKJLkjlkj');
  
  //   alert( JSON.stringify(data) + '  ' + JSON.stringify(editor.position))
  //   screen.render();
  cursor++
  const tokens = editor.getText().split(/\s+/gm)
  tokens[cursor] =require('ansi-escape-sequences').format( tokens[cursor],['blue'])
  editor.setText(tokens.join(' '))
  })
  

  // table.setData({ headers: ['Property', 'Value'], data: [[]] })

  screen.key(['escape', 'q', 'Q', 'C-c'], function (ch, key) {
    if(alertVisible()){
      closeAlert()
    }
    else {
      return process.exit(0);
    }
  });

  let lastFocus = 0
  const f: blessed.Widgets.BlessedElement[] = [tree, editor, viewCode, optionsButton]
  screen.key(['tab'], function (ch, key) {
    try {
      if (screen.focused) {
        [f[lastFocus], f[lastFocus].parent, ...f[lastFocus].children || []].filter(isBlessedElement).forEach(c => {
          c.style = { ...c.style || {}, border: {} }
        })
      }
      lastFocus = lastFocus >= f.length - 1 ? 0 : lastFocus + 1
      f[lastFocus].focus();
        [f[lastFocus], f[lastFocus].parent, ...f[lastFocus].children || []].filter(isBlessedElement).forEach(c => {
          c.style = { ...c.style || {}, ...focusStyle }
        })
        f[lastFocus].key
screen.render()
    } catch (error) {
      console.log(error);
      throw error
    }
  })

  tree.focus(); 
  [tree, tree.parent, ...tree.children || []].filter(isBlessedElement).forEach(c => {
      c.style = { ...c.style || {}, ...focusStyle }
    })
  screen.render()

  const explorer = { extended: true, ...buildTreeNode(project.getRootDirectories()[0]) }

  // @ts-ignore
  tree.setData(explorer);
  updateTreeNoteStyles(tree);
  tree.on('select', function (n: TreeNode) {
    try {
      editor.setText(isNode(n.astNode) ? n.astNode.getText() : '')
      // if (n.astNode) {
        // const data = [
        //   ['Kind', getGeneralNodeKindName(n.astNode) || ''],
        //   ['Name', getGeneralNodeName(n.astNode) || ''],
        //   ['Position', isNode(n.astNode) ? n.astNode.getPos() + '' : ''],
        //   ['Path', getGeneralNodePath(n.astNode, pwd()) || ''],
        //   ['Text', isNode(n.astNode) ? n.astNode.getText().replace(/\n/gm, '\\n') || '' : '']
        // ]
        // table.setData({ headers: ['Property', 'Value'], data });
      // }
      updateTreeNoteStyles(tree);
      screen.render()
    } catch (error) {
      console.log(error);
      throw error
    }
  });
}
interface TreeNode {
  astNode: GeneralNode
}

function buildTreeNode(n: GeneralNode) {
  const children: any = {}
  getGeneralNodeChildren(n).forEach(c => {
    const name = (getGeneralNodeName(c) || getGeneralNodeKindName(c)) + (isDirectory(c) ? '/' : '')
    children[name] = buildTreeNode(c)
  })
  return {
    children,
    astNode: n,
  }
}

function updateTreeNoteStyles(tree: contrib.Widgets.TreeElement) {
  visitDescendantElements(tree, e => {
    const content = e.getContent();
    if (content.includes('/ [') || content.trim().endsWith('/') || content.includes('.')) {
      e.style.fg = 'yellow';
    }
    else {
      e.style.fg = 'white';
    }
    return false
  });
}



function test() {
  var screen = blessed.screen({ smartCSR: true });
  const project = new Project({ tsConfigFilePath: './tsconfig.json', addFilesFromTsConfig: true });
  // screen.key(['escape', 'q', 'C-c'], function (ch, key) {
  //   return process.exit(0);
  // });

  try {
    buildCodeAst({ project, screen });
  } catch (error) {
    console.log(error);

  }
  screen.render()
}
test()