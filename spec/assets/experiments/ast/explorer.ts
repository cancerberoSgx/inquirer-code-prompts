import * as blessed from 'blessed';
import * as contrib from 'blessed-contrib';
import { Project } from 'ts-morph';
import { GeneralNode, getGeneralNodeChildren, isDirectory, isSourceFile, isNode } from 'ts-simple-ast-extra';
import { getGeneralNodeKindName, getGeneralNodeName } from './project';
import { updateDescendantElements } from './blessed';

interface Options {
  project: Project
  screen: blessed.Widgets.Screen
}

export function buildExplorer(options: Options) {
  const { screen, project } = options
  var grid = new contrib.grid({ rows: 1, cols: 2, screen: screen })
  var tree = grid.set(0, 0, 1, 1, contrib.tree,
    {
      template: { lines: true },
      label: 'Filesystem Tree',
      fg: 'green',
    }
  )
  var table = grid.set(0, 1, 1, 1, contrib.table,
    {
      keys: true
      , fg: 'green'
      , label: 'Details'
      , columnWidth: [10, 50]
    })
  table.setData({ headers: ['Property', 'Value'], data: [[]] })

  screen.key(['escape', 'q', 'C-c'], function (ch, key) {
    return process.exit(0);
  });
  screen.key(['tab'], function (ch, key) {
    if (screen.focused == tree.rows)
      table.focus();
    else
      tree.focus();
  });
  tree.focus()
  screen.render()
      const explorer = { extended: true, ...buildTreeNode(project.getRootDirectories()[0]) }
    // @ts-ignore
    tree.setData(explorer);
  updateTreeNoteStyles(tree);
  tree.on('select', function (n) {
    try {
      if (n.astNode) {
        const data = [
          ['Kind', getGeneralNodeKindName(n.astNode)||''],
          ['Name', getGeneralNodeName(n.astNode)||''],
          ['Text', isNode(n.astNode) ? n.astNode.getText()||'' : '']
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
  updateDescendantElements(tree, e => {
    const content = e.getContent();
    if (content.includes('/ [') || content.trim().endsWith('/') || content.includes('.')) {
      e.style.fg = 'yellow';
    }
    else {
      e.style.fg = 'white';
    }
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