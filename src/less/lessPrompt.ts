import { objects, prompt, Questions } from 'inquirer'
import * as _ from 'lodash'
import { AbstractPaginator } from '../base/basicPaginator'
import { CustomBase } from '../base/types'
const { map, takeUntil } = require('rxjs/operators')
const Base = require('inquirer/lib/prompts/base') as typeof CustomBase
const observe = require('inquirer/lib/utils/events')
const wrapAnsi = require('wrap-ansi')

/**
 * unix `less` command like prompt to render large text with pagination. WHen pressing enter it exits.
 *
 * Usage:
```ts
import {less, Less} form 'inquirer-less'
registerPrompt('less', Less as any)
await less({text: `long text possible with ansi styles`})
```
 *
 * TODO: move to its own project
 */
export async function less(options: Options): Promise<any> {
  const columns = process.stdout.columns || 79
  const rows = process.stdout.rows || 24
  const s = options.noWrap ? options.text : wrapAnsi(options.text, columns - 4, { trim: false, wordWrap: true })
  return await prompt([
    {
      type: 'less',
      name: ' ',
      choices: s.split('\n'),
      prefix: options.prefix || '',
      //@ts-ignore
      paginated: true,
      pageSize: options.pageSize || Math.min(options.pageSize || Infinity, rows)
    }
  ])
}
interface Options {
  text: string
  pageSize?: number
  prefix?: string
  postfix?: string
  noWrap?: boolean
}

export class Less extends Base {
  min: number
  max: number
  selected: number
  rawDefault: number

  constructor(questions: Questions, rl: any, answers: any) {
    super(questions, rl, answers)
    if (!this.opt.choices) {
      this.throwParamError('choices')
    }
    const rows = process.stdout.rows || 24
    this.min = 0
    this.max = Math.max(this.opt.choices.length, rows) - rows + 1
    this.selected = 0
    this.rawDefault = 0
    Object.assign(this.opt, {
      validate: function(val: any) {
        return true
      }
    })
    this.opt.default = null
    this.paginator = new AbstractPaginator(this.screen)
  }
  protected _run(cb: any) {
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
    const bottomContent = ''
    const choicesStr = this.renderText(this.opt.choices, this.selected)
    message += this.paginator.paginate(choicesStr, this.selected, this.opt.pageSize)
    message += this.rl.line
    this.screen.render(message, bottomContent)
  }
  getCurrentValue(index: string | number) {
    return null
  }
  onEnd(state: any) {
    this.status = 'answered'
    this.answer = state.value
    this.render()
    this.screen.done()
    this.done(state.value)
  }
  onError() {
    this.render('Please enter a valid index')
  }
  onKeypress() {
    const index = this.rl.line.length ? Number(this.rl.line) - 1 : 0
    this.selected = index
    this.render()
  }
  onUpKey() {
    this.onArrowKey('up')
  }
  onDownKey() {
    this.onArrowKey('down')
  }
  onArrowKey(type: string) {
    let index = this.rl.line.length ? Number(this.rl.line) - 1 : 0
    if (type === 'up') index = index <= this.min ? this.min : index - 1
    else index = index >= this.max ? this.max : index + 1
    this.rl.line = String(index + 1)
    this.onKeypress()
  }
  protected renderText(choices: objects.ChoiceOption<any>[], pointer: any) {
    let output = ''
    choices.forEach(function(choice, i) {
      output += '\n'
      const display = choice.name
      output += display
    })
    return output
  }
}
