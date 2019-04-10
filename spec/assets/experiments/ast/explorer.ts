import * as blessed from 'blessed';
import * as contrib from 'blessed-contrib';
import { Project } from 'ts-morph';
import { File, GeneralNode, getFilePath, getParent, getRelativePath, getGeneralNodeChildren, getFileRelativePath, getGeneralNodePath, isDirectory } from 'ts-simple-ast-extra';
import { getGeneralNodeName, getGeneralNodeKindName } from './project';


interface Options {
  project: Project
  screen: blessed.Widgets.Screen
}
export function buildExplorer(options: Options) {
  // var screen = blessed.screen()
  const { screen, project } = options

  //create layout and widgets
  var grid = new contrib.grid({ rows: 1, cols: 2, screen: screen })

  var tree = grid.set(0, 0, 1, 1, contrib.tree,
    {
      style: { text: "red" }
      , template: { lines: true }
      , label: 'Filesystem Tree'
    })

  // tree.children[0].
  var table = grid.set(0, 1, 1, 1, contrib.table,
    {
      keys: true
      , fg: 'green'
      , label: 'Informations'
      , columnWidth: [24, 10, 10]
    })


  //set default table
  table.setData({ headers: ['Info'], data: [[]] })

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
  // tree.children[0]!.emit()
  var explorer = {
    name: '/',
    extended: true
    // Custom function used to recursively determine the node path
    ,
    getPath: function (f: File) {
      const p = getParent(f)
      // If we don't have any parent, we are at tree root, so return the base case
      if (!p) {
        return '';
      }
      // Get the parent node path and add this node name
      return getGeneralNodePath(f)
    }
    // Child generation function
    ,
    children: function (f: GeneralNode & { childrenContent: any }) {
      var result: any = {};
      // var selfPath = f.getPath(f);
      // const selfPath = getGeneralNodePath(f)
      const completePath = getGeneralNodePath(f)
      try {
        // List files in this directory
        // var children = fs.readdirSync(selfPath + '/');
        const children = getGeneralNodeChildren(f)
        // childrenContent is a property filled with self.children() result
        // on tree generation (tree.setData() call)
        if (!f.childrenContent) {
          children.forEach(child => {
            const name = getGeneralNodeName(child)
            result[name] = { name, extended: false, node: child };

          })
          // for (var child in children) {
          // child = children[child];
          // var completePath = selfPath + '/' + child;
          // if(isSourceFile())
          // if (isDirectory(f)) {
          // If it's a directory we generate the child with the children generation function

          // }
          // else {
          //   // Otherwise children is not set (you can also set it to "{}" or "null" if you want)
          //   result[child] = { name: child, extended: false };
          // }
          // }
        }
        else {
          result = f.childrenContent;
        }
      }
      catch (e) {
        throw e
      }
      return result;
    }
  };
  //set tree
  //@ts-ignore
  tree.setData(explorer);
  // Handling select event. Every custom property that was added to node is 
  // available like the "node.getPath" defined above
  tree.on('select', function (node) {
    var path = node.getPath(node);
    var data = [];
    // The filesystem root return an empty string as a base case
    if (path == '')
      path = '/';
    // Add data to right array
    data.push([path]);
    data.push(['']);
    try {
      // Add results
      data = data.concat(JSON.stringify('jojojo', null, 2).split("\n").map(function (e) { return [e]; }));
      table.setData({ headers: ['Info'], data: data });
    }
    catch (e) {
      table.setData({ headers: ['Info'], data: [[e.toString()]] });
    }
    screen.render();
  });
}


test();

function test() {
  var screen = blessed.screen();
  const project = new Project({ tsConfigFilePath: './tsconfig.json', addFilesFromTsConfig: true });
  screen.key(['escape', 'q', 'C-c'], function (ch, key) {
    return process.exit(0);
  });
  buildExplorer({ project, screen });
}
