import * as blessed from 'blessed';
import * as contrib from 'blessed-contrib';
import { Project } from 'ts-morph';
import { GeneralNode, getGeneralNodeChildren, isDirectory, isSourceFile } from 'ts-simple-ast-extra';
import { getGeneralNodeKindName, getGeneralNodeName } from './project';

// type TreeChildren = { [n: string]: TreeNode }
// interface TreeNode {
//   name: string,
//   extended?: boolean,
//   getPath(n: TreeNode): string,
//   children(n: TreeNode): TreeChildren,
//   parent?: TreeNode,
//   depth?: number
//   // childrenContent?: any
//   astNode?: GeneralNode
// }
interface Options {
  project: Project
  screen: blessed.Widgets.Screen
}
// const ansi = require('ansi-escape-sequences')

export function buildExplorer(options: Options) {
  // var screen = blessed.screen()
  const { screen, project } = options

  //create layout and widgets
  var grid = new contrib.grid({ rows: 1, cols: 2, screen: screen })


  var tree = grid.set(0, 0, 1, 1, contrib.tree,
    {
      // style: { text: "red" },
      template: { lines: true },
      label: 'Filesystem Tree',
      fg: 'green', 
      // mouse: true,  
      // clickable: true,
      // scrollable: true, 
      // // // draggable: true,
      // scrollbar: {
      //   ch: ' ',
      //   track: {
      //     bg: 'cyan'
      //   },
      //   style: {
      //     inverse: true
      //   }
      // },
    }
    )

  // tree.children[0].
  var table = grid.set(0, 1, 1, 1, contrib.table,
    {
      keys: true
      , fg: 'green'
      , label: 'Details'
      , columnWidth: [20, 29]
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

  try {
    
  // const root = project.getRootDirectories()[0]
  function buildTreeNode(n: GeneralNode){
    const children: any = {}
    getGeneralNodeChildren(n).forEach(c=>{
      const name =( getGeneralNodeName(c)||getGeneralNodeKindName(c))+ (isDirectory(c) ? '/' : '')
      children[name] = buildTreeNode(c)
    })
    return {
      children, 
      astNode: n,
      // fg: isDirectory(n) ? 'red' : 'blue', 


      // style: {
      //   fg: isDirectory(n) ? 'red' : 'blue', }
    }
  }
  const explorer = {extended: true,...buildTreeNode(project.getRootDirectories()[0])}

  // console.log(explorer);
  
// @ts-ignore
tree.setData(explorer);
  } catch (error) {
    console.log(error, 'ERROR');
    throw error
  }

  tree.on('select', function (n) {
  // console.log('select', node.name);
  const data = [
    [getGeneralNodeKindName(n.astNode)+'', getGeneralNodeName(n.astNode)+'']
  ]

  // tree.getLines().forEach((l, i)=>{
  //   if(l.includes('/ [' )){
  //     tree.setLine(i, ansi.format(l, ['yellow']))
  //   }
  //   else {
  //     escape
  //   }
  // } )
  // tree.setLine(0, ansi.format('asdasd', ['yellow']))
  
  updateDescendantElements(tree, e=>{
    const content = e.getContent()
    if(content.includes('/ [') || content.trim().endsWith('/') || content.includes('.')){
      e.style.fg = 'yellow'
      // e.setContent(ansi.format(content, ['yellow']))
    }
    else {
      e.style.fg= 'white'
    }
  })

  // const data = [[getGeneralNodeKindName(n.astNode)||'asd', getGeneralNodeName(n)]]
  table.setData({ headers: ['Kind', 'Name'], data});  
  screen.render()
}); 
// //@ts-ignore
// console.log(tree.children.map(c=>c.children.map(cc=>cc.getContent && cc.getContent())))
}

function isBlessedElement(n: any): n is blessed.Widgets.BlessedElement{
  return n && n.screenshot && n.enableDrag
}

function updateNodeLines(node:blessed.Widgets.BlessedElement, fn: (l: string)=>string){

node.getLines().forEach((l, i)=>{
  node.setLine(i,fn(l))
})
node.children.forEach(c=>{if(isBlessedElement(c)){updateNodeLines(c, fn)}} )
}

function updateDescendantNodes(node:blessed.Widgets.BlessedElement, fn: (l: blessed.Widgets.Node)=>string){
  node.children.forEach(c=>{
    fn(c)
    if(isBlessedElement(c)){
      updateDescendantNodes(c, fn)
    }
  })
  // node.children.forEach(c=>{if(isBlessedElement(c)){updateNodeLines(c, fn)}} )
  }
  function updateDescendantElements(node:blessed.Widgets.BlessedElement, fn: (l: blessed.Widgets.BlessedElement)=>void){
    node.children.forEach(c=>{
      if(isBlessedElement(c)){
        fn(c)
        updateDescendantElements(c, fn)
      }
    })
    // node.children.forEach(c=>{if(isBlessedElement(c)){updateNodeLines(c, fn)}} )
    }
test();

function test() {
  var screen = blessed.screen({smartCSR: true});
  const project = new Project({ tsConfigFilePath: './tsconfig.json', addFilesFromTsConfig: true });
  // console.log(project.getRootDirectories().map(d=>d.getBaseName()));
  
  screen.key(['escape', 'q', 'C-c'], function (ch, key) {
    return process.exit(0);
  });
  
  buildExplorer({ project, screen });
  screen.render()
}


// import * as blessed from 'blessed'
// import * as contrib from 'blessed-contrib'
// // import * as fs from 'fs'
// // import * as path from 'path' 
// import { Project, SourceFile, Directory } from 'ts-morph';
// import { setMaxListeners } from 'cluster';
// import { getParent, getRelativePath, File, getGeneralChildren, GeneralNode, getFilePath } from './project';
// import { isSourceFile } from 'typescript';


// //file explorer
// // buildExplorer();

// interface Options {
//   project: Project
//   screen: blessed.Widgets.Screen
// }
// export function buildExplorer(options: Options) {
//   // var screen = blessed.screen()
//   const { screen, project } = options

// //create layout and widgets
// var grid = new contrib.grid({ rows: 1, cols: 2, screen: screen })

// var tree = grid.set(0, 0, 1, 1, contrib.tree,
//   {
//     style: { text: "red" }
//     , template: { lines: true }
//     , label: 'Filesystem Tree'
//   })

//   // tree.children[0].
// var table = grid.set(0, 1, 1, 1, contrib.table,
//   {
//     keys: true
//     , fg: 'green'
//     , label: 'Informations'
//     , columnWidth: [24, 10, 10]
//   })


//   //set default table
//   table.setData({ headers: ['Info'], data: [[]] })

//   screen.key(['escape', 'q', 'C-c'], function (ch, key) {
//     return process.exit(0);
//   });

//   screen.key(['tab'], function (ch, key) {
//     if (screen.focused == tree.rows)
//       table.focus();
//     else
//       tree.focus();
//   });

//   tree.focus()
//   screen.render()
// // tree.children[0]!.emit()
//   var explorer = {
//     name: '/',
//     extended: true
//     // Custom function used to recursively determine the node path
//     ,
//     getPath: function (f: File) {
//       const p = getParent(f)
//       // If we don't have any parent, we are at tree root, so return the base case
//       if (!p)
//         return '';
//       // Get the parent node path and add this node name
//       return  getRelativePath(f, project)
//     }
//     // Child generation function
//     ,
//     children: function (f: GeneralNode) {
//       var result: any = {};
//       // var selfPath = f.getPath(f);
//       const selfPath = getFilePath(f)
//       try {
//         // List files in this directory
//         // var children = fs.readdirSync(selfPath + '/');
//         const children = getGeneralChildren(f)
//         // childrenContent is a property filled with self.children() result
//         // on tree generation (tree.setData() call)
//         if (!f.childrenContent) {
//           for (var child in children) {
//             child = children[child];
//             var completePath = selfPath + '/' + child;
//             // if(isSourceFile())
//             if (fs.lstatSync(completePath).isDirectory()) {
//               // If it's a directory we generate the child with the children generation function
//               result[child] = { name: child, getPath: f.getPath, extended: false, children: f.children };
//             }
//             else {
//               // Otherwise children is not set (you can also set it to "{}" or "null" if you want)
//               result[child] = { name: child, getPath: f.getPath, extended: false };
//             }
//           }
//         }
//         else {
//           result = f.childrenContent;
//         }
//       }
//       catch (e) { }
//       return result;
//     }
//   };
//   //set tree
//   //@ts-ignore
//   tree.setData(explorer);
//   // Handling select event. Every custom property that was added to node is 
//   // available like the "node.getPath" defined above
//   tree.on('select', function (node) {
//     var path = node.getPath(node);
//     var data = [];
//     // The filesystem root return an empty string as a base case
//     if (path == '')
//       path = '/';
//     // Add data to right array
//     data.push([path]);
//     data.push(['']);
//     try {
//       // Add results
//       data = data.concat(JSON.stringify(fs.lstatSync(path), null, 2).split("\n").map(function (e) { return [e]; }));
//       table.setData({ headers: ['Info'], data: data });
//     }
//     catch (e) {
//       table.setData({ headers: ['Info'], data: [[e.toString()]] });
//     }
//     screen.render();
//   });
// }
