import * as blessed from 'blessed';
import * as contrib from 'blessed-contrib';
import { Project } from 'ts-morph';
import { buildExplorer } from './explorer';
function explorerTest() {
  var screen = blessed.screen({ smartCSR: true });
  const project = new Project({ tsConfigFilePath: './tsconfig.json', addFilesFromTsConfig: true });
  buildExplorer({ project, screen });
  screen.render();
}
explorerTest();
