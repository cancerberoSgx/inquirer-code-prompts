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

export function buildExplorer(options: Options) {
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
  const table: contrib.Widgets.TableElement = grid.set(1, 6, 11, 6, contrib.table,
    {
      keys: true,
      label: 'Details',
      columnWidth: [8, 200],
      style: {
        fg: 'green'}
    })
  table.children.filter(isBlessedElement).forEach(c => c.key('enter', function (ch, key) {
    // console.log(      table.children.filter(isBlessedElement).map(c=>c.getText()));
  })
  )

  table.setData({ headers: ['Property', 'Value'], data: [[]] })

  screen.key(['escape', 'q', 'Q', 'C-c'], function (ch, key) {
    return process.exit(0);
  });

  let lastFocus = 0
  const f: blessed.Widgets.BlessedElement[] = [tree, table, viewCode, optionsButton]
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
      if (n.astNode) {
        const data = [
          ['Kind', getGeneralNodeKindName(n.astNode) || ''],
          ['Name', getGeneralNodeName(n.astNode) || ''],
          ['Position', isNode(n.astNode) ? n.astNode.getPos() + '' : ''],
          ['Path', getGeneralNodePath(n.astNode, pwd()) || ''],
          ['Text', isNode(n.astNode) ? n.astNode.getText().replace(/\n/gm, '\\n') || '' : '']
        ]
        table.setData({ headers: ['Property', 'Value'], data });
      }
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
  screen.key(['escape', 'q', 'C-c'], function (ch, key) {
    return process.exit(0);
  });

  try {
    buildExplorer({ project, screen });
  } catch (error) {
    console.log(error);

  }
  screen.render()
}
test()