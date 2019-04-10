// var blessed = require('blessed');
import * as blessed from 'blessed'
import { longText } from '../../less/text';
// import {} from 'blessed'

// Create a screen object.
var screen = blessed.screen({
  smartCSR: true
});

screen.title = 'my window title';

// Create a box perfectly centered horizontally and vertically.
var box = blessed.box({
  top: 'center',
  left: 'center',
  width: '90%',
  mouse: true,
  height: '90%',
  content: longText(),// 'Hello {bold}world{/bold}!',
  tags: true,
  scrollable: true,
  
  alwaysScroll: true,
  // scrollbar: {ch: '8', track: true, style: {fg: 'pink'}},
  // border: {
  //   type: 'line'
  // },
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
    // mouse: {cur},
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
});

// Append our box to the screen.
screen.append(box);
// box.sc
// Add a png icon to the box
// var icon = blessed.image({
//   parent: box,
//   top: 0,
//   left: 0,
//   type: 'overlay',
//   width: 'shrink',
//   height: 'shrink',
//   file: __dirname + '/my-program-icon.png',
//   search: false
// });

// If our box is clicked, change the content.
box.on('click', function(data) {
  // console.log(data);
  box.insertTop(JSON.stringify(data))
  data.
  
  // box.setContent('{center}Some different {red-fg}content{/red-fg}.{/center}');
  screen.render();
});

// If box is focused, handle `enter`/`return` and give us some more content.
// box.key('enter', function(ch, key) {
//   box.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
  // box.setLine(1, 'bar');
  // box.insertLine(1, 'foo');
  // screen.render();
// });

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});
screen.cursorShape(true, true)
// Focus our element.
box.focus();

// Render the screen.
screen.render();


var list = blessed.list({
  parent: screen,
  label: ' {bold}{cyan-fg}Art List{/cyan-fg}{/bold} (Drag Me) ',
  tags: true,
  draggable: true,
  top: 0,
  right: 0,
  width: 200,
  height: '50%',
  keys: true,
  vi: true,
  mouse: true,
  border: 'line',
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
  search: function(callback) {
    prompt.input('Search:', '', function(err, value) {
      if (err) return;
      return callback(null, value);
    });
  }
});


var prompt = blessed.prompt({
  parent: screen,
  top: 'center',
  left: 'center',
  height: 'shrink',
  width: 'shrink',
  keys: true,
  vi: true,
  mouse: true,
  tags: true,
  border: 'line',
  hidden: true
});
