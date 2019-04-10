// import * as blessed from 'blessed'
// import * as contrib from 'blessed-contrib'
// import { longText } from '../../less/text';

// const screen = blessed.screen({
//   smartCSR: true
// })
// var grid = new contrib.grid({rows: 1, cols: 12, left: 0, top: 0,   screen})
// var map = grid.set(0, 0, 1, 4, contrib.map, {label: 'World Map', mouse: true, clickable: true, })
// const text = addScrollableText()

// screen.key(['escape', 'q', 'C-c'], function (ch, key) {
//   return screen.destroy();
// });

// map.focus();

// screen.key('q', function() {
//   return screen.destroy();
// });

// screen.render();



// function addScrollableText(){
//   const boxOptions: blessed.Widgets.ScrollableTextOptions = {
//   content: longText(), 
//   scrollable: true, 
//   tags: true, alwaysScroll: true, mouse: true, keyable: true,
//     scrollbar: {
//       ch: ' ',
//       track: {
//         bg: 'cyan'
//       },
//       style: {
//         inverse: true
//       }
//     },
//     style: {
//       item: {
//         hover: {
//           bg: 'blue'
//         }
//       },
//       selected: {
//         bg: 'blue',
//         bold: true
//       }
//     },
//     // bindings: {}
//   };
//   return  grid.set(0, 4, 1, 8, blessed.scrollabletext, boxOptions) as blessed.Widgets.ScrollableTextElement;
// }



// function addBox(){
//   const boxOptions: blessed.Widgets.BoxOptions = {
//   content: longText(), scrollable: true, tags: true, alwaysScroll: true, mouse: true, keyable: true,
//     scrollbar: {
//       ch: ' ',
//       track: {
//         bg: 'cyan'
//       },
//       style: {
//         inverse: true
//       }
//     },
//     style: {
//       item: {
//         hover: {
//           bg: 'blue'
//         }
//       },
//       selected: {
//         bg: 'blue',
//         bold: true
//       }
//     },
//     bindings: {}
//   };
//   return  grid.set(0, 4, 1, 8, blessed.box, boxOptions) as blessed.Widgets.BoxElement;
// }
