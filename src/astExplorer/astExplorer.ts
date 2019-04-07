import { tsquery } from '@phenomnomnominal/tsquery'
import chalk from 'chalk'
import { prompt, Questions } from 'inquirer'
import * as _ from 'lodash'
import { Node, SourceFile } from 'typescript'
import { appendFileSync } from 'fs'
import { nodeKinds } from './nodeKinds'
const { map, takeUntil } = require('rxjs/operators')
const Base = require('inquirer/lib/prompts/base')
const observe = require('inquirer/lib/utils/events')

interface KeyEvent {
  value: string
  key: { sequence: string; name: string; ctrl: boolean; meta: boolean; shift: boolean }
}

/**
 * Ast explorer, user can see code, filter entering tsquery selectors and navigate thgouh matched nodes with arrow keys. finally select a node with enter.
 *
 * usage:
```
import {astExplorer, AstExplorer} from './astExplorer'
import {registerPrompt} from 'inquirer'
import { tsquery } from '@phenomnomnominal/tsquery';

registerPrompt('ast-explorer', AstExplorer as any)

async function test(){
  const code = `
class Animal {
  constructor(public name: string) { }
  move(distanceInMeters: number = 0) {
    console.log('hello');
  }
}
class Snake extends Animal {
  constructor(name: string) { super(name); }
  move(distanceInMeters = 5) {
    console.log("Slithering...");
    super.move(distanceInMeters);
  }
}
    `
  const selectedNode= await astExplorer({code})
console.log({selectedNode: selectedNode.getText()});
 * })
 * ```
 * TODO: move to its own project
 * TODO: pass directly all the options to the prompt - remove this function
 */
export async function astExplorer(options: Options): Promise<Node> {
  const rows = process.stdout.rows || 24
  const choices = options.code.split('\n')
  const result = await prompt([
    {
      type: 'ast-explorer',
      name: ' ',
      choices,
      paginated: true,
      pageSize: options.pageSize || Math.min(options.pageSize || Infinity, rows)
    }
  ])
  return result[' ']
}

interface Options {
  code: string
  pageSize?: number
}

