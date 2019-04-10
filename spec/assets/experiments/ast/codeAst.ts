import * as blessed from 'blessed';
import * as contrib from 'blessed-contrib';
import { Node, Project, SourceFile } from 'ts-morph';
import { getChildrenForEachChild, getNodeName } from 'ts-simple-ast-extra';
import { installExitKeys, installFocusHandler, modal, onButtonClicked, onTreeNodeFocus } from './blessed';
import { buildExplorer } from './explorer';

interface Options {
  project: Project
  screen: blessed.Widgets.Screen
  // sourceFile: SourceFile
  node: Node
}

export function buildCodeAst(options: Options) {
  let { screen, project, node } = options
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen })

  const focusStyle = {
    border: {
      type: 'line',
      fg: 'red'
    },
  }

  const fileExplorerButton: blessed.Widgets.ButtonElement = grid.set(0, 6, 1, 3, blessed.button, {
    mouse: true,
    clickable: true,
    keys: true,
    name: 'fileExplorer',
    content: 'File Explorer',
    align: 'center',
    valign: 'middle',
    padding: 0, margin: 0,
  })
  onButtonClicked(fileExplorerButton, () => {
    screen.clearRegion(0, parseInt(screen.width + ''), 0, parseInt(screen.height + ''))
    screen.render()
    screen.destroy()
    screen = blessed.screen({ smartCSR: true });
    buildExplorer({ screen, project })
    screen.render()
  });

  const optionsButton: blessed.Widgets.ButtonElement = grid.set(0, 9, 1, 3, blessed.button, {
    mouse: true,
    clickable: true,
    keys: true,
    name: 'options',
    content: 'Options',
    align: 'center',
    valign: 'middle',
    padding: 0, margin: 0,
  })

  onButtonClicked(optionsButton, () => {
    modal(screen, 'Some options')
  });

  const tree: contrib.Widgets.TreeElement = grid.set(0, 0, 12, 6, contrib.tree, {
    template: { lines: true },
    label: options.node.getSourceFile().getBaseName(),
  } as contrib.Widgets.TreeOptions
  )
  tree.rows.style = { ...tree.rows.style || {}, ...focusStyle }

  onTreeNodeFocus(tree, selectTreeNode)

  const editor: blessed.Widgets.ScrollableTextElement = grid.set(1, 6, 11, 6, blessed.scrollabletext, {
    alwaysScroll: true,
    scrollable: true,
    clickable: true,
    focusable: true,
    // hoverText: 'hshshs',
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
  } as blessed.Widgets.ScrollableTextOptions)

  // editor.on('click', function (data: any) {
  //   modal(screen, JSON.stringify(data) + '  ' + JSON.stringify(editor.position))
  //   screen.render();
  // });

  installExitKeys(screen);

  installFocusHandler([tree, editor, fileExplorerButton, optionsButton], screen, focusStyle);

  screen.render()

  const rootNodew = { extended: true, ...buildTreeNode(options.node.getSourceFile()) }
  // @ts-ignore
  tree.setData(rootNodew);
  tree.on('select', function (n: TreeNode) {
    selectTreeNode(n);
  });

  function selectTreeNode(n: TreeNode) {
    let text = options.node.getSourceFile().getFullText();
    text = text.substring(0, n.astNode.getFullStart()) +
      require('ansi-escape-sequences').format(text.substring(n.astNode.getFullStart(), n.astNode.getEnd()), ['blue']) +
      text.substring(n.astNode.getEnd())
    if (n.astNode.getStartLineNumber() !== undefined) {
      editor.setScroll(Math.max(0, n.astNode.getStartLineNumber() - 3))//? n.astNode.getStartLineNumber()-1 : n.astNode.getStartLineNumber())
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
  let counter = 0
  getChildrenForEachChild(n).forEach(c => {
    const name = c.getKindName() + (getNodeName(c) ? ` (${getNodeName(c)})` : '')
    children[children[name] ? name + ` (${counter++})` : name] = buildTreeNode(c)
  })
  return {
    children,
    astNode: n,
  }
}

