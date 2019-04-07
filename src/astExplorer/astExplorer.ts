import { tsquery } from '@phenomnomnominal/tsquery';
import chalk from 'chalk';
import { appendFileSync } from 'fs';
import { Questions } from 'inquirer';
import { map, takeUntil } from 'rxjs/operators';
import * as ts from 'typescript';
import { getChildren, getKindName } from 'typescript-ast-util';
import { AbstractPaginator } from '../base/basicPaginator';
import { CustomBase, InquirerBase, KeyEvent } from '../base/types';
import { nodeKinds } from './nodeKinds';
import { ResultValue } from './types';
const Base = require('inquirer/lib/prompts/base') as typeof CustomBase
const observe = require('inquirer/lib/utils/events')

export class AstExplorer<T extends ResultValue> extends Base implements InquirerBase<T> {
  currentInput: string
  sourceFileNative: ts.SourceFile
  selectedNodeIndex: number = 0
  kindNameSuggestionIndex: number = -1
  kindNameSuggestions: string[] = []
  navigableNativeNodes: ts.Node[] = []
  lastSelectedNode: ts.Node
  code: string
  paginator: AbstractPaginator
  selected: number = 0 //deprecate
  constructor(questions: Questions, rl: any, answers: any) {
    super(questions, rl, answers)
    if (!this.opt.choices) {
      this.throwParamError('choices')
    }
    this.code = this.opt.choices.choices.map((c: { name: any }) => c.name).join('\n')
    this.currentInput = 'Identifier'
    this.rl.line = this.currentInput
    this.sourceFileNative = tsquery.ast(this.code)
    this.selectedNodeIndex = 0
    this.paginator = new AbstractPaginator(this.screen)
    this.navigableNativeNodes = getChildren(this.sourceFileNative)
    this.lastSelectedNode = this.navigableNativeNodes[this.selectedNodeIndex]
    this.opt = {
      ...this.opt,
      validate(val: T) {
        return true
      }
    }
  }


  // RENDER

  render(error2?: string) {
    let message = ''
    const lowerInput =
      this.currentInput
        .toLowerCase()
        .split(' ')
        .pop() || this.currentInput.toLowerCase()
    const { output, error } = this.renderCode()
    this.kindNameSuggestions =
      this.kindNameSuggestionIndex === -1
        ? nodeKinds.filter(k => k.toLowerCase().includes(lowerInput))
        : this.kindNameSuggestions
    message += this.paginator.paginate(output, this.selected || 0, this.opt.pageSize)
    message += `Selector: ${this.currentInput}`
    let bottomContent = `SyntaxKinds Autocomplete (TAB): \n${this.lastSelectedNode ?chalk.greenBright( `Selected "${getKindName(this.lastSelectedNode)}" at pos ${this.lastSelectedNode.pos}`) : ''} - [${
      this.kindNameSuggestionIndex !== -1
        ? this.kindNameSuggestions
        : this.kindNameSuggestions
          .map(k => {
            const index = k.toLowerCase().indexOf(lowerInput)
            const a = `${chalk.redBright(index === -1 ? '' : k.substring(0, lowerInput.length))}${k.substring(
              index === -1 ? 0 : lowerInput.length,
              k.length
            )}`
            return a
          })
          .map((s, i, a) => i > 5 ? undefined : s)
          .filter(a => a)
          .join(', ')
      }]`.trim()
    if (error || error2) {
      bottomContent = '\n' + chalk.red('>> ') + (error || error2)
    }
    this.screen.render(message, bottomContent)
  }

  /** it parses code and could throw! Called by render().  TODO performance perhaps input dont change and nothing change to re-compile   */
  protected renderCode() {
    let text = this.sourceFileNative.getFullText()
    let error: any
    if (this.currentInput) {
      try {
        this.navigableNativeNodes = tsquery(this.sourceFileNative, this.currentInput)
      } catch (er) {
        error = er
      }
    }
    this.selectedNodeIndex < this.navigableNativeNodes.length - 1 ? this.selectedNodeIndex : 0
    let output = ''
    let last = 0
    this.navigableNativeNodes.forEach((node, i) => {
      const nodeText = node.getFullText()
      const painted = this.selectedNodeIndex === i ? chalk.red(nodeText) : chalk.blue(nodeText)
      output = output += text.substring(last, node.getFullStart()) + painted
      last = node.getEnd()
    })
    output += text.substring(last, text.length)
    return { output, error }
  }