export class AstExplorer extends Base {
  selectedNodes: Node[]
  currentInput: string
  sourceFile: SourceFile
  selectedNodeIndex = 0
  suggestionIndex = -1
  suggestions: string[] = []
  constructor(questions: Questions, rl: any, answers: any) {
    super(questions, rl, answers)
    if (!this.opt.choices) {
      this.throwParamError('choices')
    }
    this.code = this.opt.choices.choices.map((c: { name: any }) => c.name).join('\n')
    const rows = process.stdout.rows || 24
    this.min = 0
    this.max = Math.max(this.opt.choices.choices.length, rows) - rows + 1
    this.currentInput = 'Identifier'
    this.rl.line = this.currentInput
    this.sourceFile = tsquery.ast(this.code)
    this.selectedNodes = tsquery(this.sourceFile, this.currentInput)
    this.selectedNodeIndex = 0
    this.paginator = new CustomPaginator(this.screen)
  }
  onKeypress(e?: KeyEvent) {
    let error: string | undefined
    if (e && e.key.name === 'tab') {
      this.suggestionIndex++
      this.suggestionIndex >= this.suggestions.length ? 0 : this.suggestionIndex
      if (!this.suggestions[this.suggestionIndex]) {
        error = 'No available suggestions'
      } else {
        this.currentInput = this.suggestions[this.suggestionIndex]
        this.rl.line = this.currentInput
      }
    } else if (e && e.value) { // is a letter
      this.suggestionIndex = -1
      this.currentInput = this.rl.line
    }
    // appendFileSync('l.log', '**' + this.currentInput)
    this.render(error)
  }
  _run(cb: any) {
    this.done = cb
    const events = observe(this.rl)
    const submit = events.line.pipe(map(this.getCurrentValue.bind(this)))
    const validation = this.handleSubmitEvents(submit)
    validation.success.forEach(this.onEnd.bind(this))
    validation.error.forEach(this.onError.bind(this))
    events.keypress.pipe(takeUntil(validation.success)).forEach(this.onKeypress.bind(this))
    events.normalizedUpKey.pipe(takeUntil(events.line)).forEach(this.onUpKey.bind(this))
    events.normalizedDownKey.pipe(takeUntil(events.line)).forEach(this.onDownKey.bind(this))
    this.render()
    return this
  }
  render(error?: string) {
    let message = ''
    const lowerInput =
      this.currentInput
        .toLowerCase()
        .split(' ')
        .pop() || this.currentInput.toLowerCase()
    const choicesStr = this.renderCode()
    this.suggestions =
      this.suggestionIndex === -1 ? nodeKinds.filter(k => k.toLowerCase().includes(lowerInput)) : this.suggestions
    message += this.paginator.paginate(choicesStr, this.selected || 0, this.opt.pageSize)
    message += `Selector: ${this.currentInput}`
    let bottomContent = `SyntaxKinds Autocomplete (TAB): [${
      this.suggestionIndex !== -1
        ? this.suggestions
        : this.suggestions
            .map(k => {
              const index = k.toLowerCase().indexOf(lowerInput)
              const a = `${chalk.redBright(index === -1 ? '' : k.substring(0, lowerInput.length))}${k.substring(
                index === -1 ? 0 : lowerInput.length,
                k.length
              )}`
              return a
            })
            .map((s, i, a) => (i > 5 ? undefined : s))
            .filter(a => a)
            .join(', ')
    }]
    `.trim()
    if (error) {
      bottomContent = '\n' + chalk.red('>> ') + error
    }
    this.screen.render(message, bottomContent)
  }
  getCurrentValue() {
    return this.selectedNodes[this.selectedNodeIndex]
  }
  protected renderCode() {
    let text = this.sourceFile.getFullText()
    try {
      this.selectedNodes = tsquery(this.sourceFile, this.currentInput)
    } catch (error) {}
    this.selectedNodeIndex < this.selectedNodes.length - 1 ? this.selectedNodeIndex : 0
    let output = ''
    let last = 0
    this.selectedNodes.forEach((node, i) => {
      const nodeText = node.getFullText()
      const painted = this.selectedNodeIndex === i ? chalk.red(nodeText) : chalk.blue(nodeText)
      output = output += text.substring(last, node.getFullStart()) + painted
      last = node.getEnd()
    })
    output += text.substring(last, text.length)
    return output
  }
  onEnd(state: { value: any }) {
    this.status = 'answered'
    this.answer = state.value
    this.render()
    this.screen.done()
    this.done(state.value)
  }
  onError() {
    this.render('Please enter a valid index')
  }
  onUpKey() {
    this.onArrowKey('up')
  }
  onDownKey() {
    this.onArrowKey('down')
  }
  onArrowKey(type: string) {
    if (type === 'up') {
      this.selectedNodeIndex = this.selectedNodeIndex <= 0 ? 0 : this.selectedNodeIndex - 1
    } else if (type === 'down') {
      this.selectedNodeIndex =
        this.selectedNodeIndex >= this.selectedNodes.length - 1
          ? this.selectedNodes.length - 1
          : this.selectedNodeIndex + 1
    }
    // else if (type === 'left') {
    //   this.suggestionIndex === -1 ? this.suggestions.length - 1 : this.suggestionIndex <= 0 ? this.suggestions.length - 1 : this.suggestionIndex - 1
    // }

    // else if (type === 'right') {
    //   this.suggestionIndex = this.suggestionIndex === -1 ? 0 : this.suggestionIndex >= this.suggestions.length - 1 ? 0 : this.suggestionIndex + 1
    // }
    this.onKeypress()
  }
}
/**
 * Adapted from inquirer sources.
 * The paginator keeps track of a pointer index in a list and returns
 * a subset of the choices if the list is too long.
 */
class CustomPaginator {
  pointer: number
  lastIndex: number
  screen: any
  constructor(screen?: any) {
    this.pointer = 0
    this.lastIndex = 0
    this.screen = screen
  }
  paginate(output: string, active: number, pageSize: number | undefined) {
    pageSize = pageSize || 7
    var active_: string[]
    const middleOfList = Math.floor(pageSize / 2)
    let lines = output.split('\n')
    if (this.screen) {
      lines = this.screen.breakLines(lines)
      active_ = lines.splice(0, active)
      lines = _.flatten(lines)
    }
    // Make sure there's enough lines to paginate
    if (lines.length <= pageSize) {
      return output
    }
    // Move the pointer only when the user go down and limit it to the middle of the list
    if (this.pointer < middleOfList && this.lastIndex < active && active - this.lastIndex < pageSize) {
      this.pointer = Math.min(middleOfList, this.pointer + active - this.lastIndex)
    }
    this.lastIndex = active
    // Duplicate the lines so it give an infinite list look
    const section = ['\n', ...lines].splice(active, pageSize).join('\n')
    return (
      section +
      '\n' +
      chalk.dim('(Navigate Nodes using arrows, type tsquery selectors to filter, enter for selecting node)')
    )
  }
}
