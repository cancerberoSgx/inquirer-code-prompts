import { tsquery } from '@phenomnomnominal/tsquery';
import chalk from 'chalk';
import { appendFileSync } from 'fs';
import { Questions } from 'inquirer';
import * as _ from 'lodash';
import { map, takeUntil } from 'rxjs/operators';
import { createWrappedNode } from 'ts-morph';
import * as ts from 'typescript';
import { getChildren } from 'typescript-ast-util';
import { nodeKinds } from './nodeKinds';
import { ResultValue } from './types';
import { CustomBase, InquirerBase, KeyEvent } from "../base/types";
import { Keys } from 'cli-driver/lib/src/ansi';
import { AbstractPaginator } from '../base/basicPaginator';
const Base = require('inquirer/lib/prompts/base') as typeof CustomBase
const observe = require('inquirer/lib/utils/events')

export class AstExplorer<T extends ResultValue> extends Base implements InquirerBase<T> {
  currentInput: string
  // sourceFile: SourceFile
  sourceFileNative: ts.SourceFile
  selectedNodeIndex: number = 0
  kindNameSuggestionIndex: number = -1
  kindNameSuggestions: string[] = []
  // navigableNodes: ts.Node[] = []
  // kindNameSuggestions:string[]
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
    const rows = process.stdout.rows || 24
    // this.min = 0
    // this.max = Math.max(this.opt.choices.choices.length, rows) - rows + 1
    this.currentInput = 'Identifier'
    this.rl.line = this.currentInput
    // TODO: check exception because of bad code and report
    this.sourceFileNative = tsquery.ast(this.code)
    // this.sourceFile = createWrappedNode(this.sourceFileNative)
    this.selectedNodeIndex = 0
    this.paginator = new AbstractPaginator(this.screen)
    // this.sourceFileNative = getChild
    // this.navigableNodes = getChildrenForEachChild(this.sourceFile)
    this.navigableNativeNodes = getChildren(this.sourceFileNative)
    // this.currentTreeNavigationNode
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
    // let output = ''
    // try {
    const { output, error } = this.renderCode()
    // } catch c(er) {
    // error = er + ''
    // }
    this.kindNameSuggestions =
      this.kindNameSuggestionIndex === -1
        ? nodeKinds.filter(k => k.toLowerCase().includes(lowerInput))
        : this.kindNameSuggestions
    message += this.paginator.paginate(output, this.selected || 0, this.opt.pageSize)
    message += `Selector: ${this.currentInput}`
    let bottomContent = `SyntaxKinds Autocomplete (TAB): [${
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
            .map((s, i, a) => (i > 5 ? undefined : s))
            .filter(a => a)
            .join(', ')
    }]
    `.trim()
    if (error || error2) {
      bottomContent = '\n' + chalk.red('>> ') + (error || error2)
    }
    this.screen.render(message, bottomContent)
  }
  /** it parses code and could throw! Called by render().  TODO performance perhaps input dont change and nothing change to re-compile   */
  protected renderCode() {
    let text = this.sourceFileNative.getFullText()
    let error: any
    // if (this.currentInput === '') {
    //   // this.currentTreeNavigationNode = this.currentTreeNavigationNode || this.sourceFile
    //   this.navigableNativeNodes = [
    //     // ...getAscendants(this.lastSelectedNode),
    //      ...getChildren(this.lastSelectedNode),
    //      ...getChildren(this.lastSelectedNode.parent)]
    // }
    // else {
    if (this.currentInput) {
      try {
        this.navigableNativeNodes = tsquery(this.sourceFileNative, this.currentInput)
        // this.navigableNativeNodes = wrapNodes(this.navigableNativeNodes, this.sourceFileNative)
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
    if(Keys.name==='left'){
      this.onLeftKey()
    }
    else if(Keys.name==='right'){
      this.onRightKey()
    }
    // this.log('onKeypress')
    else if (e && e.key.name === 'tab') {
      //On TAB we advance to next syntax kind suggestion if any. this.currentInput is reset to that value. or show error if no suggestion left
      this.kindNameSuggestionIndex++
      this.kindNameSuggestionIndex >= this.kindNameSuggestions.length ? 0 : this.kindNameSuggestionIndex
      if (!this.kindNameSuggestions[this.kindNameSuggestionIndex]) {
        error = 'No available suggestions'
      } else {
        this.currentInput = this.kindNameSuggestions[this.kindNameSuggestionIndex]
        this.rl.line = this.currentInput
      }
    } else if (e && e.value) {
      // is a letter
      this.kindNameSuggestionIndex = -1
      this.currentInput = this.rl.line
    }
    // this.log(this.currentInput, e);
    this.render(error)
  }

  onUpKey() {
    if (!this.currentInput) {
      // this.currentTreeNavigationNode = this.currentTreeNavigationNode || this.sourceFile
      this.navigableNativeNodes = [
        
        // this.lastSelectedNode, 

        // ...getAscendants(this.lastSelectedNode)
        //   //  ...getChildren(this.lastSelectedNode),
           ...getChildren(this.lastSelectedNode.parent)
      ]
    }
    // else {
    this.selectedNodeIndex =
      this.selectedNodeIndex <= 0 ? this.navigableNativeNodes.length - 1 : this.selectedNodeIndex - 1
    // }
    this.onKeypress()
  }
  onDownKey() {
    if (!this.currentInput) {
      // this.currentTreeNavigationNode = this.currentTreeNavigationNode || this.sourceFile
      this.navigableNativeNodes = [
        // ...getAscendants(this.lastSelectedNode),
        // ...
        ...getChildren(this.lastSelectedNode)
        //  ...getChildren(this.lastSelectedNode.parent).map(s=>getChildren(s)).flat()
      ]
      this.selectedNodeIndex = 0
    }
    // else {

    this.selectedNodeIndex =
      this.selectedNodeIndex >= this.navigableNativeNodes.length - 1 ? 0 : this.selectedNodeIndex + 1
    // }
    // this.onArrowKey('down')
    this.onKeypress()
  }
  onLeftKey() {
    // this.log('onLeftKey')

    if (!this.currentInput) {
      // this.currentTreeNavigationNode = this.currentTreeNavigationNode || this.sourceFile
      // this.navigableNativeNodes = [
      //   // ...getAscendants(this.lastSelectedNode),
      //   //  ...getChildren(this.lastSelectedNode),
      //   ...getChildren(this.lastSelectedNode.parent)
      // ]
      // this.selectedNodeIndex=0
    }
    // this.onArrowKey('down')
    this.selectedNodeIndex =
      this.selectedNodeIndex < 0 ? this.navigableNativeNodes.length - 1 : this.selectedNodeIndex - 1
    this.onKeypress()
  }
  onRightKey() {
    // this.log('right')
    if (!this.currentInput) {
      // this.currentTreeNavigationNode = this.currentTreeNavigationNode || this.sourceFile
      // this.navigableNativeNodes = [
      //   // ...getAscendants(this.lastSelectedNode),
      //   //  ...getChildren(this.lastSelectedNode),
      //   ...getChildren(this.lastSelectedNode.parent)
      // ]
      // this.selectedNodeIndex=0
    }
    this.kindNameSuggestionIndex =
      this.kindNameSuggestionIndex >= this.navigableNativeNodes.length - 1 ? 0 : this.kindNameSuggestionIndex + 1
    //  === -1 ? 0 : this.kindNameSuggestionIndex >= this.kindNameSuggestions.length - 1 ? 0 : this.kindNameSuggestionIndex + 1
    this.onKeypress()
  }
  // onArrowKey(type: string) {

  //   this.log('onArrowKey')
  // if (type === 'up') {
  //   this.log('up')
    
  // //   this.selectedNodeIndex = this.selectedNodeIndex <= 0 ? 0 : this.selectedNodeIndex - 1
  // // } else if (type === 'down') {
  // //   this.selectedNodeIndex =        this.selectedNodeIndex >= this.navigableNodes.length - 1          ? this.navigableNodes.length - 1          : this.selectedNodeIndex + 1
  // }
  // else if (type === 'left') {
  //   this.onLeftKey()
  //   this.log('onLeftKey')

  // //   this.kindNameSuggestionIndex === -1 ? this.suggestions.length - 1 : this.kindNameSuggestionIndex <= 0 ? this.suggestions.length - 1 : this.kindNameSuggestionIndex - 1
  // }

  // else if (type === 'right') {
  //   this.log('onRightKey')

  //   this.onRightKey()
  // //   this.kindNameSuggestionIndex = this.kindNameSuggestionIndex === -1 ? 0 : this.kindNameSuggestionIndex >= this.suggestions.length - 1 ? 0 : this.kindNameSuggestionIndex + 1
  // // }
  // // this.onKeypress()
  // }
// }



// LIFE CYCLE and misc utililities

private onEnd(state: { value: T }) {
  this.status = 'answered'
  this.answer = state.value
  this.render()
  this.screen.done()
  // this.log(state, state.value)
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
    // events.normalizedRightKey.pipe(takeUntil(events.line)).forEach(this.onRightKey.bind(this))
    // events.normalizedLeftKey.pipe(takeUntil(events.line)).forEach(this.onLeftKey.bind(this))
    this.render()
    return this
  }

  private log(...args: any[]) {
    appendFileSync('l.log', '\n*** LOG' + args.map(o => JSON.stringify(o)).join(', '))
  }

}
