import * as blessed from 'blessed';
import * as contrib from 'blessed-contrib';
import { pwd } from 'shelljs';
import { Project, SourceFile, Node } from 'ts-morph';
import {isDirectory, isNode, selectNode, getChildrenForEachChild, getNodeName } from 'ts-simple-ast-extra';
import { isBlessedElement, visitDescendantElements, installFocusHandler, alert, alertVisible, closeAlert } from './blessed';

interface Options {
  project: Project
  screen: blessed.Widgets.Screen
  sourceFile: SourceFile
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
      // style: {
      //   bg: 'blue',
      //   // focus: focusStyle
      // }
    })
    optionsButton.on('pressed', e => {
    console.log('asdasd');
  })
  const tree: contrib.Widgets.TreeElement = grid.set(0, 0, 12, 6, contrib.tree, {
    template: { lines: true },
    label: options.sourceFile.getBaseName(),
    keys: ['enter', 'space']
    // style: {
    //   fg: 'green'
    // }
  } as contrib.Widgets.TreeOptions
  )
  tree.rows.style = { ...tree.rows.style || {}, ...focusStyle }
// tree.rows.key(['down'])



const editor: blessed.Widgets.TextboxElement = grid.set(1, 6, 11, 6, blessed.textbox, {
  scrollable: true,
  clickable: true,
  focusable: true, 
  mouse: true,
  // scrollbar: {
  //   ch: ' ',
  //   track: {
  //     bg: 'cyan'
  //   },
  //   style: {
  //     inverse: true
  //   }
  // },
  // style: {
  //   item: {
  //     hover: {
  //       bg: 'blue'
  //     }
  //   },
  //   selected: {
  //     bg: 'blue',
  //     bold: true
  //   }
  // },
  // keyable: true,

  // top: 0,
  // left: 0
  // , width: '100%', height: '100%',
} as blessed.Widgets.TextboxOptions)

editor.on('click', function (data:any) {
  alert( screen, JSON.stringify(data) + '  ' + JSON.stringify(editor.position))
  screen.render();
});
// let cursor=0
// let selectedNode:Node = options.sourceFile
// editor.key('down', function (data:any) {
//   let text = editor.getText()
// text = text.substring(0, selectedNode.getFullStart()) + require('ansi-escape-sequences').format( text.substring(selectedNode.getFullStart(), selectedNode.getEnd()),['blue']) + text.substring( selectedNode.getEnd()) 
//   editor.setContent(text)

//   // selectedNode.getPos
//   // const tokens = editor.getText().split(/\s+/gm)
//   // tokens[cursor] =require('ansi-escape-sequences').format( tokens[cursor],['blue']) 
//   // cursor = cursor>=tokens.length-1 ? 0 : cursor+1
//   // editor.setContent(tokens.join(' '))
//   screen.render()
//   })

  screen.key(['escape', 'q', 'Q', 'C-c'], function (ch, key) {
    if(alertVisible()){
      closeAlert(screen)
    }
    else {
      return process.exit(0);
    }
  });

  installFocusHandler([tree,editor, viewCode, optionsButton], screen, focusStyle);

  screen.render()
  const explorer = { extended: true, ...buildTreeNode(options.sourceFile)}
  // @ts-ignore
  tree.setData(explorer);
  tree.on('select', function (n: TreeNode) {
    try {
      let text = options.sourceFile.getFullText()
      text = text.substring(0, n.astNode.getFullStart()) + require('ansi-escape-sequences').format( text.substring(n.astNode.getFullStart(), n.astNode.getEnd()),['blue']) + text.substring( n.astNode.getEnd()) 
        editor.setContent(text)
      screen.render()
    } catch (error) {
      console.log(error);
      throw error
    }
  });
}
interface TreeNode {
  astNode: Node
}

function buildTreeNode(n: Node) {
  const children: any = {}
  getChildrenForEachChild(n).forEach(c => {
    const name =c.getKindName() + (getNodeName(c) ? ` (${getNodeName(c)})` : '')
    children[name] = buildTreeNode(c)
  })
  return {
    children,
    astNode: n,
  }
}
 
function test() {
  var screen = blessed.screen({ smartCSR: true });
  const project = new Project();
  const f = project.createSourceFile('foo.ts', `
const a = 1
export function fffff(a: string){}
  `)
  try {
    buildCodeAst({ project, sourceFile: f, screen });
  } catch (error) {
    console.log(error);

  }
  screen.render()
}
test()