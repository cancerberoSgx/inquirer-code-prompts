import * as blessed from 'blessed';
import * as contrib from 'blessed-contrib';
import { pwd } from 'shelljs';
import { Project, SourceFile, Node } from 'ts-morph';
import { isDirectory, isNode, selectNode, getChildrenForEachChild, getNodeName } from 'ts-simple-ast-extra';
import { isBlessedElement, visitDescendantElements, installFocusHandler, modal, isModalVisible, closeModal, installExitKeys, onTreeNodeFocus, onButtonClicked } from './blessed';
import { longText } from '../../less/text';

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

  const viewCodeNButton: blessed.Widgets.ButtonElement = grid.set(0, 6, 1, 3, blessed.button, {
    mouse: true,
    clickable: true,
    keys: true,
    name: 'ViewCode',
    content: 'View Code',
    align: 'center',
    valign: 'middle',
  })
  onButtonClicked(viewCodeNButton, ()=>{
    modal(screen, 'Some options')
  });
  const optionsButton: blessed.Widgets.ButtonElement = grid.set(0, 9, 1, 3, blessed.button, {
    mouse: true,
    clickable: true,
    keys: true,
    name: 'options',
    content: 'Options',
    align: 'center',
    valign: 'middle',
  })

  onButtonClicked(optionsButton, ()=>{
    modal(screen, 'Some options')
  });

  const tree: contrib.Widgets.TreeElement = grid.set(0, 0, 12, 6, contrib.tree, {
    template: { lines: true },
    label: options.sourceFile.getBaseName(),
  } as contrib.Widgets.TreeOptions
  )
  tree.rows.style = { ...tree.rows.style || {}, ...focusStyle }

  onTreeNodeFocus(tree, selectTreeNode)

  const editor: blessed.Widgets.ScrollableTextElement = grid.set(1, 6, 11, 6, blessed.scrollabletext, {
    alwaysScroll: true,
    scrollable: true,
    clickable: true,
    focusable: true, 
    hoverText: 'hshshs',
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
  } as blessed.Widgets.ScrollableTextOptions)

  // editor.on('click', function (data: any) {
  //   modal(screen, JSON.stringify(data) + '  ' + JSON.stringify(editor.position))
  //   screen.render();
  // });

  installExitKeys(screen);

  installFocusHandler([tree, editor, viewCodeNButton, optionsButton], screen, focusStyle);

  screen.render()

  const rootNodew  = { extended: true, ...buildTreeNode(options.sourceFile) }
  // @ts-ignore
  tree.setData(rootNodew);
  tree.on('select', function (n: TreeNode) {
    selectTreeNode(n);
  });

  function selectTreeNode(n: TreeNode) {
    let text = options.sourceFile.getFullText();
    text = text.substring(0, n.astNode.getFullStart()) +
      require('ansi-escape-sequences').format(text.substring(n.astNode.getFullStart(), n.astNode.getEnd()), ['blue']) +
      text.substring(n.astNode.getEnd())
      if(n.astNode.getStartLineNumber()!==undefined){
        editor.setScroll(Math.max(0, n.astNode.getStartLineNumber()-3))//? n.astNode.getStartLineNumber()-1 : n.astNode.getStartLineNumber())
      }
    editor.setContent(text);
    screen.render();
  }

}
interface TreeNode {
  astNode: Node
}




function buildTreeNode(n: Node) {
  const children: any = {}
  getChildrenForEachChild(n).forEach(c => {
    const name = c.getKindName() + (getNodeName(c) ? ` (${getNodeName(c)})` : '')
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
  const f = project.createSourceFile('foo.ts', longText()+'\nexport const ggg = 1\n')
    buildCodeAst({ project, sourceFile: f, screen });
  screen.render()
}
test()