  // EVENTS

  onKeypress(e?: KeyEvent) {
    let error: string | undefined
    if (e && e.key && e.key.name === 'left') {
      this.onLeftKey()
    } 
    else if (e && e.key && e.key.name === 'right') {
      this.onRightKey()
    }
    else if (e && e.key && e.key.name === 'tab') {
      //On TAB we advance to next syntax kind suggestion if any. this.currentInput is reset to that value. or show error if no suggestion left
      this.kindNameSuggestionIndex++
      this.kindNameSuggestionIndex >= this.kindNameSuggestions.length ? 0 : this.kindNameSuggestionIndex
      if (!this.kindNameSuggestions[this.kindNameSuggestionIndex]) {
        error = 'No available suggestions'
      } else {
        this.currentInput = this.kindNameSuggestions[this.kindNameSuggestionIndex]
        this.rl.line = this.currentInput
      }
    } else if (e && e.value) {      // is a letter
      this.kindNameSuggestionIndex = -1
      this.currentInput = this.rl.line
    }
    this.lastSelectedNode = this.navigableNativeNodes[this.selectedNodeIndex] || this.lastSelectedNode
    this.render(error)
  }

  onUpKey() {
    if (!this.currentInput) {
      this.navigableNativeNodes = [
        ...getChildren(this.lastSelectedNode.parent&&this.lastSelectedNode.parent.parent ||this.lastSelectedNode.parent||this.lastSelectedNode)
      ]
    }
    this.selectedNodeIndex =
      this.selectedNodeIndex <= 0 ? this.navigableNativeNodes.length - 1 : this.selectedNodeIndex - 1
    this.onKeypress()
  }

  onDownKey() {
    if (!this.currentInput) {
      this.navigableNativeNodes = [
         ...getChildren(this.lastSelectedNode.parent).map(s=>getChildren(s)).flat()
      ]
      this.selectedNodeIndex = 0
    }
    this.selectedNodeIndex =
      this.selectedNodeIndex >= this.navigableNativeNodes.length - 1 ? 0 : this.selectedNodeIndex + 1
    this.onKeypress()
  }
  onLeftKey() {
    if (!this.currentInput) {
      const children = getChildren(this.lastSelectedNode.parent)
      if(children[0] ===this.lastSelectedNode){
        this.navigableNativeNodes = [
            ...getChildren(this.lastSelectedNode && this.lastSelectedNode.parent && this.lastSelectedNode.parent .parent||this.lastSelectedNode.parent||this.lastSelectedNode )
          ]
          this.selectedNodeIndex--
      }
      else {
        this.selectedNodeIndex++
        // this.selectedNodeIndex =
        // this.selectedNodeIndex <= 0 ? this.navigableNativeNodes.length - 1 : this.selectedNodeIndex - 1
      }
    }
    this.onKeypress()
  }

  onRightKey() {
    if (!this.currentInput) {
      const children = getChildren(this.lastSelectedNode.parent)
      if(children[children.length-1] ===this.lastSelectedNode){
        this.navigableNativeNodes = [
            ...getChildren(this.lastSelectedNode)
          ]
          this.selectedNodeIndex=0
      }
      else {
        this.selectedNodeIndex++
        // this.kindNameSuggestionIndex =
        //   this.kindNameSuggestionIndex >= this.navigableNativeNodes.length - 1 ? 0 : this.kindNameSuggestionIndex + 1
      }
    }
    this.onKeypress()
  }


  // LIFE CYCLE and misc utilities

  private onEnd(state: { value: T }) {
    this.status = 'answered'
    this.answer = state.value
    this.render()
    this.screen.done()
    this.done(state.value)
  }
  private onError() {
    this.render('Please enter valid code or selector.')
  }
  getCurrentValue(): T {
    this.lastSelectedNode = this.navigableNativeNodes[this.selectedNodeIndex] || this.lastSelectedNode
    return { selectedNodes: [this.lastSelectedNode] } as any // TODO: check
  }
  private _run(cb: any) {
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

  private log(...args: any[]) {
    appendFileSync('l.log', '\n*** LOG' + args.map(o => JSON.stringify(o)).join(', '))
  }
}
