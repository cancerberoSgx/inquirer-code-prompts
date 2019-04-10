import * as blessed from 'blessed';
import * as contrib from 'blessed-contrib';
import { pwd } from 'shelljs';
import { Project, Node } from 'ts-morph';
import { GeneralNode, getGeneralNodeChildren, isDirectory, isNode } from 'ts-simple-ast-extra';
import { isBlessedElement, visitDescendantElements, installExitKeys, onButtonClicked, onTreeNodeFocus, installFocusHandler } from './blessed';
import { getGeneralNodeKindName, getGeneralNodeName, getGeneralNodePath } from './project';
import { buildCodeAst } from './codeAst';

interface Options {
  project: Project
  screen: blessed.Widgets.Screen
}

export function buildExplorer(options: Options) {
  let { screen, project } = options
  const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen })
  const focusStyle = {
    border: {
      type: 'line',
      fg: 'red'
    },
  }
  const viewCodeButton: blessed.Widgets.ButtonElement = grid.set(0, 6, 1, 3, blessed.button, {
    mouse: true,
    clickable: true,
    keys: true,
    name: 'ViewCode',
    content: 'View Code',
    align: 'center',
    valign: 'middle',
    style: {
      bg: 'blue',
    }
  })
  onButtonClicked(viewCodeButton, () => {
    if (lastSelectedNode) {
      screen.clearRegion(0, parseInt(screen.width + ''), 0, parseInt(screen.height + ''))
      screen.render()
      screen.destroy()
      screen = blessed.screen({ smartCSR: true });
      buildCodeAst({ screen,node:lastSelectedNode, project })
      screen.render()
    }
  })
  const optionsButton: blessed.Widgets.ButtonElement = grid.set(0, 9, 1, 3, blessed.button, {
    mouse: true,
    clickable: true,
    keys: true,
    name: 'options',
    content: 'Options',
    align: 'center',
    valign: 'middle'
  })
  onButtonClicked(optionsButton, () => {
    console.log('asdasd');
  })
  const tree: contrib.Widgets.TreeElement = grid.set(0, 0, 12, 6, contrib.tree, {
    template: { lines: true },
    label: 'Files and Nodes Tree'
  }
  )
  tree.rows.style = { ...tree.rows.style || {}, ...focusStyle }

  onTreeNodeFocus(tree, selectTreeNode)


  const table: contrib.Widgets.TableElement = grid.set(1, 6, 11, 6, contrib.table,
    {
      keys: true,
      label: 'Details',
      columnWidth: [8, 200],
      style: {
        fg: 'green'
      }
    })
  // table.children.filter(isBlessedElement).forEach(c => c.key('enter', function (ch, key) {
  //   console.log(      table.children.filter(isBlessedElement).map(c=>c.getText()));
  // }))

  table.setData({ headers: ['Property', 'Value'], data: [[]] })

  installExitKeys(screen)

  installFocusHandler([tree, table, viewCodeButton, optionsButton], screen, focusStyle)
  screen.render()

  const rootNode = { extended: true, ...buildTreeNode(project.getRootDirectories()[0]) }

  // @ts-ignore
  tree.setData(rootNode);

  updateTreeNoteStyles(tree);

  tree.on('select', function (n: TreeNode) {
    selectTreeNode(n);
  });

  function selectTreeNode(n: TreeNode) {
    if (n.astNode) {
      if (isNode(n.astNode)) {
        lastSelectedNode = n.astNode
      }
      const data = [
        ['Kind', getGeneralNodeKindName(n.astNode) || ''],
        ['Name', getGeneralNodeName(n.astNode) || ''],
        ['Position', isNode(n.astNode) ? n.astNode.getPos() + '' : ''],
        ['Path', getGeneralNodePath(n.astNode, pwd()) || ''],
        ['Text', isNode(n.astNode) ? n.astNode.getText().replace(/\n/gm, '\\n') || '' : '']
      ];
      table.setData({ headers: ['Property', 'Value'], data });
    }
    updateTreeNoteStyles(tree);

    screen.render();
  }
  let lastSelectedNode: Node | undefined
}
interface TreeNode {
  astNode: GeneralNode
}

function buildTreeNode(n: GeneralNode) {
  const children: any = {}
  let counter=0
  getGeneralNodeChildren(n).forEach(c => {
    const name = (getGeneralNodeName(c) || getGeneralNodeKindName(c)) + (isDirectory(c) ? '/' : '')
    children[children[name] ? name + ` (${counter++})` : name]  = buildTreeNode(c)
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

